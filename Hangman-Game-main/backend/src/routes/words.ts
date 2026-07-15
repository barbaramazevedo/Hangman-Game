import { Router, Request, Response } from "express";
import db from "../db/database";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { CreateWordSchema, UpdateWordSchema } from "../schemas";
import { Word } from "../models";

const router = Router();

// GET /words
router.get("/", (_req: Request, res: Response): void => {
  const words = db.prepare("SELECT * FROM words ORDER BY word_id").all();
  res.json(words);
});

// GET /words/random
router.get("/random", (_req: Request, res: Response): void => {
  const word = db.prepare(`
    SELECT w.word_id, w.text, w.difficulty, w.language, c.name AS category
    FROM words w
    LEFT JOIN categories c ON w.category_id = c.category_id
    ORDER BY RANDOM()
    LIMIT 1
  `).get() as { word_id: number; text: string; difficulty: string; language: string; category: string | null } | undefined;

  if (!word) {
    res.status(404).json({ error: "No words available" });
    return;
  }

  res.json(word);
});

// GET /words/:id
router.get("/:id", (req: Request, res: Response): void => {
  const word = db.prepare("SELECT * FROM words WHERE word_id = ?").get(req.params.id) as Word | undefined;

  if (!word) {
    res.status(404).json({ error: "Word not found" });
    return;
  }

  res.json(word);
});

// POST /words
router.post("/", authMiddleware, (req: AuthRequest, res: Response): void => {
  const result = CreateWordSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({ error: result.error.flatten().fieldErrors });
    return;
  }

  const { text, category_id, difficulty, language } = result.data;

  const existing = db.prepare("SELECT word_id FROM words WHERE text = ?").get(text);
  if (existing) {
    res.status(409).json({ error: "Word already exists" });
    return;
  }

  const info = db.prepare(`
    INSERT INTO words (text, category_id, difficulty, language, created_by)
    VALUES (?, ?, ?, ?, ?)
  `).run(text, category_id ?? null, difficulty ?? null, language, req.userId);

  res.status(201).json({ message: "Word created", word_id: info.lastInsertRowid });
});

// PUT /words/:id
router.put("/:id", authMiddleware, (req: AuthRequest, res: Response): void => {
  const wordId = Number(req.params.id);

  const existing = db.prepare("SELECT * FROM words WHERE word_id = ?").get(wordId) as Word | undefined;
  if (!existing) {
    res.status(404).json({ error: "Word not found" });
    return;
  }

  const result = UpdateWordSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten().fieldErrors });
    return;
  }

  const { text, category_id, difficulty, language } = result.data;

  if (!text && !category_id && !difficulty && !language) {
    res.status(400).json({ error: "Nothing to update" });
    return;
  }

  const fields: string[] = [];
  const values: unknown[] = [];

  if (text)        { fields.push("text = ?");        values.push(text); }
  if (category_id) { fields.push("category_id = ?"); values.push(category_id); }
  if (difficulty)  { fields.push("difficulty = ?");  values.push(difficulty); }
  if (language)    { fields.push("language = ?");    values.push(language); }

  values.push(wordId);

  db.prepare(`UPDATE words SET ${fields.join(", ")} WHERE word_id = ?`).run(...values);

  res.json({ message: "Word updated" });
});

// DELETE /words/:id
router.delete("/:id", authMiddleware, (req: AuthRequest, res: Response): void => {
  const wordId = Number(req.params.id);

  const existing = db.prepare("SELECT word_id FROM words WHERE word_id = ?").get(wordId);
  if (!existing) {
    res.status(404).json({ error: "Word not found" });
    return;
  }

  db.prepare("DELETE FROM words WHERE word_id = ?").run(wordId);

  res.json({ message: "Word deleted" });
});

export default router;
