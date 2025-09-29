import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";

interface PatientRequest extends Request {
    body: {
        userId: string;
        firstName: string;
        lastName: string;
        dateOfBirth: string;
        age: number;
        gender: string;
        contactInfo: string;
        address?: string;
        emergencyContact?: string;
        bloodType?: string;
        allergies?: string;
        chronicConditions?: string;
        medicalHistory?: string;
    }
}

export const getAllPatients = async (req: Request, res: Response): Promise<void> => {
    try {
        const { page = 1, limit = 10, search } = req.query;

        const skip = (Number(page) - 1) * Number(limit);

        // Fix: Use proper Prisma types for the where clause
        const where: Prisma.PatientWhereInput = search ? {
            OR: [
                { firstName: { contains: search as string, mode: 'insensitive' as Prisma.QueryMode } },
                { lastName: { contains: search as string, mode: 'insensitive' as Prisma.QueryMode } },
                { contactInfo: { contains: search as string, mode: 'insensitive' as Prisma.QueryMode } }
            ]
        } : {};

        const patients = await prisma.patient.findMany({
            where,
            skip,
            take: Number(limit),
            include: {
                user: {
                    select: {
                        email: true,
                        name: true
                    }
                },
                _count: {
                    select: {
                        visits: true,
                        healthAlerts: {
                            where: { isResolved: false }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const total = await prisma.patient.count({ where });

        res.json({
            patients,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        console.error("Get all patients error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// ... rest of the patientController code remains the same
export const createPatient = async (req: PatientRequest, res: Response): Promise<void> => {
    try {
        const {
            userId,
            firstName,
            lastName,
            dateOfBirth,
            age,
            gender,
            contactInfo,
            address,
            emergencyContact,
            bloodType,
            allergies,
            chronicConditions,
            medicalHistory
        } = req.body;

        // Check if user exists and is not already a patient
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { patientProfile: true }
        });

        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        if (user.patientProfile) {
            res.status(400).json({ error: "User already has a patient profile" });
            return;
        }

        const patient = await prisma.patient.create({
            data: {
                userId,
                firstName,
                lastName,
                dateOfBirth: new Date(dateOfBirth),
                age,
                gender,
                contactInfo,
                address,
                emergencyContact,
                bloodType,
                allergies,
                chronicConditions,
                medicalHistory
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

        res.status(201).json(patient);
    } catch (error) {
        console.error("Create patient error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getPatient = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const patient = await prisma.patient.findUnique({
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
                visits: {
                    include: {
                        vitalSigns: true,
                        treatments: true,
                        labResults: true,
                        diagnoses: true
                    },
                    orderBy: { date: 'desc' },
                    take: 10
                },
                vitalSigns: {
                    orderBy: { recordedAt: 'desc' },
                    take: 5
                },
                healthAlerts: {
                    where: { isResolved: false },
                    orderBy: { triggeredAt: 'desc' }
                }
            }
        });

        if (!patient) {
            res.status(404).json({ error: "Patient not found" });
            return;
        }

        res.json(patient);
    } catch (error) {
        console.error("Get patient error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const updatePatient = async (req: PatientRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const {
            firstName,
            lastName,
            dateOfBirth,
            age,
            gender,
            contactInfo,
            address,
            emergencyContact,
            bloodType,
            allergies,
            chronicConditions,
            medicalHistory
        } = req.body;

        const existingPatient = await prisma.patient.findUnique({ where: { id } });
        if (!existingPatient) {
            res.status(404).json({ error: "Patient not found" });
            return;
        }

        const patient = await prisma.patient.update({
            where: { id },
            data: {
                firstName,
                lastName,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
                age,
                gender,
                contactInfo,
                address,
                emergencyContact,
                bloodType,
                allergies,
                chronicConditions,
                medicalHistory
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

        res.json(patient);
    } catch (error) {
        console.error("Update patient error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const deletePatient = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const existingPatient = await prisma.patient.findUnique({ where: { id } });
        if (!existingPatient) {
            res.status(404).json({ error: "Patient not found" });
            return;
        }

        await prisma.patient.delete({ where: { id } });

        res.json({ message: "Patient deleted successfully" });
    } catch (error) {
        console.error("Delete patient error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getPatientStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const stats = await prisma.patient.findUnique({
            where: { id },
            select: {
                _count: {
                    select: {
                        visits: true,
                        labResults: true,
                        diagnoses: true,
                        healthAlerts: {
                            where: { isResolved: false }
                        }
                    }
                },
                visits: {
                    select: {
                        date: true,
                        visitType: true
                    },
                    orderBy: { date: 'desc' },
                    take: 1
                }
            }
        });

        if (!stats) {
            res.status(404).json({ error: "Patient not found" });
            return;
        }

        res.json(stats);
    } catch (error) {
        console.error("Get patient stats error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};