const Razorpay = require("razorpay");
const crypto = require("crypto");

class razorpayService {
    constructor(){
       this.razorpay = new Razorpay({
         key_id:process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
       });
    }

    
    async createPlan(planData) {
        try {
            const plan = await this.razorpay.plans.create({
                period: planData.billingCycle === 'monthly' ? 'monthly' : 'yearly',
                interval: 1,
                item: {
                    name: planData.name,
                    amount: planData.price * 100, // Amount in paise
                    currency: planData.currency,
                    description: planData.description
                }
            });
            return plan;
        } catch (error) {
            throw new Error(`Razorpay plan creation failed: ${error.message}`);
        }
    }

      async createCustomer(userData) {
        try {
            const customer = await this.razorpay.customers.create({
                name: userData.username,
                email: userData.email,
                fail_existing: 0
            });
            return customer;
        } catch (error) {
            throw new Error(`Razorpay customer creation failed: ${error.message}`);
        }
    }

    async createSubscription(planId, customerId, totalCount = null) {
        try {
            const subscriptionData = {
                plan_id: planId,
                customer_id: customerId,
                quantity: 1
            };

            if (totalCount) {
                subscriptionData.total_count = totalCount;
            }

            const subscription = await this.razorpay.subscriptions.create(subscriptionData);
            return subscription;
        } catch (error) {
            throw new Error(`Razorpay subscription creation failed: ${error.message}`);
        }
    }


     async createOrder(amount, currency = 'INR', receipt = null) {
        try {
            const order = await this.razorpay.orders.create({
                amount: amount * 100, // Amount in paise
                currency: currency,
                receipt: receipt || `receipt_${Date.now()}`,
                payment_capture: 1
            });
            return order;
        } catch (error) {
            throw new Error(`Razorpay order creation failed: ${error.message}`);
        }
    }

    // Verify payment signature
    verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature) {
        const body = razorpayOrderId + "|" + razorpayPaymentId;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");
        
        return expectedSignature === razorpaySignature;
    }

    // Verify subscription webhook signature
    verifyWebhookSignature(payload, signature) {
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
            .update(payload)
            .digest("hex");
        
        return expectedSignature === signature;
    }

    // Cancel subscription
    async cancelSubscription(subscriptionId) {
        try {
            const subscription = await this.razorpay.subscriptions.cancel(subscriptionId);
            return subscription;
        } catch (error) {
            throw new Error(`Razorpay subscription cancellation failed: ${error.message}`);
        }
    }

    // Fetch subscription details
    async getSubscription(subscriptionId) {
        try {
            return await this.razorpay.subscriptions.fetch(subscriptionId);
        } catch (error) {
            throw new Error(`Failed to fetch subscription: ${error.message}`);
        }
    }

    // Fetch payment details
    async getPayment(paymentId) {
        try {
            return await this.razorpay.payments.fetch(paymentId);
        } catch (error) {
            throw new Error(`Failed to fetch payment: ${error.message}`);
        }
    }
};


module.exports = new razorpayService();