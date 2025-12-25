import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const roleMiddleware = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};

export default roleMiddleware;
