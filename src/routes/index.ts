import {Request, Response, Router} from "express"
import bcrypt from "bcrypt"
import { compile } from "morgan"
import {User} from "../models/User"
import jwt, {JwtPayload} from "jsonwebtoken"

const router: Router = Router()

router.post("/api/user/register", async (req: Request, res: Response) => {
    const {email, password, username, isAdmin} = req.body;

    try {
        // Check if the email is already taken
        const existingUser = await User.findOne({email});
        if (existingUser) {
            res.status(403).json({ message: 'Email already in use.' });
            return 
        }

        const salt: string = bcrypt.genSaltSync(10);
        const hash: string = bcrypt.hashSync(password, salt);

        const newUser = new User({ email, password: hash, username, isAdmin });
        await newUser.save();

        res.status(200).json(newUser);
        return
    } catch (error) {
        res.status(500).json({message: 'Internal server error.'});
        return
    }
})

router.post("/api/user/login", async (req: Request, res: Response) => {
    const {email, password} = req.body;

    const loginUser = await User.findOne({email});
    if (!loginUser) {
        res.status(404).json({ message: 'Login failed.' });
        return 
    }

    if (!bcrypt.compareSync(password, loginUser.password)) {
        res.status(401).json({ message: 'Login failed.' });
        return
    }

    const jwtPayload: JwtPayload = {
        user: loginUser._id,
        username: loginUser.username,
        isAdmin: loginUser.isAdmin
    }
    const token: string = jwt.sign(jwtPayload, process.env.SECRET as string, { expiresIn: "2m"})

    res.status(200).json({success: true, token})  
    return
})

export default router