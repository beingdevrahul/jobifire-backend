import User from "../models/User.js";
import { generateDummyEmployees } from "../utils/dummyEmployees.js";

export const getClientDashboardTeam = async (req, res) => {
  try {
    const clientId = req.user.id;

    // 1️⃣ Try to get real assigned employee (OPTIONAL)
    const realEmployee = await User.findOne({
      assignedClients: clientId,
      role: "EMPLOYEE",
      status: "ACTIVE"
    }).select("name role");

    let team = [];

    // 2️⃣ Add real employee ONLY if exists
    if (realEmployee) {
      team.push({
        id: realEmployee._id,
        name: realEmployee.name,
        role: realEmployee.role || "Account Manager",
        isVirtual: false
      });
    }

    // 3️⃣ Generate remaining dummy employees
    const dummyCount = 3 - team.length;
    const dummyEmployees = generateDummyEmployees(dummyCount);

    team = [...team, ...dummyEmployees].sort(() => 0.5 - Math.random());

    res.status(200).json({
      success: true,
      data: { team }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load dashboard team",
      error: error.message
    });
  }
};
