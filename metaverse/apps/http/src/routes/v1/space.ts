import { Router } from "express";
import { addElementSchema, createSpaceSchema } from "../../types";
import client from "@repo/db/client"
import { userMiddleware } from "../../middleware/user";

export const spaceRouter = Router();
spaceRouter.use(userMiddleware)

spaceRouter.get("/all", async(req, res) => {    
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

spaceRouter.post("/element", async(req, res) => {
    const parsedData = addElementSchema.safeParse(req.body);

    if (!parsedData.success) {
        res.status(400).json({ message: "type validation failed"});
        return;
    }

    try {
        const spaceRes = await client.space.findUnique({
            where: {
                id: parsedData.data.spaceId
            }
        })

        const spaceX = Number(spaceRes?.dimensions?.split("x")[0]);
        const spaceY = Number(spaceRes?.dimensions?.split("x")[1]);
        if ( spaceX<parsedData.data.x || spaceY<parsedData.data.y || 1>parsedData.data.x || 1>parsedData.data.y) {
            res.status(400).json({ message: "boundry limit exceeded"});
            return;
        }

        const spaceElemRes = await client.spaceElements.create({
            data: {
                elementId: parsedData.data.elementId,
                spaceId: parsedData.data.spaceId,
                x: parsedData.data.x,
                y: parsedData.data.y,
            }
        })

        res.status(200).json({
            id: spaceElemRes.id
        })
    } catch (error) {
        res.status(400).json({ message: "spaceElement creation failed"});
    }
})

spaceRouter.post("/", async(req, res) => {
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
                    thumbnail: parsedData.data.thumbnail || '',
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

spaceRouter.get("/:spaceId", async(req, res) => {
    const spaceId = req.params.spaceId as string;
    
    try {        
        const space = await client.space.findFirst({
            where: {
                id: spaceId
            },
            select: {
                id: true,
                name: true,
                dimensions: true,
                spaceElements: true
            }
        })

        if( !space ) {
            res.status(400).json({
                message: "invalid space id"
            })
            return
        }

        res.status(200).json({
            id: space?.id,
            name: space?.name,
            dimensions: space?.dimensions,
            elements: space?.spaceElements.map(e => ({
                id: e.id,
                elementId: e.elementId,
                x: e.x,
                y: e.y
            }))
        })
    } catch (error) {
        res.status(400).json({ message: "failed to get space"});
    }
})

spaceRouter.delete("/:spaceId", async(req, res) => {
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

spaceRouter.delete("/element/:elementId", async(req, res) => {
    const spaceElemId = req.params.elementId;

    try {
        await client.spaceElements.delete({
            where: {
                id: spaceElemId
            }
        })

        res.status(200).json({
            message: "deletion success"
        })
    } catch (error) {
        res.status(400).json({ message: "deletion of space element failed"});
    }
})

