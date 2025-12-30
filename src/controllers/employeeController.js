import Client from "../models/Client.js";

export const getMyClients = async (req, res) => {
  try {
    const employeeId = req.user.id;

    const clients = await Client.find({
      assignedEmployee: employeeId
    })
      .populate("userId", "-password")
      .lean();

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

export const getClientDetailsForEmployee = async (req, res) => {
  try {
    const { clientId } = req.params;
    const employeeId = req.user.id;

    const client = await Client.findOne({
      userId: clientId,
      assignedEmployee: employeeId
    }).populate("userId", "-password");

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found or access denied"
      });
    }

    res.status(200).json({
      success: true,
      data: client
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch client details",
      error: error.message
    });
  }
};
