import crypto from "crypto";
import User from "../models/User.js";
import Client from "../models/Client.js";
import sendEmail from "../utils/sendEmail.js";
import Employee from "../models/Employee.js";
import { resetPassword } from "./authController.js";

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
    //const hashedToken = crypto
      // .createHash("sha256")
      // .update(token)
      // .digest("hex");

    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 7 * 24 * 60 * 60 * 1000;
    await user.save();

    //sendResetEmail
    const resetUrl=`${process.env.FRONTEND_URL}/reset-password/?token=${token}`;

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
      clientId: client._id,
      URL: resetUrl
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const resendResetLink = async (req, res) => {
  try {
    const { clientId } = req.params;

    
    const user = await Client.findById(clientId);


    if (!user) {
      return res.status(404).json({
        message: "Client not found"
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    //const hashedToken = crypto
      // .createHash("sha256")
      // .update(resetToken)
      // .digest("hex");

    user.resetPasswordToken = resetToken;
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
      message: "Reset password link resent successfully",
      resetUrl
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};


export const createEmployee = async (req, res) => {
  try {
    const { firstName, lastName, email, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }
   const user = await User.create({
      email,
      role: "EMPLOYEE"
    });
    const employee = await Employee.create({
      userId: user._id,
      firstName,
      lastName,
      phone,
      email
    });
    

    const rawtoken=crypto.randomBytes(32).toString("hex");
    //const hashedToken=crypto.createHash("sha256").update(rawtoken).digest("hex");

    user.resetPasswordToken=rawtoken;
    user.resetPasswordExpires=Date.now()+7*24*60*60*1000;

    await user.save();

    const resetUrl=`${process.env.FRONTEND_URL}/reset-password/?token=${rawtoken}`;
    await sendEmail({
      to:user.email,
      subject:"Set Your Password",
      html:`
      <p>You have been added as an employee.</p>
      <p>Click below to set your password and compelete onboarding (valid for 7 days):</p>
      <a href="${resetUrl}">${resetUrl}</a>
    `});
    res.status(201).json({
      message: "Employee created and set password link sent",
      employeeId:employee._id,
      URL:resetUrl,
    });
  }

    catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const resendEmployeeInvite=async(req,res)=>{
  try {
    const { employeeId } = req.params;

    const user=await Employee.findById(employeeId);

    if(!user){
      return res.status(404).json({
        message:"Employee not found"
      });
    }
    const resetToken=crypto.randomBytes(32).toString("hex");

   // const hashedToken=crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordToken=resetToken;
    user.resetPasswordExpires=Date.now()+7*24*60*60*1000;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

     await sendEmail({
      to: user.email,
      subject: "New onboarding link",
      html: `
        <p>Your onboarding link has been reissued.</p>
        <a href="${resetUrl}">${resetUrl}</a>
      `
    });

    res.status(200).json({
      message: "Invite resent successfully"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }

};
export const getEmployees = async (req, res) => {
  try {
    const { status } = req.query;

    const userFilter = {
      role: "EMPLOYEE"
    };

    if (status && status !== "ALL") {
      userFilter.status = status.toUpperCase();
    }

    const employees = await Employee.find()
      .populate({
        path: "userId",
        match: userFilter,
        select: "email role status resetPasswordToken"
      })
      .select("firstName lastName phone userId")
      .sort({ createdAt: -1 });

    const formatted = employees
      .filter(emp => emp.userId)
      .map(emp => ({
        _id: emp.userId._id,
        name: `${emp.firstName} ${emp.lastName}`,
        email: emp.userId.email,
        phone: emp.phone,
        role: emp.userId.role,
        status: emp.userId.status,
        resetPasswordToken: emp.userId.resetPasswordToken
      }));

    res.status(200).json({
      count: formatted.length,
      employees: formatted
    });

  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};


export const getAllClients = async (req, res) => {
  try {
    const { status } = req.query;

    const matchStage = {
      role: "CLIENT"
    };

    if (status && status !== "ALL") {
      matchStage.status = status.toUpperCase();
    }

    const clients = await User.aggregate([
      {
        $match: matchStage
      },
      {
        $lookup: {
          from: "clients",
          localField: "email",
          foreignField: "email",
          as: "clientProfile"
        }
      },
      {
        $unwind: "$clientProfile"
      },
      {
        $project: {
          _id: 1,
          email: 1,
          role: 1,
          status: 1,
          name: {
            $concat: [
              "$clientProfile.firstName",
              " ",
              "$clientProfile.lastName"
            ]
          },
          phone: "$clientProfile.phone",
          country: "$clientProfile.country",
          state: "$clientProfile.state",
          timeZone: "$clientProfile.timeZone",
          gender: "$clientProfile.gender",
          assignedEmployee: "$clientProfile.assignedEmployee",
          resetPasswordToken: 1,
         
          createdAt: 1
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);

    res.status(200).json({
      success: true,
      count: clients.length,
      data: clients
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch clients",
      error: error.message
    });
  }
};



export const getClientById = async (req, res) => {
  try {
    const { clientId } = req.params;

    
    const user = await User.findOne({
      _id: clientId,
      role: "CLIENT"
    }).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Client not found"
      });
    }

    
    const clientProfile = await Client.findOne({
      email: user.email
    });

    if (!clientProfile) {
      return res.status(404).json({
        success: false,
        message: "Client profile not found"
      });
    }

    
    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        email: user.email,
        role: user.role,
        status: user.status,
        name: `${clientProfile.firstName} ${clientProfile.lastName}`,
        phone: clientProfile.phone,
        country: clientProfile.country,
        state: clientProfile.state,
        timeZone: clientProfile.timeZone,
        gender: clientProfile.gender,
        assignedEmployee: clientProfile.assignedEmployee,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch client details",
      error: error.message
    });
  }
};
