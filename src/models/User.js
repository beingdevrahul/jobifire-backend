import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },

    password: {
      type: String
    },

    role: {
      type: String,
      enum: ["ADMIN", "EMPLOYEE", "CLIENT"],
      required: true
    },

    status:{
      type: String,
      enum:["INVITED","ONBOARDED"],
      default:"INVITED"
    },

    emailVerified: {
      type: Boolean,
      default: false
    },

    resetPasswordToken: String,
    resetPasswordExpires: Date,

    forgotPasswordToken: String,
    forgotPasswordExpires: Date,

  },
  
  { timestamps: true }
);

export default mongoose.model("User", userSchema);