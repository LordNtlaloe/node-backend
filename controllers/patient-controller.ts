
import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

interface PatientRequest extends Request {
    body: {
        userId?: string;
        firstName?: string;
        lastName?: string;
        age?: number;
        contactInfo?: string;
        medicalHistory?: string;
    }
}

export const createPatient = async (req: PatientRequest, res: Response) => {
    try {
        const { userId, firstName, lastName, age, contactInfo, medicalHistory } = req.body;

        if (!userId || !firstName || !lastName || !age || !contactInfo) {
            res.status(400).json({ error: "All required fields must be filled" });
            return;
        }

        const patient = await prisma.patient.create({
            data: { userId, firstName, lastName, age, contactInfo, medicalHistory }
        });

        res.status(201).json({ message: "Patient record saved successfully", patient });
    } catch (error) {
        console.error("Create patient error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getPatients = async (req: Request, res: Response) => {
    try {
        const patients = await prisma.patient.findMany({
            include: { visits: { include: { treatments: true } } }
        });
        res.json(patients);
    } catch (error) {
        console.error("Get patients error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getPatientById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const patient = await prisma.patient.findUnique({
            where: { id },
            include: { visits: { include: { treatments: true } } }
        });

        if (!patient) {
            res.status(404).json({ error: "Patient not found" });
            return;
        }

        res.json(patient);
    } catch (error) {
        console.error("Get patient error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const updatePatient = async (req: PatientRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, age, contactInfo, medicalHistory } = req.body;

        const patient = await prisma.patient.update({
            where: { id },
            data: { firstName, lastName, age, contactInfo, medicalHistory }
        });

        res.json({ message: "Patient record updated successfully", patient });
    } catch (error) {
        console.error("Update patient error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const deletePatient = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.patient.delete({ where: { id } });
        res.json({ message: "Patient record deleted successfully" });
    } catch (error) {
        console.error("Delete patient error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const searchPatients = async (req: Request, res: Response) => {
    try {
        const { query } = req.query;
        if (!query) {
            res.status(400).json({ error: "Search query required" });
            return;
        }

        const patients = await prisma.patient.findMany({
            where: {
                OR: [
                    { firstName: { contains: String(query), mode: "insensitive" } },
                    { lastName: { contains: String(query), mode: "insensitive" } },
                    { contactInfo: { contains: String(query), mode: "insensitive" } }
                ]
            }
        });

        res.json(patients);
    } catch (error) {
        console.error("Search patients error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
