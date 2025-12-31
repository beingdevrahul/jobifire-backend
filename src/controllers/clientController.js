


export const createJobSearchCriteria = async (req, res) => {
  try {
    const clientId = req.user.id;

    const existing = await JobSearchCriteria.findOne({ clientId });
    if (existing) {
      return res.status(400).json({
        message: "Job search criteria already exists"
      });
    }

    const criteria = await JobSearchCriteria.create({
      clientId,
      ...req.body
    });

    res.status(201).json({
      message: "Job search criteria created successfully",
      data: criteria
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getJobSearchCriteria = async (req, res) => {
  try {
    const clientId = req.user.id;

    const criteria = await JobSearchCriteria.findOne({ clientId });

    if (!criteria) {
      return res.status(404).json({
        message: "No job search criteria found"
      });
    }

    res.status(200).json({
      data: criteria
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const updateJobSearchCriteria = async (req, res) => {
  try {
    const clientId = req.user.id;

    const updated = await JobSearchCriteria.findOneAndUpdate(
      { clientId },
      { $set: req.body },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        message: "Job search criteria not found"
      });
    }

    res.status(200).json({
      message: "Job search criteria updated successfully",
      data: updated
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
