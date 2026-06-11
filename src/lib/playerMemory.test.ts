import { describe, expect, it, vi } from "vitest";
import { clearRememberedPlayerName, loadRememberedPlayerName, saveRememberedPlayerName } from "./playerMemory";

function stubLocalStorage(overrides: Partial<Storage> = {}) {
  const store = new Map<string, string>();
  const localStorage = {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    removeItem: vi.fn((key: string) => {
      store.delete(key);
    }),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value);
    }),
    ...overrides
  } as unknown as Storage;

  vi.stubGlobal("localStorage", localStorage);
  return { localStorage, store };
}

describe("playerMemory", () => {
  it("returns the saved player name trimmed", () => {
    const { localStorage } = stubLocalStorage();
    localStorage.setItem("quiniela-pollito-player-name", "  Pablo  ");

    expect(loadRememberedPlayerName()).toBe("Pablo");
  });

  it("removes the saved player name when saving an empty value", () => {
    const { localStorage } = stubLocalStorage();
    localStorage.setItem("quiniela-pollito-player-name", "Pablo");

    saveRememberedPlayerName("   ");

    expect(localStorage.getItem("quiniela-pollito-player-name")).toBeNull();
  });

  it("clears the saved player name", () => {
    const { localStorage } = stubLocalStorage();
    localStorage.setItem("quiniela-pollito-player-name", "Pablo");

    clearRememberedPlayerName();

    expect(localStorage.getItem("quiniela-pollito-player-name")).toBeNull();
  });

  it("ignores localStorage errors", () => {
    stubLocalStorage({
      getItem: vi.fn(() => {
        throw new Error("blocked");
      })
    });

    expect(loadRememberedPlayerName()).toBe("");
  });
});
