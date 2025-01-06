import {Request, Response, NextFunction} from "express"
import jwt, {JwtPayload} from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

export interface CustomRequest extends Request {
    user?: JwtPayload
}

export const validateUser = (req: CustomRequest, res: Response, next: NextFunction) => {

    const token: string | undefined = req.headers['authorization']?.split(" ")[1]

    if (!token) {
        console.log("Token not found from header")
        res.status(401).json({message: "Access denied, missing token"})
        return 
    }

    try {
        console.log(token)
        const verified: JwtPayload = jwt.verify(token, process.env.SECRET as string) as JwtPayload
        req.user = verified
        console.log(verified)
        next()

    } catch (error: any) {
        console.log("Failed to load payload")
        console.log(error)
        res.status(401).json({message: "Access denied, missing token"})
        return 
    }
}

export const validateAdmin = (req: CustomRequest, res: Response, next: NextFunction) => {
    validateUser(req, res, () => {
        if (!req.user?.isAdmin) {
            res.status(403).json({ message: 'Access denied' });
            return 
        }
        next(); 
    });
}