import express from "express";
import {
  createClient,
  resendResetLink,
  createEmployee,
  resendEmployeeInvite,getEmployees
} from "../controllers/adminController.js";

import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = express.Router();

/* ===================== CLIENT ROUTES ===================== */

// Create client + send onboarding reset link
router.post(
  "/client",
  //authMiddleware,
  //roleMiddleware("ADMIN"),
  createClient
);

// Resend client reset password link
router.post(
  "/client/resend/:clientId",
  //authMiddleware,
  //roleMiddleware("ADMIN"),
  resendResetLink
);

/* ===================== EMPLOYEE ROUTES ===================== */

// Create employee + send invite
router.post(
  "/employee",
  //authMiddleware,
 // roleMiddleware("ADMIN"),
  createEmployee
);

// Resend employee onboarding invite
router.post(
  "/employee/resend/:employeeId",
  authMiddleware,
  roleMiddleware("ADMIN"),
  resendEmployeeInvite
);

router.get(
  "/employees",
  authMiddleware,
  roleMiddleware("ADMIN"),
  getEmployees
);


export default router;
