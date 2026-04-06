import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Skills Assessment",
  description:
    "Take the SOWA skills diagnostic assessment. Answer questions about your experience and skills to receive personalised offshore wind career recommendations.",
  robots: { index: false, follow: false },
};

export default function AssessmentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
