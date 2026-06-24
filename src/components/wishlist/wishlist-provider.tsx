"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type WishlistItem = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category?: string;
  storeName?: string;
};

type WishlistContextValue = {
  items: WishlistItem[];
  count: number;
  /** False during SSR/first paint, true once the client store is read. */
  hydrated: boolean;
  has: (id: string) => boolean;
  toggle: (item: WishlistItem) => void;
  add: (item: WishlistItem) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

const STORAGE_KEY = "seapedia:wishlist";
const EMPTY_ITEMS: WishlistItem[] = [];

// --- localStorage-backed external store (no effects → no cascading renders) ---
let snapshotCache: WishlistItem[] = EMPTY_ITEMS;
let lastRaw: string | null = null;
const listeners = new Set<() => void>();

function getSnapshot(): WishlistItem[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    raw = null;
  }
  if (raw !== lastRaw) {
    lastRaw = raw;
    try {
      const parsed = raw ? JSON.parse(raw) : [];
      snapshotCache = Array.isArray(parsed) ? parsed : EMPTY_ITEMS;
    } catch {
      snapshotCache = EMPTY_ITEMS;
    }
  }
  return snapshotCache;
}

function getServerSnapshot(): WishlistItem[] {
  return EMPTY_ITEMS;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  function onStorage(event: StorageEvent) {
    if (event.key === STORAGE_KEY) listener();
  }
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function persist(next: WishlistItem[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore quota / private-mode errors
  }
  lastRaw = JSON.stringify(next);
  snapshotCache = next;
  listeners.forEach((listener) => listener());
}

// Hydration flag as a tiny external store: false on the server, true on client.
const noopSubscribe = () => () => {};

export function WishlistProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  const has = useCallback(
    (id: string) => items.some((item) => item.id === id),
    [items],
  );

  const add = useCallback((item: WishlistItem) => {
    const current = getSnapshot();
    if (!current.some((existing) => existing.id === item.id)) {
      persist([item, ...current]);
    }
  }, []);

  const remove = useCallback((id: string) => {
    persist(getSnapshot().filter((item) => item.id !== id));
  }, []);

  const toggle = useCallback((item: WishlistItem) => {
    const current = getSnapshot();
    persist(
      current.some((existing) => existing.id === item.id)
        ? current.filter((existing) => existing.id !== item.id)
        : [item, ...current],
    );
  }, []);

  const clear = useCallback(() => persist(EMPTY_ITEMS), []);

  const value = useMemo<WishlistContextValue>(
    () => ({
      items,
      count: items.length,
      hydrated,
      has,
      toggle,
      add,
      remove,
      clear,
    }),
    [items, hydrated, has, toggle, add, remove, clear],
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
