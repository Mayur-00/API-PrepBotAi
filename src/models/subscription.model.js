const mongoose = require("mongoose");


const subscriptionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        plan: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SubscriptionPlan",
            required: true,
        },
        status: {
            type: String,
            enum: ["active", "cancelled", "expired", "pending", "suspended"],
            default: "pending",
            index: true
        },
        startDate: {
            type: Date,
            required: true,
            default: Date.now,
        },

        endDate: {
            type: Date,
            required: true,
        },

        paymentMethod: {
            type: String,
            enum: [ "razorpay",  "manual"],
            required: true
        },
      
        usage: {
            mcqsGenerated: {
                type: Number,
                default: 0
            },
            mcqsRemaining: {
                type: Number,
                default: 0
            },
            pdfExported: {
                type: Number,
                default: 0
            },
        pdfExportRemaining: {
                type: Number,
                default: 0
            }
        },
        lastBillingDate: {
            type: Date
        },
        nextBillingDate: {
            type: Date
        },
        cancelledAt: {
            type: Date
        },
        cancelReason: {
            type: String
        }
    },
    {
        timestamps: true
    }
);


// Indexes for performance
subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ endDate: 1, status: 1 });


// Method to check if subscription is active and not expired
subscriptionSchema.methods.isActive = function() {
    return this.status === 'active' && this.endDate > new Date();
};
subscriptionSchema.methods.isExpired = function() {
    return new Date() > this.endDate;
};

subscriptionSchema.methods.canGenerateMcq = function() {
    return this.isActive() && this.usage.mcqsRemaining > 0;
};
subscriptionSchema.methods.canExportPdf = function() {
    return this.isActive() && this.usage.pdfExportRemaining > 0;
};

const Subscription = mongoose.model("Subscription", subscriptionSchema);
module.exports = Subscription;
