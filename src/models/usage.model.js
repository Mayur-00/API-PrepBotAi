const  Mongoose = require("mongoose");

const usageLogSchema = new Mongoose.Schema(
    {
        user: {
            type: Mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        subscription: {
            type: Mongoose.Schema.Types.ObjectId,
            ref: "Subscription",
            required: true
        },
        action: {
            type: String,
            enum: ["mcq_generated", "pages_processed", "storage_used", "mcq_attempted"],
            required: true,
            index: true
        },
        resourceId: {
            type: Mongoose.Schema.Types.ObjectId, // Reference to MCQ or other resource
            ref: "Mcq"
        },
        quantity: {
            type: Number,
            required: true,
            min: 0
        },
        metadata: {
            fileName: String,
            fileSize: Number,
            difficulty: String,
            questionsCount: Number,
            processingTime: Number
        }
    },
    {
        timestamps: true
    }
);

usageLogSchema.index({ user: 1, createdAt: -1 });
usageLogSchema.index({ subscription: 1, action: 1, createdAt: -1 });

const UsageLog = Mongoose.model("UsageLog", usageLogSchema);
module.exports = UsageLog;