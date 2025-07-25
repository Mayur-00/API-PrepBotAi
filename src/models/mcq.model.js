const mongoose = require("mongoose")


const mcqSchema = new mongoose.Schema(
    {

        owner:{
            type:mongoose.Schema.Types.ObjectId,
            required:true,
            index:true
        },
        title: {
            type: String,
            required: [true, "title is required"],
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        questions:[],
        isActive:{
            type:Boolean,
            required:true,
            default:true
        },
        isCompleted:{
            type:Boolean,
            required:true,
            default:false
        },
        score:{
            type:Number,
            required:false,
            default:0
        }
    }, {
    timestamps: true
}
);






 const Mcq = mongoose.model("Mcq", mcqSchema);

 module.exports = Mcq