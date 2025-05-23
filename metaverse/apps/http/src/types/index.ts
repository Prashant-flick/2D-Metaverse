import z from "zod"

export const signupSchema = z.object({
    email: z.string().email(),
    username: z.string(),
    password: z.string().min(8),
    role: z.enum(["user", "admin"]),
    avatarId: z.string().optional(),
})

export const signinSchema = z.object({
    email: z.string().email(),
    username: z.string().optional(),
    password: z.string().min(8),
})

export const updateMetadataSchema = z.object({
    avatarId: z.string(),
    userId: z.string()
})

export const createSpaceSchema = z.object({
    name: z.string(),
    dimensions: z.string().regex(/^\d{1,4}x\d{1,4}$/).optional(),
    mapId: z.string().optional(),
    thumbnail: z.string().optional(),
})

export const createMeetingSchema = z.object({
    name: z.string(),
    date: z.string(),
    time: z.string(),
    spaceId: z.string(),
    createdAt: z.string(),
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
    name: z.string(),
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
    dimensions: z.string().regex(/^\d{1,3}x\d{1,3}$/),
    defaultElements: z.array(z.object({
        elementId: z.string(),
        x: z.number(),
        y: z.number(),
    }))
})

declare global {
    namespace Express {
        export interface Request {
            role?: "Admin" | "User";
            userId: string;
        }
    }
}