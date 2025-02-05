interface UserInfo {
    userId: number,
    userName: string,
    userRole: string
};

declare namespace Express {
    interface Request {
        userInfos: UserInfo | pkg.JwtPayload
    }
};