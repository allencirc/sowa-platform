"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Settings, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Checkbox } from "@/components/ui/Checkbox";

const TOPICS = ["CAREERS", "TRAINING", "EVENTS", "RESEARCH", "NEWS", "DIAGNOSTIC"] as const;
const TOPIC_LABELS: Record<string, string> = {
  CAREERS: "Careers",
  TRAINING: "Training",
  EVENTS: "Events",
  RESEARCH: "Research",
  NEWS: "News",
  DIAGNOSTIC: "Skills Diagnostic",
};

interface Preferences {
  email: string;
  topics: string[];
  frequency: string;
  verified: boolean;
}

export default function SubscriptionPreferencesPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [prefs, setPrefs] = useState<Preferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [topics, setTopics] = useState<string[]>([]);
  const [frequency, setFrequency] = useState("WEEKLY");

  useEffect(() => {
    if (!token) {
      setError("No token provided.");
      setLoading(false);
      return;
    }

    fetch(`/api/subscribe/preferences?token=${token}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data: Preferences) => {
        setPrefs(data);
        setTopics(data.topics);
        setFrequency(data.frequency);
      })
      .catch(() => setError("Subscription not found or link is invalid."))
      .finally(() => setLoading(false));
  }, [token]);

  function toggleTopic(topic: string) {
    setTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic],
    );
    setSaved(false);
  }

  async function handleSave() {
    if (!token || topics.length === 0) return;
    setSaving(true);
    setSaved(false);
    setError(null);

    try {
      const res = await fetch("/api/subscribe/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, topics, frequency }),
      });

      if (!res.ok) throw new Error("Failed to update");
      setSaved(true);
    } catch {
      setError("Failed to update preferences. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="py-20 sm:py-28 bg-white">
        <Container>
          <div className="max-w-lg mx-auto text-center">
            <Loader2 className="h-8 w-8 animate-spin text-accent mx-auto" />
          </div>
        </Container>
      </section>
    );
  }

  if (error && !prefs) {
    return (
      <section className="py-20 sm:py-28 bg-white">
        <Container>
          <div className="max-w-lg mx-auto text-center">
            <h1 className="text-3xl font-bold text-text-primary mb-3">Something Went Wrong</h1>
            <p className="text-text-secondary mb-8">{error}</p>
            <Link href="/" className="text-accent font-medium hover:underline">
              Back to homepage &rarr;
            </Link>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="py-16 sm:py-20 bg-white">
      <Container>
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-accent/10 text-accent-dark">
              <Settings className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Manage Preferences</h1>
              <p className="text-sm text-text-secondary">{prefs?.email}</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Topics */}
            <div>
              <p className="text-sm font-medium text-text-primary mb-3">Topics of Interest</p>
              <div className="flex flex-wrap gap-x-6 gap-y-3">
                {TOPICS.map((topic) => (
                  <Checkbox
                    key={topic}
                    id={`pref-${topic.toLowerCase()}`}
                    label={TOPIC_LABELS[topic] ?? topic}
                    checked={topics.includes(topic)}
                    onChange={() => toggleTopic(topic)}
                  />
                ))}
              </div>
              {topics.length === 0 && (
                <p className="mt-1.5 text-sm text-status-error">Select at least one topic.</p>
              )}
            </div>

            {/* Frequency */}
            <div>
              <p className="text-sm font-medium text-text-primary mb-3">Email Frequency</p>
              <div className="flex gap-4">
                {(["WEEKLY", "MONTHLY"] as const).map((freq) => (
                  <label key={freq} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value={freq}
                      checked={frequency === freq}
                      onChange={() => {
                        setFrequency(freq);
                        setSaved(false);
                      }}
                      className="h-4 w-4 text-secondary border-gray-300 focus:ring-accent/20"
                    />
                    <span className="text-sm text-text-primary">
                      {freq === "WEEKLY" ? "Weekly digest" : "Monthly digest"}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Save + Feedback */}
            <div className="flex items-center gap-4">
              <Button onClick={handleSave} disabled={saving || topics.length === 0}>
                {saving ? "Saving..." : "Save Preferences"}
              </Button>
              {saved && (
                <span className="flex items-center gap-1.5 text-sm text-secondary-dark">
                  <CheckCircle className="h-4 w-4" />
                  Preferences updated.
                </span>
              )}
            </div>

            {error && prefs && <p className="text-sm text-status-error">{error}</p>}

            {/* Unsubscribe link */}
            <div className="pt-6 border-t border-gray-100">
              <p className="text-sm text-text-muted">
                Want to stop receiving emails?{" "}
                <a
                  href={`/api/subscribe/unsubscribe?token=${token}`}
                  className="text-status-error hover:underline"
                >
                  Unsubscribe
                </a>
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
