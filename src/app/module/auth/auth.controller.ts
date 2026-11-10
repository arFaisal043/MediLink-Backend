import { Request, Response } from "express"
import { catchAsync } from "../../utils/catchAsync"
import { AuthService } from "./auth.service"

const registerPatient = catchAsync(async (req: Request, res: Response) => {
    const result = await AuthService.registerPatient();
    console.log("Hello");
})

export const AuthController = {
    registerPatient
}