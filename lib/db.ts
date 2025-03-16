import { PrismaClient } from "@prisma/client";

// Prevent multiple instances of Prisma Client in development
declare global {
  var prisma: PrismaClient | undefined;
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ["query", "error", "warn"],
  });
};

export const prisma = global.prisma || prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

// Handle potential initialization errors
prisma
  .$connect()
  .then(() => {
    console.log("Successfully connected to the database");
  })
  .catch((e) => {
    console.error("Failed to connect to the database:", e);
  });
