export type LearningLevel = "Başlangıç" | "Orta" | "İleri";
export type ProviderId = "gemini" | "openai" | "openrouter" | "anthropic";

export interface ProviderSettings {
  provider: ProviderId;
  model: string;
  apiKey: string;
}

export interface SourceMaterial {
  kind: "youtube" | "pdf";
  title: string;
  text: string;
  url?: string;
  pageCount?: number;
  wasTruncated?: boolean;
}

export interface LessonModule {
  title: string;
  objective: string;
  explanation: string;
  keyPoints: string[];
  checkpoint: {
    question: string;
    answer: string;
    explanation: string;
  };
}

export interface MasteryQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  competency: string;
}

export interface LearningPayload {
  schemaVersion: 1;
  sourceTitle: string;
  sourceSummary: string;
  sourceBoundaries: string;
  level: LearningLevel;
  estimatedMinutes: number;
  lesson: {
    title: string;
    subtitle: string;
    learningObjectives: string[];
    modules: LessonModule[];
  };
  exam: {
    title: "Ustalık Sınavı (Mastery Exam)";
    introduction: string;
    questions: MasteryQuestion[];
  };
}

export interface HistoryRecord {
  id: string;
  createdAt: number;
  source: Omit<SourceMaterial, "text">;
  payload: LearningPayload;
}
