"use client";

import { useState, useEffect } from "react";

export type Quote = {
  text: string;
  author: string;
};

const STORAGE_KEY = "focusbolt_custom_quote";


const DEFAULT_QUOTE: Quote = {
  text: "Believe you can and you're halfway there",
  author: "Theodore Roosevelt",
};

export function useQuote() {
  const [quote, setQuote] = useState<Quote>(DEFAULT_QUOTE);
  const [isCustom, setIsCustom] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      if (typeof parsed.text === "string" && typeof parsed.author === "string") {
        setQuote(parsed);
        setIsCustom(true);
      }
    } catch {
      // ignore corrupted localStorage
    }
  }, []);

  const saveCustom = (newQuote: Quote) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newQuote));
    }
    setQuote(newQuote);
    setIsCustom(true);
  };

  const resetToDefault = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
    setQuote(DEFAULT_QUOTE);
    setIsCustom(false);
  };

  return { quote, isCustom, saveCustom, resetToDefault, DEFAULT_QUOTE };
}
