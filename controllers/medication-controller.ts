import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

interface MedicationRequest extends Request {
    body: {
        patientId: string;
        name: string;
        dosage: string;
        frequency: string;
        route?: string;
        purpose?: string;
        startDate: string;
        endDate?: string;
        isActive?: boolean;
        prescribedBy?: string;
        notes?: string;
    }
}

export const createMedication = async (req: MedicationRequest, res: Response): Promise<void> => {
    try {
        const {
            patientId,
            name,
            dosage,
            frequency,
            route,
            purpose,
            startDate,
            endDate,
            isActive = true,
            prescribedBy,
            notes
        } = req.body;

        // Check if patient exists
        const patient = await prisma.patient.findUnique({ where: { id: patientId } });
        if (!patient) {
            res.status(404).json({ error: "Patient not found" });
            return;
        }

        const medication = await prisma.medication.create({
            data: {
                patientId,
                name,
                dosage,
                frequency,
                route,
                purpose,
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : undefined,
                isActive,
                prescribedBy,
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

        res.status(201).json(medication);
    } catch (error) {
        console.error("Create medication error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getMedication = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const medication = await prisma.medication.findUnique({
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

        if (!medication) {
            res.status(404).json({ error: "Medication not found" });
            return;
        }

        res.json(medication);
    } catch (error) {
        console.error("Get medication error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getPatientMedications = async (req: Request, res: Response): Promise<void> => {
    try {
        const { patientId } = req.params;
        const { isActive, page = 1, limit = 10 } = req.query;

        const skip = (Number(page) - 1) * Number(limit);

        const where: any = { patientId };
        if (isActive !== undefined) where.isActive = isActive === 'true';

        // Check if patient exists
        const patient = await prisma.patient.findUnique({ where: { id: patientId } });
        if (!patient) {
            res.status(404).json({ error: "Patient not found" });
            return;
        }

        const medications = await prisma.medication.findMany({
            where,
            skip,
            take: Number(limit),
            orderBy: { startDate: 'desc' }
        });

        const total = await prisma.medication.count({ where });

        res.json({
            medications,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        console.error("Get patient medications error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const updateMedication = async (req: MedicationRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const {
            name,
            dosage,
            frequency,
            route,
            purpose,
            startDate,
            endDate,
            isActive,
            prescribedBy,
            notes
        } = req.body;

        const existingMedication = await prisma.medication.findUnique({ where: { id } });
        if (!existingMedication) {
            res.status(404).json({ error: "Medication not found" });
            return;
        }

        const medication = await prisma.medication.update({
            where: { id },
            data: {
                name,
                dosage,
                frequency,
                route,
                purpose,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                isActive,
                prescribedBy,
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

        res.json(medication);
    } catch (error) {
        console.error("Update medication error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const deleteMedication = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const existingMedication = await prisma.medication.findUnique({ where: { id } });
        if (!existingMedication) {
            res.status(404).json({ error: "Medication not found" });
            return;
        }

        await prisma.medication.delete({ where: { id } });

        res.json({ message: "Medication deleted successfully" });
    } catch (error) {
        console.error("Delete medication error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};