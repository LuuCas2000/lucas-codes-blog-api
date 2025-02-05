import { z } from 'zod';

export const userSignInSchema = z.object({
    user_name: z.string(),
    user_password: z.string().max(255)
});

export const userSignUpSchema = z.object({
    user_name: z.string(),
    user_email: z.string().email(),
    user_password: z.string().max(255)
});

export const articleSchema = z.object({
    title: z.string(),
    description: z.string(),
    content: z.string(),
    author: z.string()
});