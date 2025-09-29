import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

interface AuditLogRequest extends Request {
    body: {
        action: string;
        userId?: string;
        userRole?: string;
        resource?: string;
        resourceId?: string;
        details?: string;
        ipAddress?: string;
        userAgent?: string;
    }
}

export const createAuditLog = async (req: AuditLogRequest, res: Response): Promise<void> => {
    try {
        const {
            action,
            userId,
            userRole,
            resource,
            resourceId,
            details,
            ipAddress,
            userAgent
        } = req.body;

        const auditLog = await prisma.auditLog.create({
            data: {
                action,
                userId,
                userRole,
                resource,
                resourceId,
                details,
                ipAddress,
                userAgent
            }
        });

        res.status(201).json(auditLog);
    } catch (error) {
        console.error("Create audit log error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getAuditLog = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const auditLog = await prisma.auditLog.findUnique({
            where: { id }
        });

        if (!auditLog) {
            res.status(404).json({ error: "Audit log not found" });
            return;
        }

        res.json(auditLog);
    } catch (error) {
        console.error("Get audit log error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getAuditLogs = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            action,
            userId,
            resource,
            resourceId,
            startDate,
            endDate,
            page = 1,
            limit = 10
        } = req.query;

        const skip = (Number(page) - 1) * Number(limit);

        const where: any = {};

        if (action) where.action = action;
        if (userId) where.userId = userId;
        if (resource) where.resource = resource;
        if (resourceId) where.resourceId = resourceId;

        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = new Date(startDate as string);
            if (endDate) where.createdAt.lte = new Date(endDate as string);
        }

        const auditLogs = await prisma.auditLog.findMany({
            where,
            skip,
            take: Number(limit),
            orderBy: { createdAt: 'desc' }
        });

        const total = await prisma.auditLog.count({ where });

        res.json({
            auditLogs,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        console.error("Get audit logs error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getUserActivity = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const skip = (Number(page) - 1) * Number(limit);

        // Check if user exists
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        const activities = await prisma.auditLog.findMany({
            where: { userId },
            skip,
            take: Number(limit),
            orderBy: { createdAt: 'desc' }
        });

        const total = await prisma.auditLog.count({ where: { userId } });

        res.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            },
            activities,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        console.error("Get user activity error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const deleteAuditLog = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const existingAuditLog = await prisma.auditLog.findUnique({ where: { id } });
        if (!existingAuditLog) {
            res.status(404).json({ error: "Audit log not found" });
            return;
        }

        await prisma.auditLog.delete({ where: { id } });

        res.json({ message: "Audit log deleted successfully" });
    } catch (error) {
        console.error("Delete audit log error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};