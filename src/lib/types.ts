export interface Career {
  slug: string;
  title: string;
  sector:
    | "Operations & Maintenance"
    | "Marine Operations"
    | "Survey & Design"
    | "Health, Safety & Environment"
    | "Electrical"
    | "Policy & Regulation"
    | "Project Management";
  entryLevel: "Apprentice" | "Entry" | "Mid" | "Senior" | "Leadership";
  description: string;
  salaryRange?: { min: number; max: number };
  keyResponsibilities?: string[];
  qualifications: string[];
  workingConditions?: string;
  growthOutlook?: string;
  skills: string[];
  pathwayConnections: PathwayConnection[];
  relatedCourses: string[];
}

export interface PathwayConnection {
  to: string;
  type: "progression" | "lateral" | "specialisation";
  timeframe: string;
}

export interface Course {
  slug: string;
  title: string;
  provider: string;
  providerType:
    | "University"
    | "ETB"
    | "Private"
    | "Industry"
    | "Skillnet_Network"
    | "Government";
  description: string;
  entryRequirements?: string;
  deliveryFormat: "In-Person" | "Online" | "Blended" | "Self-Paced";
  location?: string;
  nfqLevel?: number | null;
  duration: string;
  cost: number;
  costNotes?: string;
  nextStartDate?: string;
  accredited?: boolean;
  certificationAwarded?: string;
  skills: string[];
  careerRelevance: string[];
  tags: string[];
}

export interface Event {
  slug: string;
  title: string;
  type:
    | "Workshop"
    | "Webinar"
    | "Conference"
    | "Networking"
    | "Training"
    | "Roadshow";
  startDate: string;
  endDate?: string;
  locationType: "Physical" | "Virtual" | "Hybrid";
  location?: string;
  description: string;
  capacity?: number;
  image?: string;
}

export interface Research {
  slug: string;
  title: string;
  author: string;
  organisation: string;
  publicationDate: string;
  summary: string;
  categories: string[];
  isFeatured?: boolean;
  image?: string;
}

export interface Skill {
  slug: string;
  name: string;
  category: "Technical" | "Safety" | "Regulatory" | "Digital" | "Management";
}

export interface DiagnosticQuestion {
  id: string;
  text: string;
  type: "single_choice" | "multiple_choice" | "scale";
  options?: DiagnosticOption[];
  scaleMin?: number;
  scaleMax?: number;
  scaleLabels?: Record<string, string>;
  scoreImpact?: Record<string, number>;
}

export interface DiagnosticOption {
  label: string;
  value: string;
  scoreImpact?: Record<string, number>;
}

export interface DiagnosticResult {
  scores: Record<string, number>;
  maxPossible: Record<string, number>;
  gaps: DiagnosticGap[];
  recommendedCareers: Career[];
  recommendedCourses: Course[];
  roleFamilyFit: RoleFamilyFit[];
}

export interface RoleFamilyFit {
  /** Stable key from diagnostic-role-weights.ts */
  family: string;
  /** Human-readable label */
  label: string;
  /** Short tagline describing the family */
  tagline: string;
  /** 0–100 confidence score */
  confidence: number;
  /** Deterministic English reasoning bullets (no runtime AI) */
  reasoning: string[];
  /** Career slugs that belong to this family (for "Explore roles" CTAs) */
  careerSlugs: string[];
}

export interface DiagnosticGap {
  skill: Skill;
  score: number;
  maxScore: number;
  severity: "high" | "medium" | "low";
}

export interface NewsArticle {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  image?: string;
}

export interface SearchResult {
  type: "career" | "course" | "event" | "research" | "news";
  slug: string;
  title: string;
  excerpt: string;
}

export interface CourseFilters {
  topic?: string;
  format?: Course["deliveryFormat"];
  costMax?: number;
  freeOnly?: boolean;
  provider?: string;
  startingSoon?: boolean;
  nfqLevel?: number;
}
