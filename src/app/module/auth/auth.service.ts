import { Role, UserStatus } from "../../../../generated/prisma/enums";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { CustomError } from "../../utils/customError";
import { ILoginUserPayload, IRegisterPatientPayload, IRequestUser } from "./auth.interface";
import bcrypt from "bcryptjs";
import statusCode from "http-status";
import { jwtUtils } from "../../utils/jwt";
import { JwtPayload, SignOptions } from "jsonwebtoken";

const registerPatient = async (payload: IRegisterPatientPayload) => {
    const {name, password} = payload;
    const email = payload.email.trim().toLowerCase(); // trim() -> remove white space

    if (!email) {
        console.log("Email is required");
    }

    // _________ Is user exist or not? 
    // prisma.user -> from prisma model
    const isUserExists = await prisma.user.findUnique({
        where: {email}
    })

    if(isUserExists) {
        throw new CustomError('User with this email already exists', statusCode.BAD_REQUEST);
    }

    // _________ Hash Password 
    const hashPassword = await bcrypt.hash(password, Number(config.bcrypt_salt_rounds) || 10);

    // _________ Create user  
    const createUser = await prisma.user.create({
        data: {
            name,
            email,
            password: hashPassword,
            role: Role.PATIENT,
            status: UserStatus.ACTIVE,
            emailVerified: false,
            patient: {
                create: {name, email}
            },
        },
        // for not show pass on response
        omit: {password: true},
        include: {patient: true}
    })

    const {patient, ...user} = createUser;

    const jwtPayload = {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    }

    // _________ Create Access Token
    const accessToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_access_secret,
        config.jwt_access_expires_in as SignOptions
    )

    // _________ Create Refresh Token
    const refreshToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_refresh_secret,
        config.jwt_refresh_expires_in as SignOptions
    )

    return {
        user,
        patient,
        accessToken,
        refreshToken
    }
}

const loginUser = async (payload: ILoginUserPayload) => {
    const { password } = payload;
    const email = payload.email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
        where: { email },
    })

    if (!user) {
        throw new Error('User not found');
    }

    if (user.status === UserStatus.BLOCKED) {
        throw new Error('User is blocked');
    }

    if (user.isDeleted || user.status === UserStatus.DELETED) {
        throw new Error('User is deleted');
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password)

    if (!isPasswordMatched) {
        throw new Error('Invalid credentials');
    }

    const jwtPayload = {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    }

    const accessToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_access_secret,
        config.jwt_access_expires_in as SignOptions
    );

    const refreshToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_refresh_secret,
        config.jwt_refresh_expires_in as SignOptions
    );

    return {
        accessToken,
        refreshToken
    }
}

const getMe = async (user: IRequestUser) => {
    const isUserExists = await prisma.user.findUnique({
        where: {
            id: user.userId,
        },
        include: {
            patient: true,
        },
        omit: {
            password: true,
        },
    })

    if (!isUserExists) {
        throw new Error('User not found')
    }

    return isUserExists
}

const refreshToken = async (token: string) => {
    const verifiedRefreshToken = jwtUtils.verifyToken(token, config.jwt_refresh_secret);

    if (!verifiedRefreshToken.success || !verifiedRefreshToken.data) {
        throw new Error(config.node_env === 'development' ? verifiedRefreshToken.error : 'Invalid refresh token');
    }

    const data = verifiedRefreshToken.data as JwtPayload;

    const user = await prisma.user.findUnique({
        where: { id: data.userId },
    })

    if (!user || user.isDeleted || user.status !== UserStatus.ACTIVE) {
        throw new Error('User is inactive or not found');
    }

    const jwtPayload = {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    }

    const accessToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_access_secret,
        config.jwt_access_expires_in as SignOptions
    );

    const refreshToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_refresh_secret,
        config.jwt_refresh_expires_in as SignOptions
    );

    return {
        accessToken,
        refreshToken
    }
}

export const AuthService = {
    registerPatient,
    loginUser,
    getMe,
    refreshToken
}