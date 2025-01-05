import z from "zod"

export const signupSchema = z.object({
    username: z.string().email(),
    password: z.string().min(8),
    role: z.enum(["user", "admin"]),
})

export const signinSchema = z.object({
    username: z.string().email(),
    password: z.string().min(8),
})

export const updateMetadataSchema = z.object({
    avatar: z.string(),
    userId: z.number()
})

export const createSpaceSchema = z.object({
    name: z.string(),
    dimensions: z.string().regex(/^{0-9}{1,3}x{0-9}{1,3}/),
    mapId: z.number(),
})

export const addElementSchema = z.object({
    spaceId: z.string(),
    elementId: z.string(),
    x: z.number(),
    y: z.number(),
})

export const createElementSchema = z.object({
    imageUrl: z.string(),
    width: z.number(),
    height: z.number(),
    static: z.boolean(),
})

export const updateElementSchema = z.object({
    imageUrl: z.string(),
})

export const createAvatarSchema = z.object({
    imageUrl: z.string(),
    name: z.string(),
})

export const createMapSchema = z.object({
    thumbnail: z.string(),
    name: z.string(),
    dimensions: z.string().regex(/^{0-9}{1,3}x{0-9}{1,3}/),
    defaultElements: z.array(z.object({
        elementId: z.string(),
        x: z.number(),
        y: z.number(),
    }))
})