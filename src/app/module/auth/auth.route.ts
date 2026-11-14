import { Router } from "express";
import { AuthController } from "./auth.controller";
import { auth } from "../../middleware/auth.middleware";
import { Role } from "../../../../generated/prisma/enums";

const router = Router();

router.post('/register', AuthController.registerPatient);

router.post('/login', AuthController.loginUser);

router.get(
    '/me',
    auth(Role.ADMIN, Role.DOCTOR, Role.PATIENT, Role.SUPER_ADMIN),
    AuthController.getMe,
);

router.post('/refresh-token', AuthController.refreshToken);

export const AuthRoutes = router;