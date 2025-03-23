import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"

export const userMiddleware = async(req: Request, res: Response, next:NextFunction) => {    
    const header = req.headers.authorization;
    const token = header?.split(' ')[1];

    if (!token) {
        res.status(403).json({ message: "unauthorized access"});
        return
    }

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || "HELLO") as {role: string, userId: string};
        req.userId = decodedToken.userId
        next();
    } catch (error) {
        res.status(403).json({ message: "unauthorized access"});
        return;
    }

}