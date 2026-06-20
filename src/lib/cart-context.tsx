"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getProductBySlug } from "@/data/products";

export interface CartLine {
  slug: string;
  quantity: number;
  ribbonColor?: string;
  customNote?: string;
}

export interface CartLineWithProduct extends CartLine {
  name: string;
  price: number;
  image: string | null;
  swatch: string;
}

interface CartContextValue {
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  addItem: (line: CartLine) => void;
  removeItem: (slug: string, ribbonColor?: string) => void;
  updateQuantity: (slug: string, ribbonColor: string | undefined, quantity: number) => void;
  clearCart: () => void;
  linesWithProduct: CartLineWithProduct[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = "spinner-pinata-cart";

function sameLine(a: CartLine, slug: string, ribbonColor?: string) {
  return a.slug === slug && a.ribbonColor === ribbonColor;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from localStorage on mount
        setLines(JSON.parse(raw));
      } catch {
        // ignore corrupt cart data
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    }
  }, [lines, hydrated]);

  const addItem = useCallback((line: CartLine) => {
    setLines((prev) => {
      const existing = prev.find((l) => sameLine(l, line.slug, line.ribbonColor));
      if (existing) {
        return prev.map((l) =>
          sameLine(l, line.slug, line.ribbonColor)
            ? { ...l, quantity: l.quantity + line.quantity }
            : l
        );
      }
      return [...prev, line];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((slug: string, ribbonColor?: string) => {
    setLines((prev) => prev.filter((l) => !sameLine(l, slug, ribbonColor)));
  }, []);

  const updateQuantity = useCallback(
    (slug: string, ribbonColor: string | undefined, quantity: number) => {
      setLines((prev) =>
        quantity <= 0
          ? prev.filter((l) => !sameLine(l, slug, ribbonColor))
          : prev.map((l) =>
              sameLine(l, slug, ribbonColor) ? { ...l, quantity } : l
            )
      );
    },
    []
  );

  const clearCart = useCallback(() => setLines([]), []);

  const linesWithProduct = useMemo<CartLineWithProduct[]>(
    () =>
      lines
        .map((line) => {
          const product = getProductBySlug(line.slug);
          if (!product) return null;
          return {
            ...line,
            name: product.name,
            price: product.price,
            image: product.image,
            swatch: product.swatch,
          };
        })
        .filter((l): l is CartLineWithProduct => l !== null),
    [lines]
  );

  const itemCount = useMemo(
    () => lines.reduce((sum, l) => sum + l.quantity, 0),
    [lines]
  );

  const subtotal = useMemo(
    () => linesWithProduct.reduce((sum, l) => sum + l.price * l.quantity, 0),
    [linesWithProduct]
  );

  return (
    <CartContext.Provider
      value={{
        lines,
        itemCount,
        subtotal,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        linesWithProduct,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
