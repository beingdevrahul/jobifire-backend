import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

export const resetPassword = async (req, res) => {
    try {
        const {token}= req.params;
        const {newPassword}= req.body;

        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        const user=await User.findOne({
            resetPasswordToken:hashedToken,
            resetPasswordExpires:{$gt:Date.now()}
        });

        if(!user){
            return res.status(400).json({message:"Invalid or expired token"});
        }

        user.password=await bcrypt.hash(newPassword,10);
        user.status="ONBOARDED";
        user.emailVerified=true;
        user.resetPasswordToken=undefined;
        user.resetPasswordExpires=undefined;
        await user.save();

        res.status(200).json({message:"Password reset successful"});

    }
    catch(error){
        res.status(500).json({message:"Server error", error:error.message});
    }
}


export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user || user.status !== "ONBOARDED") {
      return res.status(400).json({
        message: "Invalid request"
      });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    user.forgotPasswordToken = hashedToken;
    user.forgotPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 mins
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}&type=forgot`;

    await sendEmail({
      to: email,
      subject: "Reset your password",
      html: `
        <p>Click below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
      `
    });

    res.json({
      message: "Password reset link sent"
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const resetForgotPassword = async (req, res) => {
  try {
    const { token } = req.query;
    const { newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match"
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      forgotPasswordToken: hashedToken,
      forgotPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        message: "Token invalid or expired"
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpires = undefined;

    await user.save();

    res.json({
      message: "Password reset successful"
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};