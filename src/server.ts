import app from "./app";
import config from "./config";
import { prisma } from "./lib/prisma";

const PORT = config.port;

const startServer = async () => {
    try {
        await prisma.$connect();
        console.log("Connected to the database successfully.");
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        })
    } catch (error) {
        console.error("Failed to start server... ", error);
        await prisma.$disconnect();
        process.exit(1);
    }
}

startServer();