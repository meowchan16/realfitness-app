import mongoose from "mongoose";

const workoutDaySchema = new mongoose.Schema(
  {
    title: String,
    tasks: [String]
  },
  { _id: false }
);

const workoutPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    schedule: {
      Monday: workoutDaySchema,
      Tuesday: workoutDaySchema,
      Wednesday: workoutDaySchema,
      Thursday: workoutDaySchema,
      Friday: workoutDaySchema,
      Saturday: workoutDaySchema,
      Sunday: workoutDaySchema
    }
  },
  {
    timestamps: true
  }
);

const WorkoutPlan = mongoose.model("WorkoutPlan", workoutPlanSchema);

export default WorkoutPlan;
