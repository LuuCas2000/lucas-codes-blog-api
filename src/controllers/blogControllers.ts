import { RequestHandler } from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { marked } from 'marked';
import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';

// IMPORTS
import pool from '../database/database.js';

const window = new JSDOM('').window;
const purify = DOMPurify(window);

interface IUserRow {
    id: number,
    user_name: string,
    user_email: string,
    user_password: string,
    user_role: string
};

interface IArticleRow {
    id: number,
    title: string,
    description: string,
    content: string,
    author: string,
    createdAt: Date,
    user_id: string
};

interface DBRows extends IUserRow, IArticleRow, RowDataPacket {};

interface ArticleRequestBody {
    title: string,
    description: string,
    content: string,
    author: string
};

/*interface UserRequestBody {
    user_name: string,
    user_email: string,
    user_password: string,
    user_role: string
};

interface UserLoginRequestBody {
    user_name: string,
    user_password: string
};*/

interface UserRequestBody {
    user_name: string,
    user_email: string,
    user_password: string,
    user_role: string,
    content: string
}

interface ArticleParamRequest {
    articleId: string,
}

export const getAllArticles: RequestHandler = (req, res) => {
    pool.query<DBRows[]>('SELECT * FROM articles', (err, articles) => {
        res.status(200).json({ articles });
    });
};

export const createArticle: RequestHandler<any, any, ArticleRequestBody, any> = (req, res) => {
    const { title, description, content, author } = req.body;
    const userId = req.userInfos.userId;
    //const html = marked.parse(content) as string; // I decided to cast it to string
    const html = marked.parse(content, { async: false }); //I can use this solution too 
    const sanitizedMarkdown = purify.sanitize(html);

    pool.query<DBRows[]>('INSERT INTO articles(title, description, content, author, user_id) VALUES(?, ?, ?, ?, ?)', [title, description, sanitizedMarkdown, author, userId], (err, article) => {
        if (err) return console.log(err);
        res.status(201).json({ msg: 'article created' });
    });
};

export const editArticle: RequestHandler<ArticleParamRequest, any, UserRequestBody, any> = (req, res) => {
    const { content } = req.body;
    const { articleId } = req.params;

    const editHTML = marked.parse(content, { async: false });
    const sanitizedMarkdown = purify.sanitize(editHTML);
    const currDate = new Date();
    pool.query<ResultSetHeader>('UPDATE articles SET content=?, updatedAt=? WHERE id=?', [sanitizedMarkdown, currDate, articleId], (err, result) => {
        if (err) return console.log(err);
        res.status(200).json({ msg: 'article updated' });
    });
};

export const getAllUsers: RequestHandler = (req, res) => {
    pool.query<DBRows[]>('SELECT * FROM users', (err, users) => {
        res.status(200).json({ users });
    });
};

export const createUser: RequestHandler<any, any, UserRequestBody, any> = (req, res) => {
    const { user_name, user_email, user_password, user_role } = req.body;
    const hashedPass = bcrypt.hashSync(user_password, 10);

    pool.query('INSERT INTO users(user_name, user_email, user_password, user_role) VALUES(?, ?, ?, ?)', [user_name, user_email, hashedPass, user_role]);
    res.status(201).json({ msg: 'user created' });
};

export const loginUser: RequestHandler<any, any, UserRequestBody, any> = (req, res) => {
    const { user_name, user_password } = req.body;
    pool.query<DBRows[]>('SELECT * FROM users WHERE user_name=?', [user_name], (err, foundUser) => {
        if (err) return console.log(err);
        const isAuth = bcrypt.compareSync(user_password, foundUser[0].user_password);

        if (!isAuth) return res.status(401).json({ msg: 'incorrect username or password' });

        const accessToken = jwt.sign({ userId: foundUser[0].id, userName: foundUser[0].user_name, userRole: foundUser[0].user_role }, '38722277', { expiresIn: '1h' });

        res.cookie('accessToken', accessToken, {
           httpOnly: true,
           secure: true,
           sameSite: 'strict',
           maxAge: 60 * 60 * 1000 // 1h
        });

        res.redirect('/articles');
    });
}