import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { sendEmail } from "../lib/mail";
import { VisitType, AppointmentStatus } from "@prisma/client";

interface AppointmentRequest extends Request {
    body: {
        patientId: string;
        staffId?: string;
        scheduledAt: string;
        duration?: number;
        purpose?: string;
        type: VisitType;
        status?: AppointmentStatus;
        notes?: string;
    }
}

export const createAppointment = async (req: AppointmentRequest, res: Response): Promise<void> => {
    try {
        const {
            patientId,
            staffId,
            scheduledAt,
            duration = 30,
            purpose,
            type,
            status = AppointmentStatus.SCHEDULED,
            notes
        } = req.body;

        // Check if patient exists
        const patient = await prisma.patient.findUnique({
            where: { id: patientId },
            include: { user: true }
        });
        if (!patient) {
            res.status(404).json({ error: "Patient not found" });
            return;
        }

        // Check if staff exists if provided
        if (staffId) {
            const staff = await prisma.staff.findUnique({ where: { id: staffId } });
            if (!staff) {
                res.status(404).json({ error: "Staff member not found" });
                return;
            }
        }

        const appointment = await prisma.appointment.create({
            data: {
                patientId,
                staffId,
                scheduledAt: new Date(scheduledAt),
                duration,
                purpose,
                type,
                status,
                notes
            },
            include: {
                patient: {
                    select: {
                        firstName: true,
                        lastName: true,
                        contactInfo: true,
                        user: {
                            select: {
                                email: true
                            }
                        }
                    }
                },
                assignedStaff: {
                    select: {
                        firstName: true,
                        lastName: true,
                        department: true
                    }
                }
            }
        });

        // Send confirmation email (optional)
        if (patient.user?.email) {
            try {
                await sendEmail(
                    patient.user.email,
                    "Appointment Confirmation",
                    `Your appointment has been scheduled for ${new Date(scheduledAt).toLocaleString()}`
                );
            } catch (emailError) {
                console.error("Failed to send appointment email:", emailError);
                // Don't fail the request if email fails
            }
        }

        res.status(201).json(appointment);
    } catch (error) {
        console.error("Create appointment error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getAppointment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const appointment = await prisma.appointment.findUnique({
            where: { id },
            include: {
                patient: {
                    select: {
                        firstName: true,
                        lastName: true,
                        age: true,
                        gender: true,
                        contactInfo: true
                    }
                },
                assignedStaff: {
                    select: {
                        firstName: true,
                        lastName: true,
                        department: true,
                        specialization: true
                    }
                }
            }
        });

        if (!appointment) {
            res.status(404).json({ error: "Appointment not found" });
            return;
        }

        res.json(appointment);
    } catch (error) {
        console.error("Get appointment error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getAllAppointments = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            patientId,
            staffId,
            status,
            type,
            startDate,
            endDate,
            page = 1,
            limit = 10
        } = req.query;

        const skip = (Number(page) - 1) * Number(limit);

        const where: any = {};

        if (patientId) where.patientId = patientId as string;
        if (staffId) where.staffId = staffId as string;
        if (status) where.status = status as AppointmentStatus;
        if (type) where.type = type as VisitType;

        if (startDate || endDate) {
            where.scheduledAt = {};
            if (startDate) where.scheduledAt.gte = new Date(startDate as string);
            if (endDate) where.scheduledAt.lte = new Date(endDate as string);
        }

        const appointments = await prisma.appointment.findMany({
            where,
            skip,
            take: Number(limit),
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
                        lastName: true,
                        department: true
                    }
                }
            },
            orderBy: { scheduledAt: 'asc' }
        });

        const total = await prisma.appointment.count({ where });

        res.json({
            appointments,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        console.error("Get all appointments error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const updateAppointment = async (req: AppointmentRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const {
            staffId,
            scheduledAt,
            duration,
            purpose,
            type,
            status,
            notes
        } = req.body;

        const existingAppointment = await prisma.appointment.findUnique({ where: { id } });
        if (!existingAppointment) {
            res.status(404).json({ error: "Appointment not found" });
            return;
        }

        // Check if staff exists if provided
        if (staffId) {
            const staff = await prisma.staff.findUnique({ where: { id: staffId } });
            if (!staff) {
                res.status(404).json({ error: "Staff member not found" });
                return;
            }
        }

        const appointment = await prisma.appointment.update({
            where: { id },
            data: {
                staffId,
                scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
                duration,
                purpose,
                type,
                status,
                notes
            },
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
        });

        res.json(appointment);
    } catch (error) {
        console.error("Update appointment error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const deleteAppointment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const existingAppointment = await prisma.appointment.findUnique({ where: { id } });
        if (!existingAppointment) {
            res.status(404).json({ error: "Appointment not found" });
            return;
        }

        await prisma.appointment.delete({ where: { id } });

        res.json({ message: "Appointment deleted successfully" });
    } catch (error) {
        console.error("Delete appointment error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const sendAppointmentReminder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const appointment = await prisma.appointment.findUnique({
            where: { id },
            include: {
                patient: {
                    include: {
                        user: true
                    }
                }
            }
        });

        if (!appointment) {
            res.status(404).json({ error: "Appointment not found" });
            return;
        }

        if (appointment.reminderSent) {
            res.status(400).json({ error: "Reminder already sent" });
            return;
        }

        // Send reminder email
        if (appointment.patient.user?.email) {
            try {
                await sendEmail(
                    appointment.patient.user.email,
                    "Appointment Reminder",
                    `Reminder: Your appointment is scheduled for ${appointment.scheduledAt.toLocaleString()}`
                );

                // Mark reminder as sent
                await prisma.appointment.update({
                    where: { id },
                    data: {
                        reminderSent: true,
                        reminderSentAt: new Date()
                    }
                });

                res.json({ message: "Appointment reminder sent successfully" });
            } catch (emailError) {
                console.error("Failed to send reminder email:", emailError);
                res.status(500).json({ error: "Failed to send reminder email" });
            }
        } else {
            res.status(400).json({ error: "Patient email not found" });
        }
    } catch (error) {
        console.error("Send appointment reminder error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getUpcomingAppointments = async (req: Request, res: Response): Promise<void> => {
    try {
        const { days = 7 } = req.query;
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + Number(days));

        const appointments = await prisma.appointment.findMany({
            where: {
                scheduledAt: {
                    gte: new Date(),
                    lte: targetDate
                },
                status: {
                    in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED]
                }
            },
            include: {
                patient: {
                    select: {
                        firstName: true,
                        lastName: true,
                        contactInfo: true
                    }
                },
                assignedStaff: {
                    select: {
                        firstName: true,
                        lastName: true,
                        department: true
                    }
                }
            },
            orderBy: { scheduledAt: 'asc' },
            take: 50
        });

        res.json(appointments);
    } catch (error) {
        console.error("Get upcoming appointments error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};