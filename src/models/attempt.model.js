const { mongoose } = require("mongoose");


const attemptSchema = new mongoose.Schema(
    {
        attemptedBy:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            index:true
        },
        attemptedMcq:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Mcq",
            index:true
        },
        timeTaken : {
            type:Number
        },
        score : {
            type:Number
        }
    },
    {
        timestamps:true
    }
);

attemptSchema.index({ owner: 1, attemptedMcq: 1 });

const Attempt = mongoose.model("Attempt", attemptSchema);

module.exports = Attempt;