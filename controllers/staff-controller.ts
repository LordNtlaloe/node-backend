import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

interface StaffRequest extends Request {
    body: {
        userId: string;
        firstName: string;
        lastName: string;
        department: string;
        specialization?: string;
        licenseNumber?: string;
        contactInfo: string;
        isActive?: boolean;
    }
}

export const createStaff = async (req: StaffRequest, res: Response): Promise<void> => {
    try {
        const {
            userId,
            firstName,
            lastName,
            department,
            specialization,
            licenseNumber,
            contactInfo,
            isActive = true
        } = req.body;

        // Check if user exists and is not already staff
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { staffProfile: true }
        });

        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        if (user.staffProfile) {
            res.status(400).json({ error: "User already has a staff profile" });
            return;
        }

        const staff = await prisma.staff.create({
            data: {
                userId,
                firstName,
                lastName,
                department,
                specialization,
                licenseNumber,
                contactInfo,
                isActive
            },
            include: {
                user: {
                    select: {
                        email: true,
                        name: true,
                        role: true
                    }
                }
            }
        });

        res.status(201).json(staff);
    } catch (error) {
        console.error("Create staff error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getStaff = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const staff = await prisma.staff.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        email: true,
                        name: true,
                        role: true,
                        isVerified: true
                    }
                },
                assignedVisits: {
                    include: {
                        patient: {
                            select: {
                                firstName: true,
                                lastName: true
                            }
                        }
                    },
                    orderBy: { date: 'desc' },
                    take: 10
                }
            }
        });

        if (!staff) {
            res.status(404).json({ error: "Staff member not found" });
            return;
        }

        res.json(staff);
    } catch (error) {
        console.error("Get staff error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getAllStaff = async (req: Request, res: Response): Promise<void> => {
    try {
        const { department, isActive, page = 1, limit = 10 } = req.query;

        const skip = (Number(page) - 1) * Number(limit);

        const where: any = {};
        if (department) where.department = department;
        if (isActive !== undefined) where.isActive = isActive === 'true';

        const staff = await prisma.staff.findMany({
            where,
            skip,
            take: Number(limit),
            include: {
                user: {
                    select: {
                        email: true,
                        name: true,
                        role: true
                    }
                },
                _count: {
                    select: {
                        assignedVisits: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const total = await prisma.staff.count({ where });

        res.json({
            staff,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        console.error("Get all staff error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const updateStaff = async (req: StaffRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const {
            firstName,
            lastName,
            department,
            specialization,
            licenseNumber,
            contactInfo,
            isActive
        } = req.body;

        const existingStaff = await prisma.staff.findUnique({ where: { id } });
        if (!existingStaff) {
            res.status(404).json({ error: "Staff member not found" });
            return;
        }

        const staff = await prisma.staff.update({
            where: { id },
            data: {
                firstName,
                lastName,
                department,
                specialization,
                licenseNumber,
                contactInfo,
                isActive
            },
            include: {
                user: {
                    select: {
                        email: true,
                        name: true
                    }
                }
            }
        });

        res.json(staff);
    } catch (error) {
        console.error("Update staff error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const deleteStaff = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const existingStaff = await prisma.staff.findUnique({ where: { id } });
        if (!existingStaff) {
            res.status(404).json({ error: "Staff member not found" });
            return;
        }

        await prisma.staff.delete({ where: { id } });

        res.json({ message: "Staff member deleted successfully" });
    } catch (error) {
        console.error("Delete staff error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};