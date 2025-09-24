"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const prisma_1 = require("../generated/prisma");
let prisma;
if (global.prisma) {
    exports.prisma = prisma = global.prisma;
}
else {
    exports.prisma = prisma = new prisma_1.PrismaClient();
    global.prisma = prisma;
}
