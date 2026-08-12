import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { generateWithProvider, verifyProviderConnection } from "./generation";
import { createPublicShare, createShareInputSchema, getPublicShare, publicShareSlugSchema } from "./share";
import { getYouTubeSource } from "./source";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  source: router({
    youtubeTranscript: publicProcedure
      .input(z.object({ url: z.string().url().max(2_048) }))
      .mutation(({ input }) => getYouTubeSource(input.url)),
  }),

  generation: router({
    verify: publicProcedure
      .input(z.object({ provider: z.enum(["gemini", "openai", "openrouter", "anthropic"]), model: z.string().trim().min(1).max(160), apiKey: z.string().trim().min(1).max(512) }))
      .mutation(async ({ input }) => verifyProviderConnection(input)),
    create: publicProcedure
      .input(z.object({
        provider: z.enum(["gemini", "openai", "openrouter", "anthropic"]),
        model: z.string().trim().min(1).max(160),
        apiKey: z.string().trim().min(1).max(512),
        level: z.enum(["Başlangıç", "Orta", "İleri"]),
        source: z.object({
          kind: z.enum(["youtube", "pdf"]),
          title: z.string().min(1).max(500),
          text: z.string().min(80).max(125_000),
          url: z.string().url().optional(),
          pageCount: z.number().int().positive().optional(),
          wasTruncated: z.boolean().optional(),
        }),
      }))
      .mutation(async ({ input }) => ({ content: await generateWithProvider(input) })),
  }),

  share: router({
    create: publicProcedure
      .input(createShareInputSchema)
      .mutation(({ input }) => createPublicShare(input)),
    getPublic: publicProcedure
      .input(publicShareSlugSchema)
      .query(({ input }) => getPublicShare(input.slug)),
  }),

});

export type AppRouter = typeof appRouter;
