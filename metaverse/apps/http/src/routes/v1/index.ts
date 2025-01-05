import { Router } from "express";
import { userRouter } from "./user";
import { adminRouter } from "./admin";
import { spaceRouter } from "./space";
import { signinSchema, signupSchema } from "../../types";
import client from "@repo/db/client";
import jwt from "jsonwebtoken";
// import bcrypt from "bcrypt"

export const router = Router();

router.post("/signup", async(req, res) => {    
    const parsedData = signupSchema.safeParse(req.body);
    
    if(!parsedData.success){
        res.status(400).json({message: "Validation failed"})
        return
    }
    
    try {
        console.log("here1", parsedData);
        const user = await client.user.create({
            data: {
                username: parsedData.data.username,
                password: parsedData.data.password,
                role: parsedData.data.role === "admin" ? "Admin" : "User",
            }
        })        
        
        res.status(200).json({
            userId: user.id
        }) 
    } catch (error) {
        console.log(error);
        
        res.status(400).json({ message: "user already exists"});
    }
})

router.post("/signin", async(req,res) => {
    console.log("signin", req.body);
    
    const parsedData = signinSchema.safeParse(req.body);
    if(!parsedData.success){
        res.status(403).json({message: "Validation failed"})
        return
    }
    console.log("signin", parsedData);

    try {
        const user = await client.user.findUnique({
            where: {
                username: parsedData.data.username
            }
        })

        console.log("signin user", user);

        if (!user) {
            res.status(403).json({ message: "user Doesn't exist"});
            return
        }

        const verifyPassword = parsedData.data.password === user.password ? true : false;
        if(!verifyPassword){
            res.status(403).json({ message: "Invalid Password"});
            return
        }

        const token = jwt.sign({
            userId: user.id,
            role: user.role
        }, process.env.JWT_PASSWORD || "HELLO")

        res.status(200).json({
            token
        })
    } catch (error) {
        res.status(400).json({
            message: "signin error"
        })
    }
})

router.get("/elements", async(req, res) => {

})

router.get("/avatars", async(req, res) => {

})

router.use("/user", userRouter);
router.use("/admin", adminRouter);
router.use("/space", spaceRouter);
