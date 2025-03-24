import { Router } from "express";
import { userRouter } from "./user";
import { adminRouter } from "./admin";
import { spaceRouter } from "./space";
import { signinSchema, signupSchema } from "../../types";
import client from "@repo/db/client";
import jwt, {JwtPayload} from "jsonwebtoken";
import bcrypt from "bcryptjs"
import { userMiddleware } from "../../middleware/user";

export const router = Router();

router.post('/refresh', async(req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  
  if (!refreshToken) {
    res.status(401).json({
      message: "refresh Token Expired"
    })
    return;
  }

  interface DecodedUser extends JwtPayload {
    userId: string;
    role: 'Admin' | 'User';
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || "HELLO") as DecodedUser;
    const accessToken = generateAccessToken({ id: decoded.userId, role: decoded.role });
    res.status(200).json({ accessToken, userId: decoded.userId });
  } catch (err) {
    res.status(403).json({
      message: "jwt verification failed"
    });
  }
})

router.post("/signup", async(req, res) => {
    const parsedData = signupSchema.safeParse(req.body);
    
    if(!parsedData.success){
        res.status(400).json({message: "Validation failed"})
        return
    }
    
    try {
        const checkemailAndUsername = await client.user.findFirst({
            where: {
                OR: [
                    { email: parsedData.data.email },
                    { username: parsedData.data.username }
                ]
            }
        })

        if (checkemailAndUsername) {
            res.status(403).json({
                message: "user already exists"
            })
            return
        }

        const hashedPassword = bcrypt.hashSync(parsedData.data.password, parseInt(process.env.BCRYPT_SECRET || "HEHE"));
        
        const user = await client.user.create({
            data: {
                email: parsedData.data.email,
                username: parsedData.data.username,
                password: hashedPassword,
                role: parsedData.data.role === "admin" ? "Admin" : "User",
            }
        })

        res.status(200).json({
            userId: user.id
        }) 
    } catch (error) {        
        res.status(404).json({ message: "axios error"});
    }
})

router.post("/signin", async(req,res) => {
    const parsedData = signinSchema.safeParse(req.body);
    if(!parsedData.success){
        res.status(403).json({message: "Validation failed"})
        return
    }

    try {
        const user = await client.user.findUnique({
            where: {
                email: parsedData.data.email
            }
        })

        if (!user) {
            res.status(403).json({ message: "user Doesn't exist"});
            return
        }

        const verifyPassword = bcrypt.compareSync(parsedData.data.password, user.password)
        
        if(!verifyPassword){
            res.status(403).json({ message: "Invalid Password"});
            return
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV==='production',
          sameSite: 'strict',
          path: '/',
        });

        res.status(200).json({
            accessToken,
            userId: user.id
        })
    } catch (error) {
        res.status(400).json({
            message: "signin error"
        })
    }
})

router.post("/signout", async(req, res) => {
  res.clearCookie('refreshToken', {
    path: '/',
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV==='production',
  });

  res.status(200).json({
    message: "signout succeeded"
  })
})

router.get("/elements", userMiddleware, async(req, res) => {
    try {
        const elemRes = await client.element.findMany();

        res.status(200).json({
            elements: elemRes.map(e => ({
                id: e.id,
                imageUrl: e.ImageUrl,
                width: e.width,
                height: e.height,
            }))
        })
    } catch (error) {
        res.status(400).json({
            message: "getting elements failed"
        })
    }
})

router.get("/avatars", userMiddleware, async(req, res) => {
    try {
        const avatarsRes = await client.avatar.findMany();

        res.status(200).json({
            avatars: avatarsRes.map(m => ({
                id: m.id,
                imageUrl: m.imageUrl,
                name: m.name
            }))
        })
    } catch (error) {
        res.status(400).json({ message: "getting all avatars failed"})   
    }
})

const generateAccessToken = (user: { id: string, role: 'Admin' | 'User' }) => {
    const token = jwt.sign({
      userId: user.id,
      role: user.role
    }, process.env.ACCESS_TOKEN_SECRET || "HELLO",
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    })
    return token;
}

const generateRefreshToken = (user: { id: string, role: 'Admin' | 'User' }) => {
  const token = jwt.sign({
    userId: user.id,
    role: user.role
  }, process.env.REFRESH_TOKEN_SECRET || "HELLO",
  {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  })
  return token;
}

router.use("/user", userRouter);
router.use("/admin", adminRouter);
router.use("/space", spaceRouter);
