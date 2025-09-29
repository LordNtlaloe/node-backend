import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

interface DiagnosisRequest extends Request {
    body: {
        patientId: string;
        visitId?: string;
        icd10Code?: string;
        name: string;
        description?: string;
        isChronic?: boolean;
        isActive?: boolean;
        resolvedAt?: string;
    }
}

export const createDiagnosis = async (req: DiagnosisRequest, res: Response): Promise<void> => {
    try {
        const {
            patientId,
            visitId,
            icd10Code,
            name,
            description,
            isChronic = false,
            isActive = true
        } = req.body;

        // Check if patient exists
        const patient = await prisma.patient.findUnique({ where: { id: patientId } });
        if (!patient) {
            res.status(404).json({ error: "Patient not found" });
            return;
        }

        // Check if visit exists if provided
        if (visitId) {
            const visit = await prisma.visit.findUnique({ where: { id: visitId } });
            if (!visit) {
                res.status(404).json({ error: "Visit not found" });
                return;
            }
        }

        const diagnosis = await prisma.diagnosis.create({
            data: {
                patientId,
                visitId,
                icd10Code,
                name,
                description,
                isChronic,
                isActive
            },
            include: {
                patient: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                },
                visit: {
                    select: {
                        date: true,
                        visitType: true
                    }
                }
            }
        });

        res.status(201).json(diagnosis);
    } catch (error) {
        console.error("Create diagnosis error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getDiagnosis = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const diagnosis = await prisma.diagnosis.findUnique({
            where: { id },
            include: {
                patient: {
                    select: {
                        firstName: true,
                        lastName: true,
                        age: true,
                        gender: true
                    }
                },
                visit: {
                    select: {
                        date: true,
                        visitType: true
                    }
                }
            }
        });

        if (!diagnosis) {
            res.status(404).json({ error: "Diagnosis not found" });
            return;
        }

        res.json(diagnosis);
    } catch (error) {
        console.error("Get diagnosis error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getPatientDiagnoses = async (req: Request, res: Response): Promise<void> => {
    try {
        const { patientId } = req.params;
        const { page = 1, limit = 10, isChronic, isActive } = req.query;

        const skip = (Number(page) - 1) * Number(limit);

        const where: any = { patientId };
        if (isChronic !== undefined) where.isChronic = isChronic === 'true';
        if (isActive !== undefined) where.isActive = isActive === 'true';

        // Check if patient exists
        const patient = await prisma.patient.findUnique({ where: { id: patientId } });
        if (!patient) {
            res.status(404).json({ error: "Patient not found" });
            return;
        }

        const diagnoses = await prisma.diagnosis.findMany({
            where,
            skip,
            take: Number(limit),
            include: {
                visit: {
                    select: {
                        visitType: true
                    }
                }
            },
            orderBy: { date: 'desc' }
        });

        const total = await prisma.diagnosis.count({ where });

        res.json({
            diagnoses,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        console.error("Get patient diagnoses error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const updateDiagnosis = async (req: DiagnosisRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const {
            icd10Code,
            name,
            description,
            isChronic,
            isActive,
            resolvedAt
        } = req.body;

        const existingDiagnosis = await prisma.diagnosis.findUnique({ where: { id } });
        if (!existingDiagnosis) {
            res.status(404).json({ error: "Diagnosis not found" });
            return;
        }

        const diagnosis = await prisma.diagnosis.update({
            where: { id },
            data: {
                icd10Code,
                name,
                description,
                isChronic,
                isActive,
                resolvedAt: resolvedAt ? new Date(resolvedAt) : undefined
            },
            include: {
                patient: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });

        res.json(diagnosis);
    } catch (error) {
        console.error("Update diagnosis error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const deleteDiagnosis = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const existingDiagnosis = await prisma.diagnosis.findUnique({ where: { id } });
        if (!existingDiagnosis) {
            res.status(404).json({ error: "Diagnosis not found" });
            return;
        }

        await prisma.diagnosis.delete({ where: { id } });

        res.json({ message: "Diagnosis deleted successfully" });
    } catch (error) {
        console.error("Delete diagnosis error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};