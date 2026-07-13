import express from "express";
import authRoutes from "./routes/auth";

const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "Hangman API is running!" });
});

app.use("/auth", authRoutes);

export default app;
