import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { AlertSeverity } from "@prisma/client";

interface HealthAlertRequest extends Request {
    body: {
        patientId: string;
        type: string;
        title: string;
        message: string;
        severity: AlertSeverity;
        relatedData?: string;
        acknowledged?: boolean;
        acknowledgedBy?: string;
        isResolved?: boolean;
    }
}

export const createHealthAlert = async (req: HealthAlertRequest, res: Response): Promise<void> => {
    try {
        const {
            patientId,
            type,
            title,
            message,
            severity,
            relatedData,
            acknowledged = false,
            acknowledgedBy,
            isResolved = false
        } = req.body;

        // Check if patient exists
        const patient = await prisma.patient.findUnique({ where: { id: patientId } });
        if (!patient) {
            res.status(404).json({ error: "Patient not found" });
            return;
        }

        const healthAlert = await prisma.healthAlert.create({
            data: {
                patientId,
                type,
                title,
                message,
                severity,
                relatedData,
                acknowledged,
                acknowledgedBy,
                isResolved
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

        res.status(201).json(healthAlert);
    } catch (error) {
        console.error("Create health alert error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getHealthAlert = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const healthAlert = await prisma.healthAlert.findUnique({
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

        if (!healthAlert) {
            res.status(404).json({ error: "Health alert not found" });
            return;
        }

        res.json(healthAlert);
    } catch (error) {
        console.error("Get health alert error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getPatientHealthAlerts = async (req: Request, res: Response): Promise<void> => {
    try {
        const { patientId } = req.params;
        const { type, severity, isResolved, page = 1, limit = 10 } = req.query;

        const skip = (Number(page) - 1) * Number(limit);

        const where: any = { patientId };
        if (type) where.type = type as string;
        if (severity) where.severity = severity as AlertSeverity;
        if (isResolved !== undefined) where.isResolved = isResolved === 'true';

        // Check if patient exists
        const patient = await prisma.patient.findUnique({ where: { id: patientId } });
        if (!patient) {
            res.status(404).json({ error: "Patient not found" });
            return;
        }

        const healthAlerts = await prisma.healthAlert.findMany({
            where,
            skip,
            take: Number(limit),
            orderBy: { triggeredAt: 'desc' }
        });

        const total = await prisma.healthAlert.count({ where });

        res.json({
            healthAlerts,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        console.error("Get patient health alerts error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const updateHealthAlert = async (req: HealthAlertRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const {
            type,
            title,
            message,
            severity,
            relatedData,
            acknowledged,
            acknowledgedBy,
            isResolved
        } = req.body;

        const existingHealthAlert = await prisma.healthAlert.findUnique({ where: { id } });
        if (!existingHealthAlert) {
            res.status(404).json({ error: "Health alert not found" });
            return;
        }

        const updateData: any = {
            type,
            title,
            message,
            severity,
            relatedData
        };

        if (acknowledged !== undefined) {
            updateData.acknowledged = acknowledged;
            if (acknowledged && acknowledgedBy) {
                updateData.acknowledgedBy = acknowledgedBy;
                updateData.acknowledgedAt = new Date();
            }
        }

        if (isResolved !== undefined) {
            updateData.isResolved = isResolved;
            if (isResolved) {
                updateData.resolvedAt = new Date();
            }
        }

        const healthAlert = await prisma.healthAlert.update({
            where: { id },
            data: updateData,
            include: {
                patient: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });

        res.json(healthAlert);
    } catch (error) {
        console.error("Update health alert error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const deleteHealthAlert = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const existingHealthAlert = await prisma.healthAlert.findUnique({ where: { id } });
        if (!existingHealthAlert) {
            res.status(404).json({ error: "Health alert not found" });
            return;
        }

        await prisma.healthAlert.delete({ where: { id } });

        res.json({ message: "Health alert deleted successfully" });
    } catch (error) {
        console.error("Delete health alert error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const acknowledgeAlert = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { acknowledgedBy } = req.body;

        const existingHealthAlert = await prisma.healthAlert.findUnique({ where: { id } });
        if (!existingHealthAlert) {
            res.status(404).json({ error: "Health alert not found" });
            return;
        }

        const healthAlert = await prisma.healthAlert.update({
            where: { id },
            data: {
                acknowledged: true,
                acknowledgedBy,
                acknowledgedAt: new Date()
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

        res.json(healthAlert);
    } catch (error) {
        console.error("Acknowledge alert error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const resolveAlert = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const existingHealthAlert = await prisma.healthAlert.findUnique({ where: { id } });
        if (!existingHealthAlert) {
            res.status(404).json({ error: "Health alert not found" });
            return;
        }

        const healthAlert = await prisma.healthAlert.update({
            where: { id },
            data: {
                isResolved: true,
                resolvedAt: new Date()
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

        res.json(healthAlert);
    } catch (error) {
        console.error("Resolve alert error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};