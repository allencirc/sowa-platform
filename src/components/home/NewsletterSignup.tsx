"use client";

import { useState } from "react";
import { Mail, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Checkbox } from "@/components/ui/Checkbox";
import { trackNewsletterSubscribe } from "@/lib/analytics";

const topics = ["Careers", "Training", "Events", "Research", "Policy"];

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleTopic(topic: string) {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, topics: selectedTopics }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Subscription failed");
      }

      setSubmitted(true);
      trackNewsletterSubscribe({ topics: selectedTopics });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <section className="py-16 sm:py-20 bg-white">
        <Container>
          <div className="max-w-xl mx-auto text-center">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-secondary/10 text-secondary-dark mb-4">
              <CheckCircle className="h-7 w-7" />
            </div>
            <h3 className="text-2xl font-bold text-text-primary mb-2">
              You&apos;re subscribed!
            </h3>
            <p className="text-text-secondary">
              Thank you for subscribing. We&apos;ll keep you updated on the
              latest in offshore wind careers and training.
            </p>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="py-16 sm:py-20 bg-white">
      <Container>
        <div className="max-w-xl mx-auto text-center">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-accent/10 text-accent-dark mb-4">
            <Mail className="h-7 w-7" />
          </div>

          <h2 className="text-3xl font-bold text-text-primary mb-2">
            Stay Updated
          </h2>
          <p className="text-text-secondary mb-8">
            Get the latest offshore wind career news, training opportunities,
            and events delivered to your inbox.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="flex gap-3 mb-6">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                aria-label="Email address"
                className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-3 text-base text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-colors"
              />
              <Button type="submit" disabled={submitting}>
                {submitting ? "Subscribing..." : "Subscribe"}
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-x-6 gap-y-3">
              {topics.map((topic) => (
                <Checkbox
                  key={topic}
                  id={`newsletter-${topic.toLowerCase()}`}
                  label={topic}
                  checked={selectedTopics.includes(topic)}
                  onChange={() => toggleTopic(topic)}
                />
              ))}
            </div>

            {error && (
              <p className="mt-3 text-sm text-status-error">{error}</p>
            )}
          </form>
        </div>
      </Container>
    </section>
  );
}
