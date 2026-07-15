import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import usersRoutes from "./routes/users";
import wordsRoutes from "./routes/words";
import gamesRoutes from "./routes/games";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "Hangman API is running!" });
});

app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/words", wordsRoutes);
app.use("/games", gamesRoutes);

export default app;
