import crypto from "crypto";
import User from "../models/User.js";
import Client from "../models/Client.js";

export const createClient = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      country,
      state,
      timeZone,
      gender,
      assignedEmployee
    } = req.body;

    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

   
    const user = await User.create({
      email,
      role: "CLIENT"
    });

    
    const client = await Client.create({
      firstName,
      lastName,
      email,
      phone,
      country,
      state,
      timeZone,
      gender,
      assignedEmployee
    });

    
    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 7 * 24 * 60 * 60 * 1000;
    await user.save();

    //sendResetEmail
    const resetUrl=`${process.env.FRONTEND_URL}/reset-password/${token}`;

    await sendEmail({
        to: user.email,
        subject: "Reset Your Password",
        html: `
        <p>You have been added as a client.</p>
        <p>Click below to set your password (valid for 7 days):</p>
        <a href="${resetUrl}">${resetUrl}</a>
      `

    })

    res.status(201).json({
      message: "Client created and reset link sent",
      clientId: client._id
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const resendResetLink = async (req, res) => {
  try {
    const { clientId } = req.params;

    
    const user = await User.findOne({
      _id: clientId,
      role: "CLIENT"
    });

    if (!user) {
      return res.status(404).json({
        message: "Client not found"
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 7 * 24 * 60 * 60 * 1000;

    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    await sendEmail({
        to: user.email,
        subject: "Reset Your Password",
        html: `
        <p>Click below to reset your password (valid for 7 days):</p>
        <a href="${resetUrl}">${resetUrl}</a>
      `
    });

    res.status(200).json({
      message: "Reset password link resent successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};