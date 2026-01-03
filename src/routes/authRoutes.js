import express from "express";
import { resetPassword } from "../controllers/authController.js";
import { forgotPassword, resetForgotPassword , getResetPasswordInfo} from "../controllers/authController.js";
import { login } from "../controllers/authController.js";

const router = express.Router();

router.post("/reset-password/:token", resetPassword);
router.get("/reset-password/info", getResetPasswordInfo);
router.post("/forgot-password", forgotPassword);
router.post("/reset-forgot-password", resetForgotPassword);

router.post("/login", login);


export default router;
