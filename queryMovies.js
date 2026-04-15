const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.movie.findMany().then(res => console.log(res)).catch(console.error).finally(() => prisma.$disconnect());
