"use strict";
const express = require("express");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const authRoutes = require("./routes/auth");
const app = express();
const PORT = process.env.PORT || 4000;
// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
// Routes
app.use("/auth", authRoutes);
app.get("/", (req, res) => {
    res.send("🚀 Auth API running with TypeScript, Prisma & JWT");
});
// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
