
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from "dotenv";
dotenv.config();







/**
 * Protect routes: verify JWT and attach user to request
 */
export const protect = async (
req,
res,
next) =>
{
  try {
    let token;

    // Check Authorization header first, then cookies
    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      res.status(401).json({ message: "Not authorized. No token provided." });
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");

    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      res.status(401).json({ message: "User belonging to this token no longer exists." });
      return;
    }

    if (user.status === "suspended") {
      res.status(403).json({ message: "Your account has been suspended." });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized. Token invalid or expired." });
  }
};

/**
 * Restrict routes to specific roles
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({
        message: `Access denied. Role '${req.user?.role}' is not permitted for this action.`
      });
      return;
    }
    next();
  };
};