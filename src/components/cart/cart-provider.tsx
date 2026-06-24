"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartItem = {
  id: string;
  productId: string;
  storeId: string;
  productName: string;
  price: number;
  quantity: number;
  lineTotal: number;
};

export type CartSummary = {
  storeId?: string;
  storeName?: string;
  items: CartItem[];
  subtotal: number;
};

type MutationResult = { ok: boolean; error?: string };

type CartContextValue = {
  items: CartItem[];
  storeName?: string;
  subtotal: number;
  count: number;
  loading: boolean;
  /** True once the buyer-cart endpoint has been reached at least once. */
  ready: boolean;
  /** Whether the active session can use a buyer cart at all. */
  available: boolean;
  refresh: () => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<MutationResult>;
  updateItem: (itemId: string, quantity: number) => Promise<MutationResult>;
  removeItem: (itemId: string) => Promise<MutationResult>;
};

const CartContext = createContext<CartContextValue | null>(null);

const EMPTY: CartSummary = { items: [], subtotal: 0 };

export function CartProvider({ children }: { children: ReactNode }) {
  const [summary, setSummary] = useState<CartSummary>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [available, setAvailable] = useState(false);

  const applyResponse = useCallback(
    async (response: Response): Promise<MutationResult> => {
      const payload = await response.json().catch(() => null);
      if (response.ok && payload?.ok) {
        setSummary(payload.data as CartSummary);
        setAvailable(true);
        return { ok: true };
      }
      // 403 means the session can't use a buyer cart — treat as empty, not error.
      if (response.status === 403) {
        setSummary(EMPTY);
        setAvailable(false);
      }
      return { ok: false, error: payload?.error ?? "Cart action failed." };
    },
    [],
  );

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/buyer/cart");
      await applyResponse(response);
    } catch {
      setSummary(EMPTY);
      setAvailable(false);
    } finally {
      setReady(true);
      setLoading(false);
    }
  }, [applyResponse]);

  // Initial load. Uses .then/.finally so no setState runs synchronously in the
  // effect body (avoids cascading-render lint and is correct for data fetching).
  useEffect(() => {
    let active = true;
    fetch("/api/buyer/cart")
      .then((response) => (active ? applyResponse(response) : null))
      .catch(() => undefined)
      .finally(() => {
        if (active) {
          setReady(true);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [applyResponse]);

  const addItem = useCallback<CartContextValue["addItem"]>(
    async (productId, quantity = 1) => {
      try {
        const response = await fetch("/api/buyer/cart/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, quantity }),
        });
        return await applyResponse(response);
      } catch {
        return { ok: false, error: "Something went wrong. Please try again." };
      }
    },
    [applyResponse],
  );

  const updateItem = useCallback<CartContextValue["updateItem"]>(
    async (itemId, quantity) => {
      try {
        const response = await fetch(`/api/buyer/cart/items/${itemId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity }),
        });
        return await applyResponse(response);
      } catch {
        return { ok: false, error: "Something went wrong. Please try again." };
      }
    },
    [applyResponse],
  );

  const removeItem = useCallback<CartContextValue["removeItem"]>(
    async (itemId) => {
      try {
        const response = await fetch(`/api/buyer/cart/items/${itemId}`, {
          method: "DELETE",
        });
        return await applyResponse(response);
      } catch {
        return { ok: false, error: "Something went wrong. Please try again." };
      }
    },
    [applyResponse],
  );

  const value = useMemo<CartContextValue>(() => {
    const count = summary.items.reduce((sum, item) => sum + item.quantity, 0);
    return {
      items: summary.items,
      storeName: summary.storeName,
      subtotal: summary.subtotal,
      count,
      loading,
      ready,
      available,
      refresh,
      addItem,
      updateItem,
      removeItem,
    };
  }, [summary, loading, ready, available, refresh, addItem, updateItem, removeItem]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
