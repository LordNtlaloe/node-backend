import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { sendEmail } from "../lib/mail";

interface VisitRequest extends Request {
    body: {
        patientId?: string;
        date?: Date;
        notes?: string;
    }
}

export const createVisit = async (req: VisitRequest, res: Response) => {
    try {
        const { patientId, date, notes } = req.body;

        if (!patientId) {
            res.status(400).json({ error: "Patient ID is required" });
            return;
        }

        const visit = await prisma.visit.create({
            data: { patientId, date: date || new Date(), notes }
        });

        res.status(201).json({ message: "Visit record saved successfully", visit });
    } catch (error) {
        console.error("Create visit error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getVisits = async (req: Request, res: Response) => {
    try {
        const visits = await prisma.visit.findMany({
            include: { treatments: true, patient: true }
        });
        res.json(visits);
    } catch (error) {
        console.error("Get visits error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getVisitById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const visit = await prisma.visit.findUnique({
            where: { id },
            include: { treatments: true, patient: true }
        });

        if (!visit) {
            res.status(404).json({ error: "Visit not found" });
            return;
        }

        res.json(visit);
    } catch (error) {
        console.error("Get visit error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const updateVisit = async (req: VisitRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { date, notes } = req.body;

        const visit = await prisma.visit.update({
            where: { id },
            data: { date, notes }
        });

        res.json({ message: "Visit record updated successfully", visit });
    } catch (error) {
        console.error("Update visit error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const deleteVisit = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.visit.delete({ where: { id } });
        res.json({ message: "Visit record deleted successfully" });
    } catch (error) {
        console.error("Delete visit error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getVisitsByPatient = async (req: Request, res: Response) => {
    try {
        const { patientId } = req.params;
        const visits = await prisma.visit.findMany({
            where: { patientId },
            include: { treatments: true }
        });
        res.json(visits);
    } catch (error) {
        console.error("Get visits by patient error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
