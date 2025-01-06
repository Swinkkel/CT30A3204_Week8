import {Request, Response, Router} from "express"
import bcrypt from "bcrypt"
import { compile } from "morgan"
import jwt, {JwtPayload} from "jsonwebtoken"
import {body, validationResult} from 'express-validator'
import {User} from "../models/User"
import {Topic} from "../models/Topic"
import { validateUser, validateAdmin, CustomRequest } from '../middleware/validateToken';

const router: Router = Router()

router.post("/api/user/register", 
    body('email').isEmail().withMessage('Invalid email').normalizeEmail(),
    body('username').trim().isLength({min: 3, max:25}).withMessage('Username must be between 3 and 25 characters').escape(),
    body('password').isStrongPassword({minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1}).withMessage('Password must be at least 8 characters long, contain uppercase and lowercase letters, a number, and a special character'),
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({errors: errors.array()});
            return
        }

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

router.post("/api/user/login", 
    body('email').isEmail().withMessage('Invalid email').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
    async (req: Request, res: Response) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({errors: errors.array()});
            return
        }

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

router.get("/api/topics", async (req: Request, res: Response) => {
    try {
        const topics = await Topic.find();
        res.json(topics);
      } catch (err) {
        res.status(500).json({ message: 'Server error' });
      }
});

router.post("/api/topic", validateUser, async (req: CustomRequest, res: Response) => {
    const { title, content } = req.body;
    const { username } = req.user?.username;
  
    try {
      const newTopic = await Topic.create({ title, content, username });
      res.json(newTopic);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
});

router.delete("/api/topic/:id", validateAdmin, async (req: Request, res: Response) => {
    try {
        await Topic.findByIdAndDelete(req.params.id);
        res.json({ message: 'Topic deleted successfully' });
      } catch (err) {
        res.status(500).json({ message: 'Server error' });
      }
});

export default router