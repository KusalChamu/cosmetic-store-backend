import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export function createUser(req, res) {
  const role = req.body.role || "customer";

  // If trying to create admin, check if requester is admin
  if (role === "admin") {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only an admin can create another admin",
      });
    }
  }

  // Hash password
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);

  const user = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: hashedPassword,
    role: role,
  });

  user
    .save()
    .then(() => {
      const token = jwt.sign(
        {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          img: user.img,
        },
        process.env.JWT_KEY
      );

      res.status(201).json({
        message: "User created successfully",
        token: token,
        role: user.role,
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: "Error creating user",
        error: err.message,
      });
    });
}

export function loginUser(req, res) {
  const { email, password } = req.body;

  User.findOne({ email: email }).then((user) => {
    if (!user) {
      return res.status(401).json({
        message: "Authentication failed. User not found",
      });
    }

    const isPasswordCorrect = bcrypt.compareSync(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Authentication failed. Wrong password",
      });
    }

    const token = jwt.sign(
      {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        img: user.img,
      },
      process.env.JWT_KEY
    );

    res.status(200).json({
      message: "Login successful",
      token: token,
      role: user.role,
    });
  });
}

export function isAdmin(req) {
  return req.user && req.user.role === "admin";
}
