export interface User {
  user_id: number;
  username: string;
  email: string;
  password_hash: string;
  avatar_url: string | null;
  total_wins: number;
  total_losses: number;
  created_at: string;
}

export interface Category {
  category_id: number;
  name: string;
  description: string | null;
}

export interface Word {
  word_id: number;
  text: string;
  category_id: number | null;
  difficulty: string | null;
  language: string;
  created_by: number | null;
  created_at: string;
}

export interface Game {
  game_id: number;
  room_code: string;
  status: "waiting" | "playing" | "finished";
  max_players: number;
  word_id: number | null;
  host_user_id: number | null;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
}

export interface GamePlayer {
  game_id: number;
  user_id: number;
  score: number;
  is_winner: boolean;
  joined_at: string;
  left_at: string | null;
}

export interface GuessAttempt {
  attempt_id: number;
  game_id: number;
  user_id: number;
  letter: string;
  is_correct: boolean;
  attempted_at: string;
}
