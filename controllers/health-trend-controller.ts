import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { TrendDirection } from "@prisma/client";

interface HealthTrendRequest extends Request {
    body: {
        patientId: string;
        metric: string;
        trend: TrendDirection;
        period: string;
        currentValue: number;
        previousValue: number;
        changePercentage: number;
        summary: string;
        confidence: number;
    }
}

export const createHealthTrend = async (req: HealthTrendRequest, res: Response): Promise<void> => {
    try {
        const {
            patientId,
            metric,
            trend,
            period,
            currentValue,
            previousValue,
            changePercentage,
            summary,
            confidence
        } = req.body;

        // Check if patient exists
        const patient = await prisma.patient.findUnique({ where: { id: patientId } });
        if (!patient) {
            res.status(404).json({ error: "Patient not found" });
            return;
        }

        const healthTrend = await prisma.healthTrend.create({
            data: {
                patientId,
                metric,
                trend,
                period,
                currentValue,
                previousValue,
                changePercentage,
                summary,
                confidence
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

        res.status(201).json(healthTrend);
    } catch (error) {
        console.error("Create health trend error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getHealthTrend = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const healthTrend = await prisma.healthTrend.findUnique({
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

        if (!healthTrend) {
            res.status(404).json({ error: "Health trend not found" });
            return;
        }

        res.json(healthTrend);
    } catch (error) {
        console.error("Get health trend error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getPatientHealthTrends = async (req: Request, res: Response): Promise<void> => {
    try {
        const { patientId } = req.params;
        const { metric, trend, page = 1, limit = 10 } = req.query;

        const skip = (Number(page) - 1) * Number(limit);

        const where: any = { patientId };
        if (metric) where.metric = metric as string;
        if (trend) where.trend = trend as TrendDirection;

        // Check if patient exists
        const patient = await prisma.patient.findUnique({ where: { id: patientId } });
        if (!patient) {
            res.status(404).json({ error: "Patient not found" });
            return;
        }

        const healthTrends = await prisma.healthTrend.findMany({
            where,
            skip,
            take: Number(limit),
            orderBy: { calculatedAt: 'desc' }
        });

        const total = await prisma.healthTrend.count({ where });

        res.json({
            healthTrends,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        console.error("Get patient health trends error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getPatientTrendSummary = async (req: Request, res: Response): Promise<void> => {
    try {
        const { patientId } = req.params;

        // Check if patient exists
        const patient = await prisma.patient.findUnique({ where: { id: patientId } });
        if (!patient) {
            res.status(404).json({ error: "Patient not found" });
            return;
        }

        const recentTrends = await prisma.healthTrend.findMany({
            where: { patientId },
            orderBy: { calculatedAt: 'desc' },
            take: 20
        });

        // Group trends by metric and get the most recent one
        const trendSummary: any = {};
        recentTrends.forEach(trend => {
            if (!trendSummary[trend.metric] || trendSummary[trend.metric].calculatedAt < trend.calculatedAt) {
                trendSummary[trend.metric] = trend;
            }
        });

        res.json({
            patient: {
                id: patient.id,
                firstName: patient.firstName,
                lastName: patient.lastName
            },
            trends: Object.values(trendSummary)
        });
    } catch (error) {
        console.error("Get patient trend summary error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const deleteHealthTrend = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const existingHealthTrend = await prisma.healthTrend.findUnique({ where: { id } });
        if (!existingHealthTrend) {
            res.status(404).json({ error: "Health trend not found" });
            return;
        }

        await prisma.healthTrend.delete({ where: { id } });

        res.json({ message: "Health trend deleted successfully" });
    } catch (error) {
        console.error("Delete health trend error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};