import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { VisitType } from "@prisma/client";

interface VisitRequest extends Request {
    body: {
        patientId: string;
        staffId?: string;
        date?: string;
        visitType: VisitType;
        chiefComplaint?: string;
        subjective?: string;
        objective?: string;
        assessment?: string;
        plan?: string;
        notes?: string;
        followUpRequired?: boolean;
        followUpDate?: string;
    };
}

export const createVisit = async (req: VisitRequest, res: Response): Promise<void> => {
    try {
        const {
            patientId,
            staffId,
            date,
            visitType,
            chiefComplaint,
            subjective,
            objective,
            assessment,
            plan,
            notes,
            followUpRequired = false,
            followUpDate,
        } = req.body;

        const patient = await prisma.patient.findUnique({
            where: { id: patientId }
        });

        if (!patient) {
            res.status(404).json({ error: "Patient not found" });
            return;
        }

        if (staffId) {
            const staff = await prisma.staff.findUnique({
                where: { id: staffId }
            });

            if (!staff) {
                res.status(404).json({ error: "Staff member not found" });
                return;
            }
        }

        const visit = await prisma.visit.create({
            data: {
                patientId,
                staffId,
                date: date ? new Date(date) : new Date(),
                visitType,
                chiefComplaint,
                subjective,
                objective,
                assessment,
                plan,
                notes,
                followUpRequired,
                followUpDate: followUpDate ? new Date(followUpDate) : undefined,
            },
            include: {
                patient: {
                    select: {
                        firstName: true,
                        lastName: true,
                        age: true,
                        gender: true
                    }
                },
                assignedStaff: {
                    select: {
                        firstName: true,
                        lastName: true,
                        department: true
                    }
                },
                vitalSigns: true,
                treatments: true,
                labResults: true,
                diagnoses: true,
                prescriptions: true,
            },
        });

        res.status(201).json(visit);
    } catch (error) {
        console.error("Create visit error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getAllVisits = async (req: Request, res: Response): Promise<void> => {
    try {
        const visits = await prisma.visit.findMany({
            include: {
                patient: {
                    select: {
                        firstName: true,
                        lastName: true,
                        age: true,
                        gender: true
                    }
                },
                assignedStaff: {
                    select: {
                        firstName: true,
                        lastName: true,
                        department: true
                    }
                },
                vitalSigns: true,
                treatments: true,
                labResults: true,
                diagnoses: true,
                prescriptions: true,
            },
        });

        res.status(200).json(visits);
    } catch (error) {
        console.error("Get all visits error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getVisitById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const visit = await prisma.visit.findUnique({
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
                assignedStaff: {
                    select: {
                        firstName: true,
                        lastName: true,
                        department: true
                    }
                },
                vitalSigns: true,
                treatments: true,
                labResults: true,
                diagnoses: true,
                prescriptions: true,
            },
        });

        if (!visit) {
            res.status(404).json({ error: "Visit not found" });
            return;
        }

        res.status(200).json(visit);
    } catch (error) {
        console.error("Get visit error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getVisit = getVisitById;

export const getPatientVisits = async (req: Request, res: Response): Promise<void> => {
    try {
        const { patientId } = req.params;

        const visits = await prisma.visit.findMany({
            where: { patientId },
            include: {
                patient: {
                    select: {
                        firstName: true,
                        lastName: true,
                        age: true,
                        gender: true
                    }
                },
                assignedStaff: {
                    select: {
                        firstName: true,
                        lastName: true,
                        department: true
                    }
                },
                vitalSigns: true,
                treatments: true,
                labResults: true,
                diagnoses: true,
                prescriptions: true,
            },
        });

        res.status(200).json(visits);
    } catch (error) {
        console.error("Get patient visits error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const updateVisit = async (req: VisitRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const {
            staffId,
            date,
            visitType,
            chiefComplaint,
            subjective,
            objective,
            assessment,
            plan,
            notes,
            followUpRequired,
            followUpDate,
        } = req.body;

        const visit = await prisma.visit.update({
            where: { id },
            data: {
                staffId,
                date: date ? new Date(date) : undefined,
                visitType,
                chiefComplaint,
                subjective,
                objective,
                assessment,
                plan,
                notes,
                followUpRequired,
                followUpDate: followUpDate ? new Date(followUpDate) : undefined,
            },
            include: {
                patient: {
                    select: {
                        firstName: true,
                        lastName: true,
                        age: true,
                        gender: true
                    }
                },
                assignedStaff: {
                    select: {
                        firstName: true,
                        lastName: true,
                        department: true
                    }
                },
                vitalSigns: true,
                treatments: true,
                labResults: true,
                diagnoses: true,
                prescriptions: true,
            },
        });

        res.status(200).json(visit);
    } catch (error) {
        console.error("Update visit error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const deleteVisit = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        await prisma.visit.delete({
            where: { id }
        });

        res.status(204).send();
    } catch (error) {
        console.error("Delete visit error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};