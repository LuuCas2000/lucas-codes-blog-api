import dotenv from 'dotenv';

dotenv.config();

import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';

// IMPORTS
import { userRouter, articleRouter } from './routes/blogRoutes.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(helmet());
app.use(cors());

const port = process.env.PORT;

app.use('/user', userRouter);
app.use('/articles', articleRouter);

app.listen(port, () => console.log(`Server is running on port ${port}`)); 