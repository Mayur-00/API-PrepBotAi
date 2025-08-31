const mongoose = require("mongoose");

const subscriptionPlanSchema = new mongoose.Schema(
    {
        name: {
            type:String,
            required:true,
            unique:true,
            trim:true,

        },
        description:{
            type:String,
            require:true
        },

        price : {
            type: Number,
            require:true,
            min:0
        },

        description : {
            type:String,
            required:true
        },

        currency : {
            type : String,
            enum : ["INR", "USD"],
            default : "USD",
            required : true,
            uppercase: true
        },
        billingCylcle : {
            type:String,
            enum : ["monthly", "yearly"],
            required : true,
        },
        features : {
            mcqsPerMonth : {
                type:Number,
                required : true,
                min:0
            },
            exportsPerMonth : {
                type:Number,
                required:true,
                min: 0
            },
            maxQuestionsPerMcq : {
                type: Number,
                default : 10
            },
            apiAccess : {
                type:Boolean,
                default : false
            },

        },

         stripeProductId: {
            type: String,
            sparse: true
        },
        stripePriceId: {
            type: String,
            sparse: true
        },
        isActive: {
            type: Boolean,
            default: true
        },
        sortOrder: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps:true
    }
);

subscriptionPlanSchema.index({ isActive: 1, sortOrder: 1 });

const SubscriptionPlan = mongoose.model("SubscriptionPlan", subscriptionPlanSchema);
module.exports = SubscriptionPlan;