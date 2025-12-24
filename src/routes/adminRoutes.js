import express from "express";

const router = express.Router();

router.post("/resend-reset-link/:clientId",
    authMiddleware,
    roleMiddleware(["ADMIN"]),
    resendResetLink
);

export default router;

