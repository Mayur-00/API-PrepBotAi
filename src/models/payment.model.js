const mongoose  = require("mongoose");

const paymentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        subscription: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subscription",
            required: true
        },
        amount: {
            type: Number,
            required: true,
            min: 0
        },
        currency: {
            type: String,
            required: true,
            uppercase: true
        },
        status: {
            type: String,
            enum: ["pending", "completed", "failed", "cancelled", "refunded"],
            default: "pending",
            index: true
        },
       paymentMethod: {
            type: String,
            enum: ["razorpay", "manual"],
            required: true
        },
        // Razorpay specific fields
        razorpayOrderId: {
            type: String,
            index: true
        },
        razorpayPaymentId: {
            type: String,
            index: true
        },
        razorpaySignature: {
            type: String
        },
        paymentDate: {
            type: Date
        },
        failureReason: {
            type: String
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed
        }
    },
    {
        timestamps: true
    }
);

paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ externalTransactionId: 1 });

const Payment = mongoose.model("Payment", paymentSchema);
module.exports = Payment;
