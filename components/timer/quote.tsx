"use client";

import { useEffect, useState } from "react";
import { getRandomQuote } from "@/lib/quotes";

export function SessionQuote({ currentTheme }: { currentTheme: any }) {
  const [quote, setQuote] = useState(getRandomQuote());
  const [isVisible, setIsVisible] = useState(true);
  const isImageTheme = currentTheme.backgroundImage;

  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out
      setIsVisible(false);

      // Change quote after fade out completes
      setTimeout(() => {
        setQuote(getRandomQuote());
        // Fade in
        setIsVisible(true);
      }, 500);
    }, 16000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="mt-0 w-full max-w-lg mx-auto rounded-lg py-3 px-4 sm:py-3.5 sm:px-5 text-center transition-all duration-500 relative min-h-[90px] sm:min-h-[100px] flex items-center justify-center"
      style={{
        color: currentTheme.digitColor,
        background: isImageTheme
          ? "rgba(255,255,255,0.85)"
          : `${currentTheme.background}`,
        backdropFilter: isImageTheme ? "blur(8px)" : "none",
      }}
    >
      {/* Decorative Quote SVG - Left aligned */}
      <svg
        aria-hidden="true"
        viewBox="0 0 105 78"
        className="absolute left-1  top-3 w-10 h-10 sm:w-12 sm:h-9 opacity-15 sm:opacity-20"
        style={{
          fill: currentTheme.digitColor,
        }}
      >
        <path d="M25.086 77.292c-4.821 0-9.115-1.205-12.882-3.616-3.767-2.561-6.78-6.102-9.04-10.622C1.054 58.534 0 53.411 0 47.686c0-5.273.904-10.396 2.712-15.368 1.959-4.972 4.746-9.567 8.362-13.786a59.042 59.042 0 0 1 12.43-11.3C28.325 3.917 33.599 1.507 39.324 0l11.074 13.786c-6.479 2.561-11.677 5.951-15.594 10.17-3.767 4.219-5.65 7.835-5.65 10.848 0 1.356.377 2.863 1.13 4.52.904 1.507 2.637 3.089 5.198 4.746 3.767 2.41 6.328 4.972 7.684 7.684 1.507 2.561 2.26 5.5 2.26 8.814 0 5.123-1.959 9.19-5.876 12.204-3.767 3.013-8.588 4.52-14.464 4.52Zm54.24 0c-4.821 0-9.115-1.205-12.882-3.616-3.767-2.561-6.78-6.102-9.04-10.622-2.11-4.52-3.164-9.643-3.164-15.368 0-5.273.904-10.396 2.712-15.368 1.959-4.972 4.746-9.567 8.362-13.786a59.042 59.042 0 0 1 12.43-11.3C82.565 3.917 87.839 1.507 93.564 0l11.074 13.786c-6.479 2.561-11.677 5.951-15.594 10.17-3.767 4.219-5.65 7.835-5.65 10.848 0 1.356.377 2.863 1.13 4.52.904 1.507 2.637 3.089 5.198 4.746 3.767 2.41 6.328 4.972 7.684 7.684 1.507 2.561 2.26 5.5 2.26 8.814 0 5.123-1.959 9.19-5.876 12.204-3.767 3.013-8.588 4.52-14.464 4.52Z"></path>
      </svg>

      {/* Fade transition */}
      <div
        className={`transition-opacity duration-500 ease-in-out relative z-10 w-full ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <p className=" text-lg md:text-xl font-medium italic leading-relaxed px-5 ">
          &ldquo;{quote.text}&rdquo;
        </p>
        <p className=" text-lg mt-1.5 sm:mt-2  sm:text-base opacity-75 font-normal">
          — {quote.author}
        </p>
      </div>
    </div>
  );
}
