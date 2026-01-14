import crypto from "crypto";
import User from "../models/User.js";
import Client from "../models/Client.js";
import sendEmail from "../utils/sendEmail.js";
import Employee from "../models/Employee.js";


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
      assignedEmployees 
    } = req.body;

    
    if (!assignedEmployees || 
        !assignedEmployees.jcrSearch || 
        !assignedEmployees.resumeWriter || 
        !assignedEmployees.counsellor) {
      return res.status(400).json({ 
        message: "All three employee roles must be assigned (JCR Search, Resume Writer, Counsellor)" 
      });
    }

    
    const jcrSearchEmployee = await Employee.findById(assignedEmployees.jcrSearch);
    if (!jcrSearchEmployee || jcrSearchEmployee.employeeRole !== "JCR Search") {
      return res.status(400).json({ 
        message: "Invalid JCR Search employee" 
      });
    }

    const resumeWriterEmployee = await Employee.findById(assignedEmployees.resumeWriter);
    if (!resumeWriterEmployee || resumeWriterEmployee.employeeRole !== "Resume Writer") {
      return res.status(400).json({ 
        message: "Invalid Resume Writer employee" 
      });
    }

    const counsellorEmployee = await Employee.findById(assignedEmployees.counsellor);
    if (!counsellorEmployee || counsellorEmployee.employeeRole !== "Counsellor") {
      return res.status(400).json({ 
        message: "Invalid Counsellor employee" 
      });
    }

    
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
      assignedEmployees: {
        jcrSearch: assignedEmployees.jcrSearch,
        resumeWriter: assignedEmployees.resumeWriter,
        counsellor: assignedEmployees.counsellor
      }
    });

    
    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 7 * 24 * 60 * 60 * 1000;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/?token=${token}`;

    await sendEmail({
      to: user.email,
      subject: "Reset Your Password",
      html: `
        <p>You have been added as a client.</p>
        <p>Click below to set your password (valid for 7 days):</p>
        <a href="${resetUrl}">${resetUrl}</a>
      `
    });

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
    const { firstName, lastName, email, phone , employeeRole} = req.body;

    const allowedRoles=["JCR Search","Resume Writer","Counsellor"];
    if(!employeeRole || !allowedRoles.includes(employeeRole)){
      return res.status(400).json({
        message:"Invalid employee role"
      });
    }

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
      email,
      employeeRole
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
    const { status, employeeRole } = req.query;

    const userFilter = {
      role: "EMPLOYEE"
    };

    if (status && status !== "ALL") {
      userFilter.status = status.toUpperCase();
    }

    const employeeFilter = {};

    if (employeeRole && employeeRole !== "ALL") {
      employeeFilter.employeeRole = employeeRole;
    }

    const employees = await Employee.find(employeeFilter)
      .populate({
        path: "userId",
        match: userFilter,
        select: "email role status resetPasswordToken"
      })
      .select("firstName lastName phone employeeRole userId")
      .sort({ createdAt: -1 });

    const formatted = employees
      .filter(emp => emp.userId)
      .map(emp => ({
        _id: emp.userId._id,
        name: `${emp.firstName} ${emp.lastName}`,
        email: emp.userId.email,
        phone: emp.phone,
        role: emp.userId.role,
        employeeRole: emp.employeeRole,
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
export const updateEmployeeRole=async(req,res)=>{
  try{
    const {employeeId} = req.params;
    const {employeeRole} =req.body;

   const allowedRoles=["JCR Search","Resume Writer","Counsellor"];
    if(!employeeRole || !allowedRoles.includes(employeeRole)){
      return res.status(400).json({
        success:false,
        message:"Invalid employee role"
      });
    }

    const employee =await Employee.findOne({userId:employeeId});
    
    if(!employee){
      return res.status(404).json({
        success:false,
        message:"Employee not found"
      });
    }

    employee.employeeRole=employeeRole;
    await employee.save();

    res.status(200).json({
      success:true,
      message:"Employee role Updated",
      data:{
        _id: employee.userId,
        name: `${employee.firstName} ${employee.lastName}`,
        email: employee.email,
        employeeRole: employee.employeeRole
      }
    });
  }
  catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update employee role",
      error: error.message
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
        $lookup: {
          from: "employees",
          localField: "clientProfile.assignedEmployees.jcrSearch",
          foreignField: "_id",
          as: "jcrSearchEmployee"
        }
      },
      {
        $lookup: {
          from: "employees",
          localField: "clientProfile.assignedEmployees.resumeWriter",
          foreignField: "_id",
          as: "resumeWriterEmployee"
        }
      },
      {
        $lookup: {
          from: "employees",
          localField: "clientProfile.assignedEmployees.counsellor",
          foreignField: "_id",
          as: "counsellorEmployee"
        }
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
          assignedEmployees: {
            jcrSearch: {
              $arrayElemAt: [
                {
                  $map: {
                    input: "$jcrSearchEmployee",
                    as: "emp",
                    in: {
                      _id: "$$emp._id",
                      name: { $concat: ["$$emp.firstName", " ", "$$emp.lastName"] },
                      email: "$$emp.email"
                    }
                  }
                },
                0
              ]
            },
            resumeWriter: {
              $arrayElemAt: [
                {
                  $map: {
                    input: "$resumeWriterEmployee",
                    as: "emp",
                    in: {
                      _id: "$$emp._id",
                      name: { $concat: ["$$emp.firstName", " ", "$$emp.lastName"] },
                      email: "$$emp.email"
                    }
                  }
                },
                0
              ]
            },
            counsellor: {
              $arrayElemAt: [
                {
                  $map: {
                    input: "$counsellorEmployee",
                    as: "emp",
                    in: {
                      _id: "$$emp._id",
                      name: { $concat: ["$$emp.firstName", " ", "$$emp.lastName"] },
                      email: "$$emp.email"
                    }
                  }
                },
                0
              ]
            }
          },
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
    }).populate([
      {
        path: "assignedEmployees.jcrSearch",
        select: "firstName lastName email employeeRole"
      },
      {
        path: "assignedEmployees.resumeWriter",
        select: "firstName lastName email employeeRole"
      },
      {
        path: "assignedEmployees.counsellor",
        select: "firstName lastName email employeeRole"
      }
    ]);

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
        assignedEmployees: {
          jcrSearch: {
            _id: clientProfile.assignedEmployees.jcrSearch._id,
            name: `${clientProfile.assignedEmployees.jcrSearch.firstName} ${clientProfile.assignedEmployees.jcrSearch.lastName}`,
            email: clientProfile.assignedEmployees.jcrSearch.email,
            role: clientProfile.assignedEmployees.jcrSearch.employeeRole
          },
          resumeWriter: {
            _id: clientProfile.assignedEmployees.resumeWriter._id,
            name: `${clientProfile.assignedEmployees.resumeWriter.firstName} ${clientProfile.assignedEmployees.resumeWriter.lastName}`,
            email: clientProfile.assignedEmployees.resumeWriter.email,
            role: clientProfile.assignedEmployees.resumeWriter.employeeRole
          },
          counsellor: {
            _id: clientProfile.assignedEmployees.counsellor._id,
            name: `${clientProfile.assignedEmployees.counsellor.firstName} ${clientProfile.assignedEmployees.counsellor.lastName}`,
            email: clientProfile.assignedEmployees.counsellor.email,
            role: clientProfile.assignedEmployees.counsellor.employeeRole
          }
        },
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

export const deactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    
    if (user.role === "ADMIN") {
      return res.status(400).json({
        success: false,
        message: "Admin account cannot be deactivated"
      });
    }

   
    if (!user.isActive) {
      return res.status(400).json({
        success: false,
        message: "User already deactivated"
      });
    }

    
    user.isActive = false;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `${user.role} deactivated successfully`
    });

  } catch (error) {
    console.error("Deactivate user error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to deactivate user"
    });
  }
};

export const updateClientEmployees = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { assignedEmployees } = req.body;

    if (!assignedEmployees || 
        (!assignedEmployees.jcrSearch && 
         !assignedEmployees.resumeWriter && 
         !assignedEmployees.counsellor)) {
      return res.status(400).json({
        success: false,
        message: "At least one employee assignment must be provided"
      });
    }

    
    const client = await Client.findById(clientId);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found"
      });
    }

   
    if (assignedEmployees.jcrSearch) {
      const jcrSearchEmployee = await Employee.findById(assignedEmployees.jcrSearch);
      if (!jcrSearchEmployee || jcrSearchEmployee.employeeRole !== "JCR Search") {
        return res.status(400).json({
          success: false,
          message: "Invalid JCR Search employee"
        });
      }
      client.assignedEmployees.jcrSearch = assignedEmployees.jcrSearch;
    }

  
    if (assignedEmployees.resumeWriter) {
      const resumeWriterEmployee = await Employee.findById(assignedEmployees.resumeWriter);
      if (!resumeWriterEmployee || resumeWriterEmployee.employeeRole !== "Resume Writer") {
        return res.status(400).json({
          success: false,
          message: "Invalid Resume Writer employee"
        });
      }
      client.assignedEmployees.resumeWriter = assignedEmployees.resumeWriter;
    }

   
    if (assignedEmployees.counsellor) {
      const counsellorEmployee = await Employee.findById(assignedEmployees.counsellor);
      if (!counsellorEmployee || counsellorEmployee.employeeRole !== "Counsellor") {
        return res.status(400).json({
          success: false,
          message: "Invalid Counsellor employee"
        });
      }
      client.assignedEmployees.counsellor = assignedEmployees.counsellor;
    }

    await client.save();

   
    await client.populate([
      {
        path: "assignedEmployees.jcrSearch",
        select: "firstName lastName email employeeRole"
      },
      {
        path: "assignedEmployees.resumeWriter",
        select: "firstName lastName email employeeRole"
      },
      {
        path: "assignedEmployees.counsellor",
        select: "firstName lastName email employeeRole"
      }
    ]);

    res.status(200).json({
      success: true,
      message: "Client employees updated successfully",
      data: {
        _id: client._id,
        name: `${client.firstName} ${client.lastName}`,
        email: client.email,
        assignedEmployees: {
          jcrSearch: {
            _id: client.assignedEmployees.jcrSearch._id,
            name: `${client.assignedEmployees.jcrSearch.firstName} ${client.assignedEmployees.jcrSearch.lastName}`,
            email: client.assignedEmployees.jcrSearch.email,
            role: client.assignedEmployees.jcrSearch.employeeRole
          },
          resumeWriter: {
            _id: client.assignedEmployees.resumeWriter._id,
            name: `${client.assignedEmployees.resumeWriter.firstName} ${client.assignedEmployees.resumeWriter.lastName}`,
            email: client.assignedEmployees.resumeWriter.email,
            role: client.assignedEmployees.resumeWriter.employeeRole
          },
          counsellor: {
            _id: client.assignedEmployees.counsellor._id,
            name: `${client.assignedEmployees.counsellor.firstName} ${client.assignedEmployees.counsellor.lastName}`,
            email: client.assignedEmployees.counsellor.email,
            role: client.assignedEmployees.counsellor.employeeRole
          }
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update client employees",
      error: error.message
    });
  }
};

