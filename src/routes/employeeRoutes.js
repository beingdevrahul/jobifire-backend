import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";
import {
  getMyClients,
  getClientDetailsForEmployee
} from "../controllers/employeeController.js";
import { getJobSearchCriteriaByClientId } from "../controllers/jobSearchController.js";

const router = express.Router();


router.get(
  "/clients",
  authMiddleware,
  roleMiddleware("EMPLOYEE"),
  getMyClients
);

router.get(
  "/clients/:clientId",
  authMiddleware,
  roleMiddleware("EMPLOYEE"),
  getClientDetailsForEmployee
);

router.get(
  "/job-search/:clientId",
  authMiddleware,
  roleMiddleware("EMPLOYEE"),
  getJobSearchCriteriaByClientId
);


export default router;
