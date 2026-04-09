"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Send, Loader2, RotateCcw } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

const PLACEHOLDERS = [
  "What are the next upcoming courses?",
  "How can I transition from oil and gas to wind?",
  "What skills do I need for offshore wind?",
  "Show me entry-level careers in marine operations",
  "What certifications are available?",
  "How do I get started in offshore wind energy?",
];

/**
 * Lightweight markdown renderer — handles links, bold, and paragraphs.
 * No external dependency needed for this subset.
 */
function renderMarkdown(text: string): React.ReactNode[] {
  const paragraphs = text.split(/\n\n+/);

  return paragraphs.map((para, pIdx) => {
    const lines = para.split(/\n/);
    const rendered = lines.map((line, lIdx) => {
      const parts: React.ReactNode[] = [];
      // Match markdown links [text](url) and **bold**
      const regex = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;
      let lastIndex = 0;
      let match;

      while ((match = regex.exec(line)) !== null) {
        // Add text before this match
        if (match.index > lastIndex) {
          parts.push(line.slice(lastIndex, match.index));
        }

        if (match[1] && match[2]) {
          // Link: [text](url)
          const href = match[2];
          const isInternal = href.startsWith("/");
          if (isInternal) {
            parts.push(
              <Link
                key={`${pIdx}-${lIdx}-${match.index}`}
                href={href}
                className="text-accent-dark underline underline-offset-2 hover:text-accent font-medium"
              >
                {match[1]}
              </Link>,
            );
          } else {
            parts.push(
              <a
                key={`${pIdx}-${lIdx}-${match.index}`}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-dark underline underline-offset-2 hover:text-accent font-medium"
              >
                {match[1]}
              </a>,
            );
          }
        } else if (match[3]) {
          // Bold: **text**
          parts.push(
            <strong key={`${pIdx}-${lIdx}-${match.index}`} className="font-semibold">
              {match[3]}
            </strong>,
          );
        }

        lastIndex = match.index + match[0].length;
      }

      // Add remaining text
      if (lastIndex < line.length) {
        parts.push(line.slice(lastIndex));
      }

      return (
        <React.Fragment key={`${pIdx}-${lIdx}`}>
          {parts}
          {lIdx < lines.length - 1 && <br />}
        </React.Fragment>
      );
    });

    return (
      <p key={pIdx} className="mb-3 last:mb-0">
        {rendered}
      </p>
    );
  });
}

const AIChatInput = () => {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasResponse = !!(answer || error);
  const isExpanded = hasResponse || loading;

  // Cycle placeholder text when input is inactive
  useEffect(() => {
    if (isActive || inputValue || answer) return;

    const interval = setInterval(() => {
      setShowPlaceholder(false);
      setTimeout(() => {
        setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
        setShowPlaceholder(true);
      }, 400);
    }, 3000);

    return () => clearInterval(interval);
  }, [isActive, inputValue, answer]);

  // Close input when clicking outside (only if no answer displayed)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        if (!inputValue && !answer) setIsActive(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [inputValue, answer]);

  const handleActivate = () => setIsActive(true);

  const handleSend = async () => {
    const question = inputValue.trim();
    if (!question || loading) return;

    setLoading(true);
    setError("");
    setAnswer("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Something went wrong. Please try again.");
      }

      const data = await res.json();
      setAnswer(data.answer);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    setInputValue("");
    setAnswer("");
    setError("");
    setIsActive(false);
    inputRef.current?.blur();
  };

  const placeholderContainerVariants = {
    initial: {},
    animate: { transition: { staggerChildren: 0.025 } },
    exit: { transition: { staggerChildren: 0.015, staggerDirection: -1 as const } },
  };

  const letterVariants = {
    initial: {
      opacity: 0,
      filter: "blur(12px)",
      y: 10,
    },
    animate: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        opacity: { duration: 0.25 },
        filter: { duration: 0.4 },
        y: { type: "spring" as const, stiffness: 80, damping: 20 },
      },
    },
    exit: {
      opacity: 0,
      filter: "blur(12px)",
      y: -10,
      transition: {
        opacity: { duration: 0.2 },
        filter: { duration: 0.3 },
        y: { type: "spring" as const, stiffness: 80, damping: 20 },
      },
    },
  };

  return (
    <motion.div
      ref={wrapperRef}
      className="w-full max-w-2xl bg-white/95 backdrop-blur-md border border-white/30 shadow-lg overflow-hidden"
      animate={{
        borderRadius: isExpanded ? 20 : 9999,
        boxShadow:
          isActive || inputValue ? "0 8px 32px 0 rgba(0,0,0,0.16)" : "0 2px 8px 0 rgba(0,0,0,0.08)",
      }}
      transition={{ type: "spring", stiffness: 120, damping: 18 }}
      onClick={handleActivate}
    >
      {/* Input Row */}
      <div className="flex items-center gap-2 px-5 py-3">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            className="flex-1 border-0 outline-0 rounded-md py-2 text-base bg-transparent w-full font-normal text-text-primary disabled:opacity-60"
            style={{ position: "relative", zIndex: 1 }}
            onFocus={handleActivate}
          />
          <div className="absolute left-0 top-0 w-full h-full pointer-events-none flex items-center py-2">
            <AnimatePresence mode="wait">
              {showPlaceholder && !isActive && !inputValue && !answer && (
                <motion.span
                  key={placeholderIndex}
                  className="absolute left-0 top-1/2 -translate-y-1/2 text-text-muted select-none pointer-events-none text-base"
                  style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    zIndex: 0,
                  }}
                  variants={placeholderContainerVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  {PLACEHOLDERS[placeholderIndex].split("").map((char, i) => (
                    <motion.span
                      key={i}
                      variants={letterVariants}
                      style={{ display: "inline-block" }}
                    >
                      {char === " " ? "\u00A0" : char}
                    </motion.span>
                  ))}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {hasResponse ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleReset();
            }}
            className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-text-secondary p-3 rounded-full font-medium justify-center transition-colors cursor-pointer"
            title="Ask another question"
            type="button"
          >
            <RotateCcw size={18} />
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSend();
            }}
            disabled={loading || !inputValue.trim()}
            className="flex items-center gap-1 bg-secondary hover:bg-secondary-light text-primary p-3 rounded-full font-medium justify-center transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title="Send"
            type="button"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        )}
      </div>

      {/* Response Area */}
      <AnimatePresence>
        {(answer || error || loading) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 pt-1 border-t border-gray-100">
              {loading && (
                <div className="flex items-center gap-2 py-3 text-text-secondary text-sm">
                  <Loader2 size={16} className="animate-spin" />
                  <span>Thinking...</span>
                </div>
              )}
              {error && <p className="py-3 text-sm text-status-error">{error}</p>}
              {answer && (
                <div className="py-3 text-sm text-text-primary leading-relaxed">
                  {renderMarkdown(answer)}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export { AIChatInput };
