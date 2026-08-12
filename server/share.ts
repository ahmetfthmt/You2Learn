import { nanoid } from "nanoid";
import { z } from "zod";
import { createSharedLearningItem, getSharedLearningItemBySlug } from "./db";

const levelSchema = z.enum(["Başlangıç", "Orta", "İleri"]);
const sourceSchema = z.object({
  kind: z.enum(["youtube", "pdf"]),
  title: z.string().trim().min(1).max(500),
});

const learningPayloadSchema = z.object({
  schemaVersion: z.literal(1),
  sourceTitle: z.string().trim().min(1).max(500),
  sourceSummary: z.string().trim().min(1).max(5_000),
  sourceBoundaries: z.string().trim().min(1).max(2_000),
  level: levelSchema,
  estimatedMinutes: z.number().int().min(1).max(600),
  lesson: z.object({
    title: z.string().trim().min(1).max(500),
    subtitle: z.string().max(1_000),
    learningObjectives: z.array(z.string().trim().min(1).max(500)).min(1).max(20),
    modules: z.array(z.object({
      title: z.string().trim().min(1).max(500),
      objective: z.string().trim().min(1).max(1_000),
      explanation: z.string().trim().min(1).max(10_000),
      keyPoints: z.array(z.string().trim().min(1).max(2_000)).min(1).max(20),
      checkpoint: z.object({
        question: z.string().trim().min(1).max(2_000),
        answer: z.string().trim().min(1).max(4_000),
        explanation: z.string().trim().min(1).max(4_000),
      }),
    })).min(1).max(30),
  }),
  exam: z.object({
    title: z.literal("Ustalık Sınavı (Mastery Exam)"),
    introduction: z.string().trim().min(1).max(3_000),
    questions: z.array(z.object({
      id: z.number().int().positive(),
      question: z.string().trim().min(1).max(4_000),
      options: z.array(z.string().trim().min(1).max(2_000)).min(2).max(8),
      correctIndex: z.number().int().nonnegative().max(7),
      explanation: z.string().trim().min(1).max(4_000),
      competency: z.string().trim().min(1).max(500),
    })).min(30).max(80),
  }),
});

const examResultSchema = z.object({
  score: z.number().int().nonnegative().max(80),
  totalQuestions: z.number().int().min(30).max(80),
  percentage: z.number().min(0).max(100),
  completedAt: z.number().int().positive(),
  examTitle: z.literal("Ustalık Sınavı (Mastery Exam)"),
}).superRefine((value, ctx) => {
  if (value.score > value.totalQuestions) {
    ctx.addIssue({ code: "custom", message: "Doğru sayısı soru sayısından büyük olamaz." });
  }
});

export const createShareInputSchema = z.discriminatedUnion("shareType", [
  z.object({
    shareType: z.literal("material"),
    source: sourceSchema,
    payload: learningPayloadSchema,
  }),
  z.object({
    shareType: z.literal("examResult"),
    source: sourceSchema,
    level: levelSchema,
    courseTitle: z.string().trim().min(1).max(500),
    payload: examResultSchema,
  }),
]);

export const publicShareSlugSchema = z.object({ slug: z.string().regex(/^[A-Za-z0-9_-]{12,32}$/) });

export async function createPublicShare(input: z.infer<typeof createShareInputSchema>) {
  const isMaterial = input.shareType === "material";
  return createSharedLearningItem({
    slug: nanoid(20),
    shareType: input.shareType,
    title: isMaterial ? input.payload.lesson.title : input.courseTitle,
    level: isMaterial ? input.payload.level : input.level,
    sourceKind: input.source.kind,
    sourceTitle: input.source.title,
    payload: input.payload,
  });
}

export async function getPublicShare(slug: string) {
  return getSharedLearningItemBySlug(slug);
}
