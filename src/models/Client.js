import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
  {
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

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },

    phone: {
      type: String,
      required: true
    },

    country: {
      type: String,
      required: true
    },

    state: {
      type: String,
      required: true
    },

    assignedEmployee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true
    },

    timeZone: {
      type: String,
      required: true
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Client", clientSchema);
