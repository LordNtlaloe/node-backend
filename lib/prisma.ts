import { PrismaClient } from "../generated/prisma";

let prisma: PrismaClient;

declare global {
    var prisma: PrismaClient | undefined;
}

if (global.prisma) {
    prisma = global.prisma;
} else {
    prisma = new PrismaClient();
    global.prisma = prisma;
}

export { prisma };
