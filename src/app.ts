import express, { Application, Request, Response } from "express";

const app: Application = express();

app.get("/", (req: Request, res: Response) => {
    res.json({
        "status": "OK",
        "message": "This is Root routes!"
    })
})

export default app;