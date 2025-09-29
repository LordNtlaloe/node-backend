import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

interface PrescriptionRequest extends Request {
    body: {
        visitId: string;
        medication: string;
        dosage: string;
        frequency: string;
        duration: string;
        instructions?: string;
        prescribedBy?: string;
        isDispensed?: boolean;
    }
}

export const getAllPrescriptions = async (req: Request, res: Response): Promise<void> => {
    try {
        const prescriptions = await prisma.prescription.findMany({
            include: {
                visit: {
                    include: {
                        patient: {
                            select: {
                                firstName: true,
                                lastName: true
                            }
                        },
                        assignedStaff: {
                            select: {
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(prescriptions);
    } catch (error) {
        console.error("Get all prescriptions error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const createPrescription = async (req: PrescriptionRequest, res: Response): Promise<void> => {
    try {
        const {
            visitId,
            medication,
            dosage,
            frequency,
            duration,
            instructions,
            prescribedBy,
            isDispensed = false
        } = req.body;

        // Check if visit exists
        const visit = await prisma.visit.findUnique({ where: { id: visitId } });
        if (!visit) {
            res.status(404).json({ error: "Visit not found" });
            return;
        }

        const prescription = await prisma.prescription.create({
            data: {
                visitId,
                medication,
                dosage,
                frequency,
                duration,
                instructions,
                prescribedBy,
                isDispensed
            },
            include: {
                visit: {
                    include: {
                        patient: {
                            select: {
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                }
            }
        });

        res.status(201).json(prescription);
    } catch (error) {
        console.error("Create prescription error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getPrescription = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const prescription = await prisma.prescription.findUnique({
            where: { id },
            include: {
                visit: {
                    include: {
                        patient: {
                            select: {
                                firstName: true,
                                lastName: true
                            }
                        },
                        assignedStaff: {
                            select: {
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                }
            }
        });

        if (!prescription) {
            res.status(404).json({ error: "Prescription not found" });
            return;
        }

        res.json(prescription);
    } catch (error) {
        console.error("Get prescription error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getVisitPrescriptions = async (req: Request, res: Response): Promise<void> => {
    try {
        const { visitId } = req.params;

        // Check if visit exists
        const visit = await prisma.visit.findUnique({ where: { id: visitId } });
        if (!visit) {
            res.status(404).json({ error: "Visit not found" });
            return;
        }

        const prescriptions = await prisma.prescription.findMany({
            where: { visitId },
            orderBy: { createdAt: 'asc' }
        });

        res.json(prescriptions);
    } catch (error) {
        console.error("Get visit prescriptions error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const updatePrescription = async (req: PrescriptionRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const {
            medication,
            dosage,
            frequency,
            duration,
            instructions,
            prescribedBy,
            isDispensed
        } = req.body;

        const existingPrescription = await prisma.prescription.findUnique({ where: { id } });
        if (!existingPrescription) {
            res.status(404).json({ error: "Prescription not found" });
            return;
        }

        const prescription = await prisma.prescription.update({
            where: { id },
            data: {
                medication,
                dosage,
                frequency,
                duration,
                instructions,
                prescribedBy,
                isDispensed
            },
            include: {
                visit: {
                    include: {
                        patient: {
                            select: {
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                }
            }
        });

        res.json(prescription);
    } catch (error) {
        console.error("Update prescription error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const deletePrescription = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const existingPrescription = await prisma.prescription.findUnique({ where: { id } });
        if (!existingPrescription) {
            res.status(404).json({ error: "Prescription not found" });
            return;
        }

        await prisma.prescription.delete({ where: { id } });

        res.json({ message: "Prescription deleted successfully" });
    } catch (error) {
        console.error("Delete prescription error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const markAsDispensed = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const existingPrescription = await prisma.prescription.findUnique({ where: { id } });
        if (!existingPrescription) {
            res.status(404).json({ error: "Prescription not found" });
            return;
        }

        const prescription = await prisma.prescription.update({
            where: { id },
            data: { isDispensed: true },
            include: {
                visit: {
                    include: {
                        patient: {
                            select: {
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                }
            }
        });

        res.json(prescription);
    } catch (error) {
        console.error("Mark prescription as dispensed error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};