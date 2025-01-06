import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"

export const adminMiddleware = async(req: Request, res: Response, next:NextFunction) => {
    const header = req.headers.authorization;
    const token = header?.split(' ')[1];

    if (!token) {
        res.status(403).json({ message: "unauthorized access"});
        return
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_PASSWORD || "HELLO") as {role: string, userId: string};
        if(decodedToken.role !== "Admin"){
            res.status(403).json({ message: "unauthorized"});
            return;
        }
        req.userId = decodedToken.userId
        next();
    } catch (error) {
        res.status(403).json({ message: "unauthorized access"});
        return;
    }

}