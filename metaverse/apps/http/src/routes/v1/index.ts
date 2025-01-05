import { Router } from "express";
import { userRouter } from "./user";
import { adminRouter } from "./admin";
import { spaceRouter } from "./space";

export const router = Router();

router.post("/signup", async(req, res) => {
    res.json({
        message: "signup"
    })
})

router.post("/signin", async(req,res) => {
    res.json({
        message: "signin"
    })
})

router.get("/elements", async(req, res) => {

})

router.get("/avatars", async(req, res) => {

})

router.use("/user", userRouter);
router.use("/admin", adminRouter);
router.use("/space", spaceRouter);
