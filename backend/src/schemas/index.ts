import { z } from "zod";

export const RegisterSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email:    z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  avatar_url: z.string().url("Invalid URL").optional(),
});

export const LoginSchema = z.object({
  email:    z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const UpdateUserSchema = z.object({
  username:   z.string().min(3).optional(),
  avatar_url: z.string().url("Invalid URL").optional(),
});

export const CreateWordSchema = z.object({
  text:        z.string().min(1, "Word is required").toUpperCase(),
  category_id: z.number().int().positive().optional(),
  difficulty:  z.enum(["easy", "medium", "hard"]).optional(),
  language:    z.string().default("en"),
});

export const UpdateWordSchema = z.object({
  text:        z.string().min(1).toUpperCase().optional(),
  category_id: z.number().int().positive().optional(),
  difficulty:  z.enum(["easy", "medium", "hard"]).optional(),
  language:    z.string().optional(),
});
