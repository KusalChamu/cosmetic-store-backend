import User from '../models/user.js';
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();

export function createUser(req, res) {
    const role = req.body.role || "customer"; // default to customer

    // Only admins can create another admin
    if (role === "admin") {
        if (!req.user || req.user.role !== "admin") {
            return res.status(403).json({
                message: "Unauthorized: only admins can create another admin"
            });
        }
    }

    const hashedPassword = bcrypt.hashSync(req.body.password, 10);

    const user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: hashedPassword,
        role: role
    });

    user.save()
        .then(() => {
            // ✅ Generate JWT token for auto-login
            const token = jwt.sign(
                {
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    img: user.img
                },
                process.env.JWT_KEY
            );

            res.status(201).json({
                message: "User created successfully",
                token: token,
                role: user.role
            });
        })
        .catch((err) => {
            res.status(500).json({
                message: "Error creating user",
                error: err.message
            });
        });
}

export function loginUser(req, res) {
    const { email, password } = req.body;

    User.findOne({ email: email }).then((user) => {
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const isPasswordCorrect = bcrypt.compareSync(password, user.password);
        if (isPasswordCorrect) {
            const token = jwt.sign(
                {
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    img: user.img
                },
                process.env.JWT_KEY
            );

            res.status(200).json({
                message: "Login successful",
                token: token,
                role: user.role
            });
        } else {
            res.status(401).json({
                message: "Invalid password"
            });
        }
    });
}

export function isAdmin(req) {
    if (!req.user) return false;
    return req.user.role === "admin";
}
