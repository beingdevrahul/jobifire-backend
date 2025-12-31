import express from "express";
import {
  createJobSearchCriteria,
  getJobSearchCriteria,
  updateJobSearchCriteria,
 // deleteJobSearchCriteria
} from "../controllers/jobSearchController.js";

import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.use(authMiddleware, roleMiddleware("CLIENT"));

router.post("/job-search", createJobSearchCriteria);
router.get("/job-search", getJobSearchCriteria);
router.put("/job-search", updateJobSearchCriteria);


//router.delete("/job-search", deleteJobSearchCriteria);

export default router;
