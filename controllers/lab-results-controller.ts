import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

interface LabResultRequest extends Request {
    body: {
        patientId: string;
        visitId?: string;
        testName: string;
        testCategory: string;
        resultValue: string;
        normalRange?: string;
        units?: string;
        isAbnormal?: boolean;
        notes?: string;
    }
}

export const createLabResult = async (req: LabResultRequest, res: Response): Promise<void> => {
    try {
        const {
            patientId,
            visitId,
            testName,
            testCategory,
            resultValue,
            normalRange,
            units,
            isAbnormal = false,
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

        const labResult = await prisma.labResult.create({
            data: {
                patientId,
                visitId,
                testName,
                testCategory,
                resultValue,
                normalRange,
                units,
                isAbnormal,
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

        res.status(201).json(labResult);
    } catch (error) {
        console.error("Create lab result error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getLabResult = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const labResult = await prisma.labResult.findUnique({
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

        if (!labResult) {
            res.status(404).json({ error: "Lab result not found" });
            return;
        }

        res.json(labResult);
    } catch (error) {
        console.error("Get lab result error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getPatientLabResults = async (req: Request, res: Response): Promise<void> => {
    try {
        const { patientId } = req.params;
        const { page = 1, limit = 10, testCategory, isAbnormal } = req.query;

        const skip = (Number(page) - 1) * Number(limit);

        const where: any = { patientId };
        if (testCategory) where.testCategory = testCategory;
        if (isAbnormal !== undefined) where.isAbnormal = isAbnormal === 'true';

        // Check if patient exists
        const patient = await prisma.patient.findUnique({ where: { id: patientId } });
        if (!patient) {
            res.status(404).json({ error: "Patient not found" });
            return;
        }

        const labResults = await prisma.labResult.findMany({
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

        const total = await prisma.labResult.count({ where });

        res.json({
            labResults,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        console.error("Get patient lab results error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const updateLabResult = async (req: LabResultRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const {
            testName,
            testCategory,
            resultValue,
            normalRange,
            units,
            isAbnormal,
            notes
        } = req.body;

        const existingLabResult = await prisma.labResult.findUnique({ where: { id } });
        if (!existingLabResult) {
            res.status(404).json({ error: "Lab result not found" });
            return;
        }

        const labResult = await prisma.labResult.update({
            where: { id },
            data: {
                testName,
                testCategory,
                resultValue,
                normalRange,
                units,
                isAbnormal,
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

        res.json(labResult);
    } catch (error) {
        console.error("Update lab result error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const deleteLabResult = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const existingLabResult = await prisma.labResult.findUnique({ where: { id } });
        if (!existingLabResult) {
            res.status(404).json({ error: "Lab result not found" });
            return;
        }

        await prisma.labResult.delete({ where: { id } });

        res.json({ message: "Lab result deleted successfully" });
    } catch (error) {
        console.error("Delete lab result error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getLabStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const { patientId } = req.params;

        const stats = await prisma.labResult.groupBy({
            by: ['testCategory'],
            where: { patientId },
            _count: {
                id: true
            },
            _max: {
                date: true
            }
        });

        const abnormalCount = await prisma.labResult.count({
            where: {
                patientId,
                isAbnormal: true
            }
        });

        res.json({
            categories: stats,
            abnormalCount,
            totalTests: stats.reduce((acc, curr) => acc + curr._count.id, 0)
        });
    } catch (error) {
        console.error("Get lab stats error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};