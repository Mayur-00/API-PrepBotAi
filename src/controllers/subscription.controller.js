const Subscription = require("../models/subscription.model.js");
const SubscriptionPlan = require("../models/subscriptionPlan.model.js");
const Razorpay = require("razorpay");
const Payment = require("../models/payment.model.js");
const asyncHandler = require("../utils/asyncHandler.js");
const { ApiError } = require("../utils/apiError.js")
const { ApiResponse } = require("../utils/apiResponse.js");
const subscriptionService = require("../services/subscription.service.js");
const razorpayService = require("../services/razorpay.service.js");

const createSubscriptionOrder = asyncHandler(async (req, res) => {
    const { planId } = req.body;

    const sessionUserId = req.user._id;

    const plan = await SubscriptionPlan.findById(planId).lean()
    if (!plan) {
        throw new ApiError(404, "Plan Not Found");
    };

    const subscription = await subscriptionService.createSubscription(sessionUserId, planId)

    const order = await razorpayService.createOrder(plan.price, plan.currency, `sub_${subscription._id}`);

    const payment = new Payment({
        user: sessionUserId,
        subscription: subscription._id,
        amount: plan.price,
        currency: plan.currency,
        status: 'pending',
        paymentMethod: "razorpay",
        razorpayOrderId: order.id
    });

    await payment.save();

    res.status(201).json(
        new ApiResponse(201, { subscription, order, payment: payment._id }, "created")
    );
});

const verifyPayment = asyncHandler(async (req, res) => {
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        subscriptionId
    } = req.body;

    const isValid = razorpayService.verifyPaymentSignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
    );


    if (!isValid) {
        throw new ApiError(400, "Invalid payment signature");
    };

    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
    if (!payment) {
        throw new ApiError(404, "payment data not found")
    };


    payment.status = 'completed';
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.paymentDate = new Date();
    await payment.save();

    const subscription = await subscriptionService.activateSubscription(subscriptionId);

    res.status(200).json(
        new ApiResponse(200, subscription, "Subscription activated successfully")
    );

});

const cancelSubscription = asyncHandler(async (req, res) => {

    const { subscriptionId } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;

    // Verify subscription belongs to user
    const subscription = await subscriptionService.getUserSubscription(userId);
    if (!subscription || subscription._id.toString() !== subscriptionId) {
        throw new ApiError(403,'Unauthorized' );
       
    };

    const cancelledSubscription = await subscriptionService.cancelSubscription(
        subscriptionId,
        reason
    );
res.status(200).json(
    new ApiResponse(200, cancelledSubscription,'Subscription cancelled successfully' )
);
});

const getPlans = asyncHandler(async (req, res) => {

      const plans = await SubscriptionPlan.find({ isActive: true })
                .sort({ sortOrder: 1 });
            
            res.status(200).json(
                new ApiResponse(200, plans, "success")
            );
});



module.exports = {createSubscriptionOrder, verifyPayment, getPlans, cancelSubscription};