import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

function isUserAuth(role: string): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => {
        const token = req.cookies['accessToken'];

        if (!token) {
            res.status(403).json({ msg: 'token is required' });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

        if (typeof decoded === "object") {
            if (role === decoded.userRole) {
            req.userInfos = decoded;
            next();
        } else {
            res.status(404).json({ msg: 'user not authorized' });
        }
        }
    }
};

export default isUserAuth;