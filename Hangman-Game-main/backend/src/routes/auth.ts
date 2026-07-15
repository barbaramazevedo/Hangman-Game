import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../db/database";
import { RegisterSchema, LoginSchema } from "../schemas";
import { User } from "../models";

const router = Router();

// POST /auth/register
router.post("/register", (req: Request, res: Response): void => {
  const result = RegisterSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({ error: result.error.flatten().fieldErrors });
    return;
  }

  const { username, email, password, avatar_url } = result.data;

  const existing = db.prepare("SELECT user_id FROM users WHERE email = ?").get(email);
  if (existing) {
    res.status(409).json({ error: "Email already in use" });
    return;
  }

  const password_hash = bcrypt.hashSync(password, 10);

  const stmt = db.prepare(`
    INSERT INTO users (username, email, password_hash, avatar_url)
    VALUES (?, ?, ?, ?)
  `);

  const info = stmt.run(username, email, password_hash, avatar_url ?? null);

  res.status(201).json({ message: "User created", user_id: info.lastInsertRowid });
});

// POST /auth/login
router.post("/login", (req: Request, res: Response): void => {
  const result = LoginSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({ error: result.error.flatten().fieldErrors });
    return;
  }

  const { email, password } = result.data;

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as User | undefined;

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const secret = process.env.JWT_SECRET as string;
  const token = jwt.sign({ userId: user.user_id }, secret, { expiresIn: "7d" });

  res.json({
    token,
    user: {
      user_id:  user.user_id,
      username: user.username,
      email:    user.email,
    },
  });
});

export default router;
