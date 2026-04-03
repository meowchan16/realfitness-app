import mongoose from "mongoose";

const taskCompletionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    date: {
      type: String,
      required: true
    },
    completionsByTask: {
      type: Map,
      of: Boolean,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

taskCompletionSchema.index({ user: 1, date: 1 }, { unique: true });

const TaskCompletion = mongoose.model("TaskCompletion", taskCompletionSchema);

export default TaskCompletion;
