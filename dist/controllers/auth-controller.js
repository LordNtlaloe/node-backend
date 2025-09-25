"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.requestPasswordReset = exports.login = exports.verify = exports.register = void 0;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
// ✅ Fix: Import from @prisma/client instead of generated folder
const client_1 = require("@prisma/client");
const { sendEmail } = require("../lib/mail");
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
const register = async (req, res) => {
    const { email, password, name } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing)
        return res.status(400).json({ error: "User already exists" });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
        data: { email, name, passwordHash },
    });
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await prisma.verificationCode.create({
        data: { userId: user.id, code, expiresAt },
    });
    await sendEmail(email, "Your verification code", `Your verification code is: ${code}`);
    console.log(`Verification code for ${email}: ${code}`);
    res.json({ message: "User registered. Check email for verification code." });
};
exports.register = register;
const verify = async (req, res) => {
    const { email, code } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
        return res.status(400).json({ error: "Invalid email" });
    const record = await prisma.verificationCode.findFirst({
        where: { userId: user.id, code, used: false },
        orderBy: { createdAt: "desc" },
    });
    if (!record || record.expiresAt < new Date()) {
        return res.status(400).json({ error: "Invalid or expired code" });
    }
    await prisma.$transaction([
        prisma.user.update({ where: { id: user.id }, data: { isVerified: true } }),
        prisma.verificationCode.update({ where: { id: record.id }, data: { used: true } }),
    ]);
    res.json({ message: "User verified successfully" });
};
exports.verify = verify;
const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
        return res.status(400).json({ error: "Invalid email or password" });
    if (!user.isVerified)
        return res.status(403).json({ error: "Account not verified" });
    if (!user.passwordHash) {
        return res.status(500).json({ error: "User has no password set" });
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid)
        return res.status(400).json({ error: "Invalid email or password" });
    const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "15m" });
    const refreshToken = crypto.randomBytes(40).toString("hex");
    const refreshHash = await bcrypt.hash(refreshToken, 10);
    await prisma.refreshToken.create({
        data: {
            userId: user.id,
            tokenHash: refreshHash,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
    });
    res.json({ accessToken, refreshToken });
};
exports.login = login;
const requestPasswordReset = async (req, res) => {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
        return res.status(400).json({ error: "User not found" });
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = await bcrypt.hash(token, 10);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await prisma.passwordReset.create({
        data: { userId: user.id, tokenHash, expiresAt },
    });
    const resetUrl = `http://localhost:4000/auth/reset-password?token=${token}&email=${email}`;
    await sendEmail(email, "Reset your password", `Click here to reset: ${resetUrl}`);
    res.json({ message: "Password reset email sent" });
};
exports.requestPasswordReset = requestPasswordReset;
const resetPassword = async (req, res) => {
    const { email, token, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
        return res.status(400).json({ error: "Invalid email" });
    const record = await prisma.passwordReset.findFirst({
        where: { userId: user.id, used: false },
        orderBy: { createdAt: "desc" },
    });
    if (!record || record.expiresAt < new Date()) {
        return res.status(400).json({ error: "Invalid or expired token" });
    }
    const isValid = await bcrypt.compare(token, record.tokenHash);
    if (!isValid)
        return res.status(400).json({ error: "Invalid token" });
    const newHash = await bcrypt.hash(newPassword, 10);
    await prisma.$transaction([
        prisma.user.update({ where: { id: user.id }, data: { passwordHash: newHash } }),
        prisma.passwordReset.update({ where: { id: record.id }, data: { used: true } }),
    ]);
    res.json({ message: "Password updated successfully" });
};
exports.resetPassword = resetPassword;
// ✅ Export CommonJS style
module.exports = { register: exports.register, verify: exports.verify, login: exports.login, requestPasswordReset: exports.requestPasswordReset, resetPassword: exports.resetPassword };
