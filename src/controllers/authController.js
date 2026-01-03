import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";
import jwt from "jsonwebtoken";


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

   
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    
    if (user.status !== "ONBOARDED") {
      return res.status(403).json({
        message: "Account not active. Please complete onboarding."
      });
    }

    
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
       
// set HTTP-only cookie
res.cookie("token", token, {
  httpOnly: true,
  maxAge: 24 * 60 * 60 * 1000, // 1 day
  sameSite: "lax",    
   path : "/" ,       // works on localhost
});

   
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

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


export const getResetPasswordInfo = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        message: "Reset token is required"
      });
    }
     const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    }).select("email role status");

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset token"
      });
    }

    return res.status(200).json({
      email: user.email,
      role: user.role,
      status: user.status
    });

  } catch (error) {
    console.error("Reset info error:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};


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

    const { token, newPassword, confirmPassword } = req.body;

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