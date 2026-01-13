import mongoose from "mongoose";
import { type } from "os";

const employeeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
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
    },
    employeeRole:{
      type: String,
      enum:["JCR Search","Resume Writer","Counsellor"],
      required:true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Employee", employeeSchema);
