import { Router } from "express";
import { createAvatarSchema, createElementSchema, createMapSchema, updateElementSchema } from "../../types";
import client from "@repo/db/client"
import { adminMiddleware } from "../../middleware/admin";

export const adminRouter =  Router();
adminRouter.use(adminMiddleware);

adminRouter.post("/element", async(req, res) => {
    const parsedData = createElementSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(400).json({ message: "type validation failed" })
        return
    }

    try {
        const elementRes = await client.element.create({
            data: {
                name: parsedData.data.name,
                height: parsedData.data.height,
                width: parsedData.data.width,
                isStatic: parsedData.data.static,
                ImageUrl: parsedData.data.imageUrl
            },
            select: {
                id: true
            }
        })

        res.status(200).json({
            id: elementRes.id
        })
    } catch (error) {
        res.status(400).json({ message: "element creation failed"});
    }
})

adminRouter.put("/element/:elementId", async(req, res) => {
    const parsedData = updateElementSchema.safeParse(req.body);
    const elementId = req.params.elementId as string;

    if (!parsedData.success) {
        res.status(400).json({
            message: "type validation failed"
        })
        return;
    }

    try {
        await client.element.update({
            where: {
                id: elementId
            },
            data: {
                ImageUrl: parsedData.data.imageUrl
            }
        })

        res.status(200).json({
            message: "element updation succeeds"
        })
    } catch (error) {
        res.status(400).json({
            message: "element updation failed"
        })
    }
})

adminRouter.post("/avatar", async(req, res) => {
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
    const parsedData = createMapSchema.safeParse(req.body);
    
    if (!parsedData.success) {
        res.status(400).json({ message: "type validation failed" })
        return
    }

    try {
        const mapRes = await client.$transaction( async(mapClient) => {
            const map = await mapClient.map.create({
                data: {
                    name: parsedData.data.name,
                    thumbnail: parsedData.data.thumbnail,
                    dimensions: parsedData.data.dimensions,
                }
            })            

            await mapClient.mapElements.createMany({
                data: parsedData.data.defaultElements.map(m => ({
                    elementId: m.elementId,
                    mapId: map.id,
                    x: m.x,
                    y: m.y
                }))
            })

            return map;
        })

        res.status(200).json({
            id: mapRes.id
        })
    } catch (error) {
        res.status(400).json({ message: "map creation failed" })
    }
})