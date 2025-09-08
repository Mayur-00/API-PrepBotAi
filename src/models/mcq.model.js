const mongoose = require("mongoose");

const mcqSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
      ref: "User" // optional, if you reference User collection
    },
    title: {
      type: String,
      required: [true, "title is required"],
      lowercase: true,
      trim: true,
    },
    questions: [],
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
    isCompleted: {
      type: Boolean,
      required: true,
      default: false,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium", // lowercase for consistency
    },
    subject: {
      type: String,
      default: "none",
    },
  },
  { timestamps: true }
);

// ✅ enforce unique title per owner
mcqSchema.index({ owner: 1, title: 1 }, { unique: true });

// additional index to optimize queries
mcqSchema.index({ subject: 1, difficulty: 1 });

const Mcq = mongoose.model("Mcq", mcqSchema);
module.exports = Mcq;
