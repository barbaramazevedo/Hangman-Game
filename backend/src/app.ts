import express from "express";
import authRoutes from "./routes/auth";
import usersRoutes from "./routes/users";
import wordsRoutes from "./routes/words";

const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "Hangman API is running!" });
});

app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/words", wordsRoutes);

export default app;
