import { Router, Request, Response } from "express";
import db from "../db/database";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { UpdateUserSchema } from "../schemas";
import { User } from "../models";

const router = Router();

// GET /users/:id
router.get("/:id", authMiddleware, (req: AuthRequest, res: Response): void => {
  const user = db
    .prepare("SELECT user_id, username, email, avatar_url, total_wins, total_losses, created_at FROM users WHERE user_id = ?")
    .get(req.params.id) as User | undefined;

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(user);
});

// PUT /users/:id
router.put("/:id", authMiddleware, (req: AuthRequest, res: Response): void => {
  const targetId = Number(req.params.id);

  if (req.userId !== targetId) {
    res.status(403).json({ error: "You can only update your own profile" });
    return;
  }

  const result = UpdateUserSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten().fieldErrors });
    return;
  }

  const { username, avatar_url } = result.data;

  if (!username && !avatar_url) {
    res.status(400).json({ error: "Nothing to update" });
    return;
  }

  const fields: string[] = [];
  const values: unknown[] = [];

  if (username) { fields.push("username = ?"); values.push(username); }
  if (avatar_url) { fields.push("avatar_url = ?"); values.push(avatar_url); }

  values.push(targetId);

  db.prepare(`UPDATE users SET ${fields.join(", ")} WHERE user_id = ?`).run(...values);

  res.json({ message: "User updated" });
});

// DELETE /users/:id
router.delete("/:id", authMiddleware, (req: AuthRequest, res: Response): void => {
  const targetId = Number(req.params.id);

  if (req.userId !== targetId) {
    res.status(403).json({ error: "You can only delete your own account" });
    return;
  }

  const existing = db.prepare("SELECT user_id FROM users WHERE user_id = ?").get(targetId);
  if (!existing) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  db.prepare("DELETE FROM users WHERE user_id = ?").run(targetId);

  res.json({ message: "User deleted" });
});

export default router;
