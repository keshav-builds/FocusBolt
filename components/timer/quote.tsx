"use client";

import { useEffect, useRef, useState } from "react";

type Quote = {
  text: string;
};

const STORAGE_KEY = "focusbolt_custom_quote";
const DEFAULT_QUOTE: Quote = {
  text: "Believe you can and you're halfway there",
};

const MAX_CHARS = 80;

export function SessionQuote({ currentTheme }: { currentTheme: any }) {
  const [quote, setQuote] = useState<Quote>(DEFAULT_QUOTE);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(DEFAULT_QUOTE.text);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const isImageTheme = currentTheme.backgroundImage;

  // load saved quote (if any)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (typeof parsed.text === "string") {
        setQuote(parsed);
        setDraft(parsed.text);
      }
    } catch {
      // ignore
    }
  }, []);

  // auto-focus when editing
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  function handleStartEdit() {
    setDraft(quote.text);
    setError(null);
    setIsEditing(true);
  }

  function saveDraft() {
    const text = draft.trim();

    if (!text) {
      setError("Quote cannot be empty.");
      return;
    }

    const newQuote: Quote = { text };

    setIsVisible(false);
    setTimeout(() => {
      setQuote(newQuote);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newQuote));
      }
      setIsVisible(true);
      setIsEditing(false);
      setError(null);
    }, 150);
  }

  function handleBlur() {
    if (!isEditing) return;
    saveDraft();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      saveDraft();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setDraft(quote.text);
      setError(null);
    }
  }

  return (
    <div
      className="mt-0 mb-2 w-full max-w-lg mx-auto rounded-lg py-4 px-10  text-center transition-all duration-500 relative max-h-[60px] flex items-center justify-center"
      style={{
        color: currentTheme.digitColor,
        background: isImageTheme
          ? "rgba(255,255,255,0.85)"
          : `${currentTheme.background}`,
        backdropFilter: isImageTheme ? "blur(8px)" : "none",
      }}
    >
      <button
        type="button"
        onClick={handleStartEdit}
        className="absolute top-2 right-2 z-20 text-md flex items-center cursor-pointer"
        aria-label="Edit quote"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="icon icon-tabler-edit"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" />
          <path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z" />
          <path d="M16 5l3 3" />
        </svg>
      </button>

      <div
        className={`transition-opacity duration-300 ease-in-out relative z-10 w-full ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="mx-auto w-full min-w-md flex flex-col items-center gap-1">
          {isEditing ? (
            <>
              <input
                ref={inputRef}
                className="w-full bg-transparent border-b border-gray-400/70 text-lg md:text-xl font-medium italic leading-relaxed px-2 pb-0.5 text-center outline-none focus:border-blue-400"
                value={draft}
                maxLength={MAX_CHARS}
                onChange={(e) => {
                  setDraft(e.target.value);
                  setError(null);
                }}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
              />
              <div className=" text-[11px] text-gray-400">
                {draft.length}/{MAX_CHARS} characters
              </div>
              {error && (
                <div className="mt-0.5 text-[11px] text-red-400">{error}</div>
              )}
            </>
          ) : (
            <p className="text-lg md:text-xl font-medium italic leading-relaxed px-5">
              &ldquo;{quote.text}&rdquo;
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
