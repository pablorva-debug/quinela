const PLAYER_NAME_KEY = "quiniela-pollito-player-name";

function getLocalStorage(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

export function loadRememberedPlayerName(): string {
  try {
    return getLocalStorage()?.getItem(PLAYER_NAME_KEY)?.trim() ?? "";
  } catch {
    return "";
  }
}

export function saveRememberedPlayerName(name: string): void {
  const cleanName = name.trim();
  const storage = getLocalStorage();
  if (!storage) {
    return;
  }

  try {
    if (cleanName) {
      storage.setItem(PLAYER_NAME_KEY, cleanName);
    } else {
      storage.removeItem(PLAYER_NAME_KEY);
    }
  } catch {
    // Some browsers can block localStorage. The app should still work normally.
  }
}
