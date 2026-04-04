import type {
  Career,
  Course,
  CourseFilters,
  DiagnosticQuestion,
  Event,
  NewsArticle,
  Research,
  SearchResult,
  Skill,
} from "./types";

import careersData from "./data/careers.json";
import coursesData from "./data/courses.json";
import eventsData from "./data/events.json";
import researchData from "./data/research.json";
import skillsData from "./data/skills.json";
import diagnosticData from "./data/diagnosticQuestions.json";
import newsData from "./data/news.json";

// ─── Careers ───────────────────────────────────────────────

export function getAllCareers(): Career[] {
  return careersData as Career[];
}

export function getCareerBySlug(slug: string): Career | undefined {
  return getAllCareers().find((c) => c.slug === slug);
}

export function getCareersBySector(sector: Career["sector"]): Career[] {
  return getAllCareers().filter((c) => c.sector === sector);
}

// ─── Courses ───────────────────────────────────────────────

export function getAllCourses(): Course[] {
  return coursesData as Course[];
}

export function getCourseBySlug(slug: string): Course | undefined {
  return getAllCourses().find((c) => c.slug === slug);
}

export function getCoursesByCareer(careerSlug: string): Course[] {
  return getAllCourses().filter((c) => c.careerRelevance.includes(careerSlug));
}

export function getFilteredCourses(filters: CourseFilters): Course[] {
  let courses = getAllCourses();

  if (filters.topic) {
    const topic = filters.topic.toLowerCase();
    courses = courses.filter(
      (c) =>
        c.tags.some((t) => t.toLowerCase().includes(topic)) ||
        c.skills.some((s) => s.toLowerCase().includes(topic))
    );
  }

  if (filters.format) {
    courses = courses.filter((c) => c.deliveryFormat === filters.format);
  }

  if (filters.freeOnly) {
    courses = courses.filter((c) => c.cost === 0);
  } else if (filters.costMax !== undefined) {
    courses = courses.filter((c) => c.cost <= filters.costMax!);
  }

  if (filters.provider) {
    const provider = filters.provider.toLowerCase();
    courses = courses.filter((c) =>
      c.provider.toLowerCase().includes(provider)
    );
  }

  if (filters.startingSoon) {
    const now = new Date();
    const threeMonths = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    courses = courses.filter((c) => {
      if (!c.nextStartDate) return false;
      const start = new Date(c.nextStartDate);
      return start >= now && start <= threeMonths;
    });
  }

  if (filters.nfqLevel !== undefined) {
    courses = courses.filter((c) => c.nfqLevel === filters.nfqLevel);
  }

  return courses;
}

// ─── Events ────────────────────────────────────────────────

export function getAllEvents(): Event[] {
  return eventsData as Event[];
}

export function getEventBySlug(slug: string): Event | undefined {
  return getAllEvents().find((e) => e.slug === slug);
}

export function getUpcomingEvents(): Event[] {
  const now = new Date().toISOString();
  return getAllEvents()
    .filter((e) => e.startDate >= now)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
}

// ─── Research ──────────────────────────────────────────────

export function getAllResearch(): Research[] {
  return researchData as Research[];
}

export function getResearchBySlug(slug: string): Research | undefined {
  return getAllResearch().find((r) => r.slug === slug);
}

export function getFeaturedResearch(): Research | undefined {
  return getAllResearch().find((r) => r.isFeatured);
}

// ─── Skills ────────────────────────────────────────────────

export function getAllSkills(): Skill[] {
  return skillsData as Skill[];
}

export function getSkillBySlug(slug: string): Skill | undefined {
  return getAllSkills().find((s) => s.slug === slug);
}

export function getSkillsByCareer(careerSlug: string): Skill[] {
  const career = getCareerBySlug(careerSlug);
  if (!career) return [];
  const allSkills = getAllSkills();
  return career.skills
    .map((slug) => allSkills.find((s) => s.slug === slug))
    .filter((s): s is Skill => s !== undefined);
}

// ─── Diagnostic ────────────────────────────────────────────

export function getDiagnosticQuestions(): DiagnosticQuestion[] {
  return diagnosticData.questions as DiagnosticQuestion[];
}

// ─── News ──────────────────────────────────────────────────

export function getAllNews(): NewsArticle[] {
  return (newsData as NewsArticle[]).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getNewsBySlug(slug: string): NewsArticle | undefined {
  return getAllNews().find((n) => n.slug === slug);
}

// ─── Global Search ─────────────────────────────────────────

export function globalSearch(query: string): SearchResult[] {
  if (!query.trim()) return [];

  const q = query.toLowerCase();
  const results: SearchResult[] = [];

  for (const career of getAllCareers()) {
    if (
      career.title.toLowerCase().includes(q) ||
      career.description.toLowerCase().includes(q) ||
      career.sector.toLowerCase().includes(q)
    ) {
      results.push({
        type: "career",
        slug: career.slug,
        title: career.title,
        excerpt: career.description.slice(0, 150) + "...",
      });
    }
  }

  for (const course of getAllCourses()) {
    if (
      course.title.toLowerCase().includes(q) ||
      course.description.toLowerCase().includes(q) ||
      course.provider.toLowerCase().includes(q)
    ) {
      results.push({
        type: "course",
        slug: course.slug,
        title: course.title,
        excerpt: course.description.slice(0, 150) + "...",
      });
    }
  }

  for (const event of getAllEvents()) {
    if (
      event.title.toLowerCase().includes(q) ||
      event.description.toLowerCase().includes(q)
    ) {
      results.push({
        type: "event",
        slug: event.slug,
        title: event.title,
        excerpt: event.description.slice(0, 150) + "...",
      });
    }
  }

  for (const research of getAllResearch()) {
    if (
      research.title.toLowerCase().includes(q) ||
      research.summary.toLowerCase().includes(q) ||
      research.organisation.toLowerCase().includes(q)
    ) {
      results.push({
        type: "research",
        slug: research.slug,
        title: research.title,
        excerpt: research.summary.slice(0, 150) + "...",
      });
    }
  }

  for (const article of getAllNews()) {
    if (
      article.title.toLowerCase().includes(q) ||
      article.excerpt.toLowerCase().includes(q) ||
      article.content.toLowerCase().includes(q)
    ) {
      results.push({
        type: "news",
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt.slice(0, 150) + "...",
      });
    }
  }

  return results;
}
