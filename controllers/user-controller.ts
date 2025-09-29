import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { Role } from "@prisma/client";

interface UserRequest extends Request {
    body: {
        email: string;
        name?: string;
        role: Role;
        isVerified?: boolean;
    }
}

export const getUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                patientProfile: true,
                staffProfile: true,
            }
        });

        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        res.json(user);
    } catch (error) {
        console.error("Get user error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// backend/controllers/user-controller.ts
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const { role, page = 1, limit = 10, search } = req.query;

        const skip = (Number(page) - 1) * Number(limit);

        // FIX: Properly handle role filtering including "all" value
        let where: any = {};

        if (role && role !== 'all') {
            // Only apply role filter if it's a valid role and not "all"
            const validRoles = Object.values(Role);
            if (validRoles.includes(role as Role)) {
                where.role = role as Role;
            }
        }

        // Add search functionality
        if (search) {
            where.OR = [
                { email: { contains: search as string, mode: 'insensitive' } },
                { name: { contains: search as string, mode: 'insensitive' } },
            ];
        }

        const users = await prisma.user.findMany({
            where,
            skip,
            take: Number(limit),
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isVerified: true,
                createdAt: true,
                patientProfile: { select: { id: true } },
                staffProfile: { select: { id: true } },
            },
            orderBy: { createdAt: 'desc' }
        });

        const total = await prisma.user.count({ where });

        res.json({
            users,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        console.error("Get all users error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const updateUser = async (req: UserRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { email, name, role, isVerified } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { id } });
        if (!existingUser) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        if (email && email !== existingUser.email) {
            const emailExists = await prisma.user.findUnique({ where: { email } });
            if (emailExists) {
                res.status(400).json({ error: "Email already in use" });
                return;
            }
        }

        const user = await prisma.user.update({
            where: { id },
            data: {
                email,
                name,
                role,
                isVerified,
            },
            include: {
                patientProfile: true,
                staffProfile: true,
            }
        });

        res.json(user);
    } catch (error) {
        console.error("Update user error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const existingUser = await prisma.user.findUnique({ where: { id } });
        if (!existingUser) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        await prisma.user.delete({ where: { id } });

        res.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Delete user error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};