import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { sendEmail } from "../lib/mail";

interface TreatmentRequest extends Request {
    body: {
        visitId?: string;
        name?: string;
        dosage?: string;
        notes?: string;
    }
}

export const createTreatment = async (req: TreatmentRequest, res: Response) => {
    try {
        const { visitId, name, dosage, notes } = req.body;

        if (!visitId || !name) {
            res.status(400).json({ error: "Visit ID and treatment name are required" });
            return;
        }

        const treatment = await prisma.treatment.create({
            data: { visitId, name, dosage, notes }
        });

        res.status(201).json({ message: "Treatment record saved successfully", treatment });
    } catch (error) {
        console.error("Create treatment error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getTreatments = async (req: Request, res: Response) => {
    try {
        const treatments = await prisma.treatment.findMany({
            include: { visit: { include: { patient: true } } }
        });
        res.json(treatments);
    } catch (error) {
        console.error("Get treatments error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getTreatmentById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const treatment = await prisma.treatment.findUnique({
            where: { id },
            include: { visit: { include: { patient: true } } }
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

export const updateTreatment = async (req: TreatmentRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { name, dosage, notes } = req.body;

        const treatment = await prisma.treatment.update({
            where: { id },
            data: { name, dosage, notes }
        });

        res.json({ message: "Treatment record updated successfully", treatment });
    } catch (error) {
        console.error("Update treatment error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const deleteTreatment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.treatment.delete({ where: { id } });
        res.json({ message: "Treatment record deleted successfully" });
    } catch (error) {
        console.error("Delete treatment error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getTreatmentsByVisit = async (req: Request, res: Response) => {
    try {
        const { visitId } = req.params;
        const treatments = await prisma.treatment.findMany({ where: { visitId } });
        res.json(treatments);
    } catch (error) {
        console.error("Get treatments by visit error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
