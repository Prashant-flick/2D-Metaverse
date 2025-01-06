import { Router } from "express";
import { createAvatarSchema } from "../../types";
import client from "@repo/db/client"
import { adminMiddleware } from "../../middleware/admin";

export const adminRouter =  Router();

adminRouter.post("/element", async(req, res) => {

})

adminRouter.put("/element/:elementId", async(req, res) => {

})

adminRouter.post("/avatar", adminMiddleware, async(req, res) => {
    const parsedData = createAvatarSchema.safeParse(req.body);
    if(!parsedData.success){
        res.status(400).json({ message: "type validation failed" });
        return
    }

    try {
        const avatarRes = await client.avatar.create({
            data: {
                name: parsedData.data.name,
                imageUrl: parsedData.data.imageUrl
            },
            select: {
                id: true
            }
        })

        res.status(200).json({
            id: avatarRes.id
        })
    } catch (error) {
        res.status(400).json({ message: "avatar creation failed"})
    }
})

adminRouter.post("/map", async(req, res) => {

})