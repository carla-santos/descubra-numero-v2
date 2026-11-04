import { INITIAL_SCORE } from "../game/config.ts";

const STORAGE_KEY = "descubra-numero:highscore";

export type StorageLike = Pick<Storage, "getItem" | "setItem">;

/* Acessar window.localStorage pode lançar erro (modo privativo, cookies bloqueados). */
function getDefaultStorage(): StorageLike | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/* Lê o recorde salvo. Qualquer problema (ausente, corrompido, adulterado) vira 0. */
export function loadHighscore(
  storage: StorageLike | null = getDefaultStorage(),
): number {
  if (!storage) return 0;
  try {
    const raw = storage.getItem(STORAGE_KEY); // string | null — localStorage só guarda texto
    if (raw === null || !/^\d+$/.test(raw)) return 0; // não é inteiro não negativo
    const value = Number(raw);
    return value <= INITIAL_SCORE ? value : 0; // maior que o máximo possível = valor adulterado
  } catch {
    return 0;
  }
}

/* Salva o recorde. Devolve false se não conseguiu (o jogo continua funcionando). */
export function saveHighscore(
  value: number,
  storage: StorageLike | null = getDefaultStorage(),
): boolean {
  if (!storage) return false;
  try {
    storage.setItem(STORAGE_KEY, String(value));
    return true;
  } catch {
    return false; // cota cheia ou bloqueado
  }
}
