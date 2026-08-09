import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";

export const courseApi = createApi({
  reducerPath: "courseApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Courses", "Chapters", "Cheatsheets", "Quiz", "Flashcards"],
  endpoints: (builder) => ({

    // ── Courses ─────────────────────────────────────────────────────────────
    getCourses: builder.query({
      query: (params) => ({ url: "/courses", method: "GET", params }),
      providesTags: ["Courses"],
    }),

    getCourseBySlug: builder.query({
      query: (slug) => ({ url: `/courses/${slug}`, method: "GET" }),
      providesTags: (result, error, slug) => [{ type: "Courses", id: slug }],
    }),

    // ── Chapters ─────────────────────────────────────────────────────────────
    getChapterBySlug: builder.query({
      query: ({ courseSlug, chapterSlug }) => ({
        url: `/courses/${courseSlug}/chapters/${chapterSlug}`,
        method: "GET",
      }),
      providesTags: (result, error, { chapterSlug }) => [
        { type: "Chapters", id: chapterSlug },
      ],
    }),

    // ── Cheatsheets ──────────────────────────────────────────────────────────
    getCheatsheets: builder.query({
      query: (params) => ({ url: "/cheatsheets", method: "GET", params }),
      providesTags: ["Cheatsheets"],
    }),

    getCheatsheetBySlug: builder.query({
      query: (slug) => ({ url: `/cheatsheets/${slug}`, method: "GET" }),
      providesTags: (result, error, slug) => [{ type: "Cheatsheets", id: slug }],
    }),

    // ── Quiz ─────────────────────────────────────────────────────────────────
    getQuizQuestions: builder.query({
      query: (params) => ({ url: "/quiz", method: "GET", params }),
      providesTags: ["Quiz"],
    }),

    // ── Flashcards ───────────────────────────────────────────────────────────
    getFlashcards: builder.query({
      query: (params) => ({ url: "/flashcards", method: "GET", params }),
      providesTags: ["Flashcards"],
    }),
  }),
});

export const {
  useGetCoursesQuery,
  useGetCourseBySlugQuery,
  useGetChapterBySlugQuery,
  useGetCheatsheetsQuery,
  useGetCheatsheetBySlugQuery,
  useGetQuizQuestionsQuery,
  useGetFlashcardsQuery,
} = courseApi;
