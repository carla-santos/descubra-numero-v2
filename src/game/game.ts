import { INITIAL_SCORE, MAX_NUMBER, MIN_NUMBER } from "./config.ts";

export type GameStatus = "playing" | "won" | "lost";

export type GuessResult =
  | { readonly kind: "invalid" } // vazio, decimal, texto, fora de 1..20
  | { readonly kind: "ignored" } // a partida já acabou
  | { readonly kind: "too-high" } // palpite maior que o segredo
  | { readonly kind: "too-low" } // palpite menor que o segredo
  | { readonly kind: "correct" }; // acertou

// Estado completo da partida.
export interface GameState {
  readonly secret: number;
  readonly score: number;
  readonly highscore: number;
  readonly status: GameStatus;
}

// O novo estado + o resultado do palpite.
export interface GuessOutcome {
  readonly state: GameState;
  readonly result: GuessResult;
}

// Função que devolve um número em [0, 1), igual ao Math.random.
export type RandomFn = () => number;

// Sorteia um inteiro entre MIN_NUMBER e MAX_NUMBER
export function pickSecretNumber(random: RandomFn = Math.random): number {
  return Math.floor(random() * (MAX_NUMBER - MIN_NUMBER + 1)) + MIN_NUMBER;
}

// Cria uma partida nova. O recorde vem de fora */
export function createGame(
  highscore = 0,
  random: RandomFn = Math.random,
): GameState {
  return {
    secret: pickSecretNumber(random),
    score: INITIAL_SCORE,
    highscore,
    status: "playing",
  };
}

// Jogar novamente: novo segredo e pontos zerados, mas o recorde é mantido.
export function restartGame(
  state: GameState,
  random: RandomFn = Math.random,
): GameState {
  return createGame(state.highscore, random);
}

// Converte o texto do input em número válido, ou null se for inválido.
export function parseGuess(raw: string): number | null {
  const text = raw.trim();
  if (!/^\d+$/.test(text)) return null; // só dígitos: barra '', '1.5', '-3', '1e1', 'abc'
  const value = Number(text);
  if (value < MIN_NUMBER || value > MAX_NUMBER) return null;
  return value;
}

// Aplica um palpite e devolve o novo estado (o estado antigo não é modificado).
export function makeGuess(state: GameState, rawGuess: string): GuessOutcome {
  if (state.status !== "playing") {
    return { state, result: { kind: "ignored" } };
  }

  const guess = parseGuess(rawGuess);
  if (guess === null) {
    return { state, result: { kind: "invalid" } }; // palpite inválido não custa ponto
  }

  if (guess === state.secret) {
    const highscore = Math.max(state.highscore, state.score);
    return {
      state: { ...state, status: "won", highscore },
      result: { kind: "correct" },
    };
  }

  const score = state.score - 1;
  const status: GameStatus = score <= 0 ? "lost" : "playing";
  const kind = guess > state.secret ? "too-high" : "too-low";

  return { state: { ...state, score, status }, result: { kind } };
}
