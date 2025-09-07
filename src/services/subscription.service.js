const User = require("../models/user.model.js");
const SubscriptionPlan = require("../models/subscriptionPlan.model.js");
const Subscription = require("../models/subscription.model.js");
const UsageLog = require("../models/usage.model.js");



class subscriptionService {
     // Create a new subscription


    async createSubscription(userId, plan, paymentMethod = 'razorpay') {
        try {
            const user = await User.findById(userId);
            
            if (!user) throw new Error('User not found');
            if (!plan) throw new Error('Plan not found');

            // Calculate end date based on billing cycle
            const startDate = new Date();
            const endDate = new Date(startDate);
            if (plan.billingCycle === 'monthly') {
                endDate.setMonth(endDate.getMonth() + 1);
            } else {
                endDate.setFullYear(endDate.getFullYear() + 1);
            }

          
            // Create subscription
            const subscription = new Subscription({
                user: userId,
                plan: plan._id,
                status: 'pending',
                startDate,
                endDate,
                paymentMethod,
                usage: {
                    mcqsGenerated: 0,
                    mcqsRemaining: plan.features.mcqsPerMonth,
                    pdfExported: 0,
                    pdfExportRemaining: plan.features.exportsPerMonth
                }
            });

            await subscription.save();
            return subscription;
        } catch (error) {
            throw new Error(`Subscription creation failed: ${error.message}`);
        }
    };


      // Activate subscription after successful payment
    async activateSubscription(subscriptionId, razorpayData = {}) {
        try {
            const subscription = await Subscription.findById(subscriptionId);
            if (!subscription) throw new Error('Subscription not found');

            subscription.status = 'active';
            // subscription.razorpaySubscriptionId = razorpayData.subscriptionId;
            // subscription.razorpayCustomerId = razorpayData.customerId;
            subscription.lastBillingDate = new Date();
            
            // Set next billing date
            const nextBilling = new Date();
            const plan = await SubscriptionPlan.findById(subscription.plan);
            if (plan.billingCycle === 'monthly') {
                nextBilling.setMonth(nextBilling.getMonth() + 1);
            } else {
                nextBilling.setFullYear(nextBilling.getFullYear() + 1);
            }
            subscription.nextBillingDate = nextBilling;

            await subscription.save();

            // Update user's current subscription
            await User.findByIdAndUpdate(subscription.user, {
                currentSubscription: subscriptionId,
                $push: { SubscriptionHistory: subscriptionId }
            });

            return subscription;
        } catch (error) {
            throw new Error(`Subscription activation failed: ${error.message}`);
        }
    };


     async cancelSubscription(subscriptionId, reason = '') {
        try {
            const subscription = await Subscription.findById(subscriptionId);
            if (!subscription) throw new Error('Subscription not found');

            subscription.status = 'cancelled';
            subscription.cancelledAt = new Date();
            subscription.cancelReason = reason;
            subscription.autoRenew = false;

            // Cancel in Razorpay if exists
            if (subscription.razorpaySubscriptionId) {
                await razorpayService.cancelSubscription(subscription.razorpaySubscriptionId);
            }

            await subscription.save();
            return subscription;
        } catch (error) {
            throw new Error(`Subscription cancellation failed: ${error.message}`);
        }
    };

     async logUsage(userId, subscriptionId, action, quantity = 1, metadata = {}) {
        try {
            const usageLog = new UsageLog({
                user: userId,
                subscription: subscriptionId,
                action,
                quantity,
                metadata
            });

            await usageLog.save();

            // Update subscription usage
            const subscription = await Subscription.findById(subscriptionId);
            if (subscription) {
                switch (action) {
                    case 'mcq_generated':
                        subscription.usage.mcqsGenerated += quantity;
                        subscription.usage.mcqsRemaining = Math.max(0, subscription.usage.mcqsRemaining - quantity);
                        break;
                    case 'pdf_exported':
                        subscription.usage.pdfExported += quantity;
                        subscription.usage.pdfExportRemaining = Math.max(0, subscription.usage.pdfExportRemaining - quantity);
                        break;
                }
                await subscription.save();
            }

            return usageLog;
        } catch (error) {
            throw new Error(`Usage logging failed: ${error.message}`);
        }
    };

     // Check and expire subscriptions
    async checkExpiredSubscriptions() {
        try {
            const expiredSubscriptions = await Subscription.find({
                status: 'active',
                endDate: { $lt: new Date() }
            });

            for (const subscription of expiredSubscriptions) {
                subscription.status = 'expired';
                await subscription.save();

                // Remove from user's current subscription
                await User.findByIdAndUpdate(subscription.user, {
                    $unset: { currentSubscription: 1 }
                });
            }

            return expiredSubscriptions.length;
        } catch (error) {
            throw new Error(`Expired subscription check failed: ${error.message}`);
        }
    }

    // Get user's subscription details
    async getUserSubscription(userId) {
        try {
            const user = await User.findById(userId).populate({
                path: 'currentSubscription',
                populate: {
                    path: 'plan',
                    model: 'SubscriptionPlan'
                }
            });

            return user.currentSubscription;
        } catch (error) {
            throw new Error(`Failed to get user subscription: ${error.message}`);
        }
    }

    // Reset monthly usage (run as cron job)
    async resetMonthlyUsage() {
        try {
            const monthlySubscriptions = await Subscription.find({
                status: 'active'
            }).populate('plan');

            for (const subscription of monthlySubscriptions) {
                if (subscription.plan.billingCycle === 'monthly') {
                    await subscription.resetUsage();
                }
            }

            return monthlySubscriptions.length;
        } catch (error) {
            throw new Error(`Monthly usage reset failed: ${error.message}`);
        }
    }
};

module.exports = new subscriptionService();