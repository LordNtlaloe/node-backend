import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

interface VitalSignsRequest extends Request {
    body: {
        patientId: string;
        visitId?: string;
        bloodPressureSystolic?: number;
        bloodPressureDiastolic?: number;
        heartRate?: number;
        temperature?: number;
        weight?: number;
        height?: number;
        bloodSugar?: number;
        oxygenSaturation?: number;
        respiratoryRate?: number;
        notes?: string;
    }
}

export const createVitalSigns = async (req: VitalSignsRequest, res: Response): Promise<void> => {
    try {
        const {
            patientId,
            visitId,
            bloodPressureSystolic,
            bloodPressureDiastolic,
            heartRate,
            temperature,
            weight,
            height,
            bloodSugar,
            oxygenSaturation,
            respiratoryRate,
            notes
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

        // Calculate BMI if weight and height are provided
        let bmi = null;
        if (weight && height && height > 0) {
            const heightInMeters = height / 100;
            bmi = weight / (heightInMeters * heightInMeters);
        }

        const vitalSigns = await prisma.vitalSigns.create({
            data: {
                patientId,
                visitId,
                bloodPressureSystolic,
                bloodPressureDiastolic,
                heartRate,
                temperature,
                weight,
                height,
                bmi,
                bloodSugar,
                oxygenSaturation,
                respiratoryRate,
                notes
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

        res.status(201).json(vitalSigns);
    } catch (error) {
        console.error("Create vital signs error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getVitalSigns = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const vitalSigns = await prisma.vitalSigns.findUnique({
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

        if (!vitalSigns) {
            res.status(404).json({ error: "Vital signs record not found" });
            return;
        }

        res.json(vitalSigns);
    } catch (error) {
        console.error("Get vital signs error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getPatientVitalSigns = async (req: Request, res: Response): Promise<void> => {
    try {
        const { patientId } = req.params;
        const { page = 1, limit = 10, startDate, endDate } = req.query;

        const skip = (Number(page) - 1) * Number(limit);

        const where: any = { patientId };

        if (startDate || endDate) {
            where.recordedAt = {};
            if (startDate) where.recordedAt.gte = new Date(startDate as string);
            if (endDate) where.recordedAt.lte = new Date(endDate as string);
        }

        // Check if patient exists
        const patient = await prisma.patient.findUnique({ where: { id: patientId } });
        if (!patient) {
            res.status(404).json({ error: "Patient not found" });
            return;
        }

        const vitalSigns = await prisma.vitalSigns.findMany({
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
            orderBy: { recordedAt: 'desc' }
        });

        const total = await prisma.vitalSigns.count({ where });

        res.json({
            vitalSigns,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        console.error("Get patient vital signs error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const updateVitalSigns = async (req: VitalSignsRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const {
            bloodPressureSystolic,
            bloodPressureDiastolic,
            heartRate,
            temperature,
            weight,
            height,
            bloodSugar,
            oxygenSaturation,
            respiratoryRate,
            notes
        } = req.body;

        const existingVitalSigns = await prisma.vitalSigns.findUnique({ where: { id } });
        if (!existingVitalSigns) {
            res.status(404).json({ error: "Vital signs record not found" });
            return;
        }

        // Recalculate BMI if weight or height changed
        let bmi = existingVitalSigns.bmi;
        if ((weight !== undefined || height !== undefined) && (weight || existingVitalSigns.weight) && (height || existingVitalSigns.height)) {
            const currentWeight = weight !== undefined ? weight : existingVitalSigns.weight;
            const currentHeight = height !== undefined ? height : existingVitalSigns.height;
            if (currentWeight && currentHeight && currentHeight > 0) {
                const heightInMeters = currentHeight / 100;
                bmi = currentWeight / (heightInMeters * heightInMeters);
            }
        }

        const vitalSigns = await prisma.vitalSigns.update({
            where: { id },
            data: {
                bloodPressureSystolic,
                bloodPressureDiastolic,
                heartRate,
                temperature,
                weight,
                height,
                bmi,
                bloodSugar,
                oxygenSaturation,
                respiratoryRate,
                notes
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

        res.json(vitalSigns);
    } catch (error) {
        console.error("Update vital signs error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const deleteVitalSigns = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const existingVitalSigns = await prisma.vitalSigns.findUnique({ where: { id } });
        if (!existingVitalSigns) {
            res.status(404).json({ error: "Vital signs record not found" });
            return;
        }

        await prisma.vitalSigns.delete({ where: { id } });

        res.json({ message: "Vital signs record deleted successfully" });
    } catch (error) {
        console.error("Delete vital signs error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};