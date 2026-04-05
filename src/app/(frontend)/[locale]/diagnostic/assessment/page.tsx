import {
  getDiagnosticQuestions,
  getAllSkills,
  getAllCareers,
  getAllCourses,
} from "@/lib/queries";
import AssessmentClient from "./AssessmentClient";

export default async function AssessmentPage() {
  const [questions, allSkills, allCareers, allCourses] = await Promise.all([
    getDiagnosticQuestions(),
    getAllSkills(),
    getAllCareers(),
    getAllCourses(),
  ]);

  return (
    <AssessmentClient
      questions={questions}
      allSkills={allSkills}
      allCareers={allCareers}
      allCourses={allCourses}
    />
  );
}
