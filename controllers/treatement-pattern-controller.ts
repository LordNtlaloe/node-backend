import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

interface TreatmentPatternRequest extends Request {
    body: {
        patientId: string;
        patternType: string;
        description: string;
        frequency?: string;
        confidence: number;
        isActive?: boolean;
    }
}

export const createTreatmentPattern = async (req: TreatmentPatternRequest, res: Response): Promise<void> => {
    try {
        const {
            patientId,
            patternType,
            description,
            frequency,
            confidence,
            isActive = true
        } = req.body;

        // Check if patient exists
        const patient = await prisma.patient.findUnique({ where: { id: patientId } });
        if (!patient) {
            res.status(404).json({ error: "Patient not found" });
            return;
        }

        const treatmentPattern = await prisma.treatmentPattern.create({
            data: {
                patientId,
                patternType,
                description,
                frequency,
                confidence,
                isActive
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

        res.status(201).json(treatmentPattern);
    } catch (error) {
        console.error("Create treatment pattern error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getTreatmentPattern = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const treatmentPattern = await prisma.treatmentPattern.findUnique({
            where: { id },
            include: {
                patient: {
                    select: {
                        firstName: true,
                        lastName: true,
                        age: true,
                        gender: true
                    }
                }
            }
        });

        if (!treatmentPattern) {
            res.status(404).json({ error: "Treatment pattern not found" });
            return;
        }

        res.json(treatmentPattern);
    } catch (error) {
        console.error("Get treatment pattern error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getPatientTreatmentPatterns = async (req: Request, res: Response): Promise<void> => {
    try {
        const { patientId } = req.params;
        const { patternType, isActive, page = 1, limit = 10 } = req.query;

        const skip = (Number(page) - 1) * Number(limit);

        const where: any = { patientId };
        if (patternType) where.patternType = patternType;
        if (isActive !== undefined) where.isActive = isActive === 'true';

        // Check if patient exists
        const patient = await prisma.patient.findUnique({ where: { id: patientId } });
        if (!patient) {
            res.status(404).json({ error: "Patient not found" });
            return;
        }

        const treatmentPatterns = await prisma.treatmentPattern.findMany({
            where,
            skip,
            take: Number(limit),
            orderBy: { detectedAt: 'desc' }
        });

        const total = await prisma.treatmentPattern.count({ where });

        res.json({
            treatmentPatterns,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        console.error("Get patient treatment patterns error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const updateTreatmentPattern = async (req: TreatmentPatternRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const {
            patternType,
            description,
            frequency,
            confidence,
            isActive
        } = req.body;

        const existingTreatmentPattern = await prisma.treatmentPattern.findUnique({ where: { id } });
        if (!existingTreatmentPattern) {
            res.status(404).json({ error: "Treatment pattern not found" });
            return;
        }

        const treatmentPattern = await prisma.treatmentPattern.update({
            where: { id },
            data: {
                patternType,
                description,
                frequency,
                confidence,
                isActive
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

        res.json(treatmentPattern);
    } catch (error) {
        console.error("Update treatment pattern error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const deleteTreatmentPattern = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const existingTreatmentPattern = await prisma.treatmentPattern.findUnique({ where: { id } });
        if (!existingTreatmentPattern) {
            res.status(404).json({ error: "Treatment pattern not found" });
            return;
        }

        await prisma.treatmentPattern.delete({ where: { id } });

        res.json({ message: "Treatment pattern deleted successfully" });
    } catch (error) {
        console.error("Delete treatment pattern error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};