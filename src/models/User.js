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

    resetPasswordToken: String,
    resetPasswordExpires: Date
  },
  { timestamps: true }
);