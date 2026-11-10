import express, { Application, Request, Response } from "express";
import morgan from 'morgan';
import helmet from "helmet";
import { rateLimit } from 'express-rate-limit';
import cookieParser from "cookie-parser";
import config from "./app/config";
import cors from "cors";

const app: Application = express();

// Security Middleware
app.use(helmet());

// Logger
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Rate Limiting (limit repeated requests to APIs)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: {
    status: "ERROR",
    message: "Too many requests from this IP, please try again after 15 minutes",
  },
  standardHeaders: true, 
  legacyHeaders: false, 
});
// Temporarily commented out for load testing:
app.use("/api", apiLimiter);


// Built in Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text());

app.use(cookieParser());

app.use(
  cors({
    origin: config.backend_url,
    credentials: true,
    optionsSuccessStatus: 200,
  }),
);

// ___________ Root Routes
app.get("/", (req: Request, res: Response) => {
  res.json({
    status: "OK",
    message: "Welcome to MediLink!",
  });
});

export default app;