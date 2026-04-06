import type { Metadata } from "next";
import { getDiagnosticQuestions, getAllSkills, getAllCareers, getAllCourses } from "@/lib/queries";
import ResultsClient from "./ResultsClient";

export const metadata: Metadata = {
  title: "Your Skills Profile",
  description: "View and share your personalised SOWA offshore wind skills profile.",
  robots: { index: false, follow: false },
};

export default async function ResultsPage() {
  const [questions, allSkills, allCareers, allCourses] = await Promise.all([
    getDiagnosticQuestions(),
    getAllSkills(),
    getAllCareers(),
    getAllCourses(),
  ]);

  return (
    <ResultsClient
      questions={questions}
      allSkills={allSkills}
      allCareers={allCareers}
      allCourses={allCourses}
    />
  );
}
