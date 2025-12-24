import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    firstName: {
      type: String,
      required: true,
      trim: true
    },

    lastName: {
      type: String,
      required: true,
      trim: true
    },

    phone: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true,
      lowercase: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Employee", employeeSchema);
