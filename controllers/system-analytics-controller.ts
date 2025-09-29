import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

interface SystemAnalyticRequest extends Request {
    body: {
        metric: string;
        value: number;
        period: string;
        department?: string;
        metadata?: string;
    }
}

export const createSystemAnalytic = async (req: SystemAnalyticRequest, res: Response): Promise<void> => {
    try {
        const {
            metric,
            value,
            period,
            department,
            metadata
        } = req.body;

        const systemAnalytic = await prisma.systemAnalytic.create({
            data: {
                metric,
                value,
                period,
                department,
                metadata
            }
        });

        res.status(201).json(systemAnalytic);
    } catch (error) {
        console.error("Create system analytic error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getSystemAnalytic = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const systemAnalytic = await prisma.systemAnalytic.findUnique({
            where: { id }
        });

        if (!systemAnalytic) {
            res.status(404).json({ error: "System analytic not found" });
            return;
        }

        res.json(systemAnalytic);
    } catch (error) {
        console.error("Get system analytic error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
        const { metric, period, department, startDate, endDate, page = 1, limit = 10 } = req.query;

        const skip = (Number(page) - 1) * Number(limit);

        const where: any = {};

        if (metric) where.metric = metric;
        if (period) where.period = period;
        if (department) where.department = department;

        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date.gte = new Date(startDate as string);
            if (endDate) where.date.lte = new Date(endDate as string);
        }

        const analytics = await prisma.systemAnalytic.findMany({
            where,
            skip,
            take: Number(limit),
            orderBy: { date: 'desc' }
        });

        const total = await prisma.systemAnalytic.count({ where });

        res.json({
            analytics,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        console.error("Get analytics error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        // Get counts for dashboard
        const [
            totalPatients,
            totalStaff,
            todayAppointments,
            totalVisits,
            pendingAlerts,
            activeMedications
        ] = await Promise.all([
            prisma.patient.count(),
            prisma.staff.count({ where: { isActive: true } }),
            prisma.appointment.count({
                where: {
                    scheduledAt: {
                        gte: startOfDay
                    },
                    status: {
                        in: ["SCHEDULED", "CONFIRMED"]
                    }
                }
            }),
            prisma.visit.count({
                where: {
                    date: {
                        gte: startOfMonth
                    }
                }
            }),
            prisma.healthAlert.count({
                where: {
                    isResolved: false,
                    severity: { in: ["HIGH", "CRITICAL"] }
                }
            }),
            prisma.medication.count({
                where: {
                    isActive: true
                }
            })
        ]);

        // Get recent activities
        const recentVisits = await prisma.visit.findMany({
            take: 5,
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
            },
            orderBy: { date: 'desc' }
        });

        const recentAlerts = await prisma.healthAlert.findMany({
            where: { isResolved: false },
            take: 5,
            include: {
                patient: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                }
            },
            orderBy: { triggeredAt: 'desc' }
        });

        res.json({
            stats: {
                totalPatients,
                totalStaff,
                todayAppointments,
                monthlyVisits: totalVisits,
                pendingAlerts,
                activeMedications
            },
            recentActivities: {
                visits: recentVisits,
                alerts: recentAlerts
            }
        });
    } catch (error) {
        console.error("Get dashboard stats error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const deleteSystemAnalytic = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const existingSystemAnalytic = await prisma.systemAnalytic.findUnique({ where: { id } });
        if (!existingSystemAnalytic) {
            res.status(404).json({ error: "System analytic not found" });
            return;
        }

        await prisma.systemAnalytic.delete({ where: { id } });

        res.json({ message: "System analytic deleted successfully" });
    } catch (error) {
        console.error("Delete system analytic error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};