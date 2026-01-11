import express from "express";
import {
  createJobSearchCriteria,
  getJobSearchCriteria,
  updateJobSearchCriteria,
 // deleteJobSearchCriteria
} from "../controllers/jobSearchController.js";
import { generateClientUploadUrl, saveClientDocument } from "../controllers/clientController.js";

import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";
import { getClientDocumentViewUrl } from "../controllers/clientController.js";
import { getClientDashboardTeam } from "../controllers/clientDashboard.js";

const router = express.Router();
//router.use(authMiddleware, roleMiddleware("CLIENT"));

router.post("/job-search", authMiddleware,roleMiddleware("CLIENT"), createJobSearchCriteria);
router.get("/job-search", authMiddleware, roleMiddleware("CLIENT"), getJobSearchCriteria);
router.put("/job-search", authMiddleware,roleMiddleware("CLIENT"), updateJobSearchCriteria);
router.post(
  "/clients/:clientId/documents/upload-url",
  authMiddleware,
  roleMiddleware("ADMIN", "EMPLOYEE", "CLIENT"),
  generateClientUploadUrl
);
router.get(
  "/clients/documents/view-url",
  authMiddleware,
  roleMiddleware("ADMIN", "EMPLOYEE"),
  getClientDocumentViewUrl
);
router.get("/dashboard", 
  authMiddleware,
  roleMiddleware("CLIENT"),
   getClientDashboardTeam);

router.post(
  "/clients/:clientId/documents",
  authMiddleware,
 roleMiddleware("ADMIN", "EMPLOYEE","CLIENT"),
  saveClientDocument
);

//router.delete("/job-search", deleteJobSearchCriteria);

export default router;
