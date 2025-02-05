import express from 'express';

// IMPORTS 
import { getAllArticles, createArticle, editArticle, getAllUsers, createUser, loginUser } from '../controllers/blogControllers.js';
import isUserAuth from '../middlewares/isUserAuth.js';
import validateData from '../middlewares/validationMiddleware.js';
import { userSignInSchema, userSignUpSchema, articleSchema } from '../utils/validSchemas.js';

export const userRouter = express.Router();
export const articleRouter = express.Router();

// ARTICLES ROUTE
articleRouter.route('/')
.get(getAllArticles);

articleRouter.route('/new')
.post(isUserAuth('admin'), validateData(articleSchema), createArticle);

articleRouter.route('/edit/:articleId')
.patch(isUserAuth('admin'), editArticle);

// USER ROUTER
userRouter.route('/')
.get(isUserAuth('admin'), getAllUsers);

userRouter.route('/signup')
.post(validateData(userSignUpSchema), createUser);

userRouter.route('/signin')
.post(validateData(userSignInSchema), loginUser);