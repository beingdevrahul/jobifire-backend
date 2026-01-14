import express from "express";
import {
  createClient,
  resendResetLink,
  createEmployee,
  resendEmployeeInvite,getEmployees,getAllClients, getClientById,deactivateUser,
  updateEmployeeRole,updateClientEmployees
} from "../controllers/adminController.js";

import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";
import { getJobSearchCriteriaByClientId, getAllClientDocuments } from "../controllers/jobSearchController.js";

const router = express.Router();


router.post(
  "/client",
  authMiddleware,
  roleMiddleware("ADMIN"),
  createClient
);


router.post(
  "/client/resend/:clientId",
  authMiddleware,
  roleMiddleware("ADMIN"),
  resendResetLink
);
router.post(
  "/employee",
  authMiddleware,
  roleMiddleware("ADMIN"),
  createEmployee
);

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

router.get(
  "/clients",
  authMiddleware,
  roleMiddleware("ADMIN"),
  getAllClients
);

router.get(
  "/clients/:clientId",
  authMiddleware,
  roleMiddleware("ADMIN"),
  getClientById
);

router.get(
  "/job-search/:clientId",
  authMiddleware,
  roleMiddleware("ADMIN"),
  getJobSearchCriteriaByClientId
)

router.get(
  "/documents/:clientId",
  authMiddleware,
  roleMiddleware("ADMIN"),
  getAllClientDocuments
);

router.patch(
  "/users/:userId/deactivate",
  authMiddleware,
  roleMiddleware("ADMIN"),
  deactivateUser
);
router.patch(
  "/employees/:employeeId/role",
  authMiddleware,
  roleMiddleware("ADMIN"),
  updateEmployeeRole
)

router.patch(
  "/clients/:clientId/employees",
  authMiddleware,
  roleMiddleware("ADMIN"),
  updateClientEmployees
);





export default router;
