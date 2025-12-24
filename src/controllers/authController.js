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
        user.resetPasswordToken=undefined;
        user.resetPasswordExpires=undefined;
        await user.save();

        res.status(200).json({message:"Password reset successful"});

    }
    catch(error){
        res.status(500).json({message:"Server error", error:error.message});
    }
}