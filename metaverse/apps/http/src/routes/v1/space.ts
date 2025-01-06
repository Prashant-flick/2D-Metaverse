import { Router } from "express";
import { createSpaceSchema } from "../../types";
import client from "@repo/db/client"
import { userMiddleware } from "../../middleware/user";

export const spaceRouter = Router();

spaceRouter.get("/all", userMiddleware, async(req, res) => {
    console.log(req.userId);
    
    try {
        const spaceRes = await client.space.findMany({
            where: {
                creatorId: req.userId as string
            }
        })

        res.status(200).json({
            spaces: spaceRes.map(e => ({
                id: e.id,
                name: e.name,
                dimensions: e.dimensions,
                thumbnail: e.thumbnail
            }))
        })
        return;
    } catch (error) {
        res.status(400).json({
            message: "fetching user spaces failed"
        })
        return;
    }
})

spaceRouter.get("/:spaceId", async(req, res) => {

})

spaceRouter.delete("/:spaceId", userMiddleware, async(req, res) => {
    const spaceId = req.params.spaceId as string;    

    try {
        const spaceRes = await client.space.findUnique({
            where: {
                id: spaceId
            }
        })
        
        if (!spaceRes) {
            res.status(400).json({
                message: "space doesn't exist"
            })
            return;
        }

        if (spaceRes?.creatorId !== req.userId ) {
            res.status(403).json({ message: "user is unauthenticated to delete some other space"})
            return
        }

        await client.$transaction(async (transactionClient) => {
            await transactionClient.spaceElements.deleteMany({
                where: {
                    spaceId,
                },
            });
        
            await transactionClient.space.delete({
                where: {
                    id: spaceId,
                },
            });
        });

        res.status(200).json({
            message: "space deletion success"
        })
    } catch (error) {
        res.status(400).json({ message: "space deletion failed"});
    }
})

spaceRouter.post("/element", async(req, res) => {

})

spaceRouter.post("/", userMiddleware, async(req, res) => {
    const parsedData = createSpaceSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(400).json({
            message: "type validation failed"
        })
        return
    }
    
    if ( !parsedData.data.mapId && !parsedData.data.dimensions ) {
        res.status(400).json({ message: "either mapId or dimensions needed"})
        return
    }

    try {
        if ( parsedData.data.mapId ) {
            const mapRes = await client.map.findUnique({
                where: {
                    id: parsedData.data.mapId
                },
                select: {
                    elements: true,
                    thumbnail: true,
                    dimensions: true
                }
            })

            if (mapRes?.thumbnail && mapRes.elements ) {
                const spaceRes = await client.$transaction(async (transactionClient) => {
                    const space = await transactionClient.space.create({
                        data: {
                            name: parsedData.data.name,
                            mapId: parsedData.data.mapId,
                            creatorId: req.userId,
                            thumbnail: mapRes?.thumbnail as string,
                            dimensions: mapRes.dimensions
                        },
                    });
                
                    await transactionClient.spaceElements.createMany({
                        data: mapRes?.elements.map((m) => ({
                            elementId: m.elementId,
                            spaceId: space.id,
                            x: m.x,
                            y: m.y,
                        })),
                    });
                
                    return space;
                });                
                
                res.status(200).json({
                    id: spaceRes.id
                })
            }
        } else {
            const spaceRes = await client.space.create({
                data: {
                    name: parsedData.data.name,
                    dimensions: parsedData.data.dimensions,
                    creatorId: req.userId,
                    thumbnail: "https://image.com/thumbnail.png",
                }
            })

            res.status(200).json({
                id: spaceRes.id
            })
        }
    } catch (error) {
        res.status(400).json({ message: "space creation failed" })
    }
})

spaceRouter.delete("/element/:elementId", async(req, res) => {

})

