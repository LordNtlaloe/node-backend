import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

interface TreatmentRequest extends Request {
    body: {
        visitId: string;
        name: string;
        description?: string;
        duration?: string;
        instructions?: string;
    }
}

export const createTreatment = async (req: TreatmentRequest, res: Response): Promise<void> => {
    try {
        const {
            visitId,
            name,
            description,
            duration,
            instructions
        } = req.body;

        // Check if visit exists
        const visit = await prisma.visit.findUnique({ where: { id: visitId } });
        if (!visit) {
            res.status(404).json({ error: "Visit not found" });
            return;
        }

        const treatment = await prisma.treatment.create({
            data: {
                visitId,
                name,
                description,
                duration,
                instructions
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

        res.status(201).json(treatment);
    } catch (error) {
        console.error("Create treatment error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getTreatment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const treatment = await prisma.treatment.findUnique({
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

        if (!treatment) {
            res.status(404).json({ error: "Treatment not found" });
            return;
        }

        res.json(treatment);
    } catch (error) {
        console.error("Get treatment error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getVisitTreatments = async (req: Request, res: Response): Promise<void> => {
    try {
        const { visitId } = req.params;

        // Check if visit exists
        const visit = await prisma.visit.findUnique({ where: { id: visitId } });
        if (!visit) {
            res.status(404).json({ error: "Visit not found" });
            return;
        }

        const treatments = await prisma.treatment.findMany({
            where: { visitId },
            orderBy: { createdAt: 'asc' }
        });

        res.json(treatments);
    } catch (error) {
        console.error("Get visit treatments error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const updateTreatment = async (req: TreatmentRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const {
            name,
            description,
            duration,
            instructions
        } = req.body;

        const existingTreatment = await prisma.treatment.findUnique({ where: { id } });
        if (!existingTreatment) {
            res.status(404).json({ error: "Treatment not found" });
            return;
        }

        const treatment = await prisma.treatment.update({
            where: { id },
            data: {
                name,
                description,
                duration,
                instructions
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

        res.json(treatment);
    } catch (error) {
        console.error("Update treatment error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const deleteTreatment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const existingTreatment = await prisma.treatment.findUnique({ where: { id } });
        if (!existingTreatment) {
            res.status(404).json({ error: "Treatment not found" });
            return;
        }

        await prisma.treatment.delete({ where: { id } });

        res.json({ message: "Treatment deleted successfully" });
    } catch (error) {
        console.error("Delete treatment error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};