import { Router } from "express";
import { userMiddleware } from "../../middleware/user";
import { updateMetadataSchema } from "../../types";
import client from "@repo/db/client"

export const userRouter = Router();
userRouter.use(userMiddleware);

userRouter.post("/metadata", async(req, res) => {
    const parsedData = updateMetadataSchema.safeParse(req.body);
    if(!parsedData.success){
        res.status(400).json({ message: "type validation failed" });
        return
    }

    try {
        await client.user.update({
            where: {
                id: parsedData.data.userId
            },
            data: {
                avatarId: parsedData.data.avatarId
            }
        })
        
        res.status(200).json({
            message: "Metadata updated"
        })
    } catch (error) {
        res.status(400).json({ message: "updation failed"});
    }
})

userRouter.get("/metadata/bulk", async(req, res) => {
    const userIdsRes = (req.query.ids) as string;
    const userIds: string[] = userIdsRes.substring(1,userIdsRes.length-1).split(",");    
  
    try {
        const metadata = await client.user.findMany({
            where: {
                id: {
                    in: userIds
                }
            },
            select: {
                avatar: true,
                id: true
            }
        });

        res.status(200).json({
            avatars: metadata.map(m => ({
                userId: m.id,
                imageUrl: m.avatar?.imageUrl
            }))
        })
    } catch (error) {
        res.status(403).json({ message: "getting bulk metadata failed"});
    }
})