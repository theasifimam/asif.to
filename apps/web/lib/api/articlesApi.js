import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";





















export const articlesApi = createApi({
  reducerPath: "articlesApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Articles"],
  endpoints: (builder) => ({
    getArticles: builder.query({
      query: (params) => ({
        url: "/articles",
        method: "GET",
        params
      }),
      providesTags: ["Articles"]
    }),
    getArticleById: builder.query({
      query: (id) => ({
        url: `/articles/${id}`,
        method: "GET"
      }),
      providesTags: (result, error, id) => [{ type: "Articles", id }]
    }),
    getArticleBySlug: builder.query({
      query: (slug) => ({
        url: `/articles/slug/${slug}`,
        method: "GET"
      }),
      providesTags: (result, error, slug) => [{ type: "Articles", id: slug }]
    }),
    trackArticleView: builder.mutation({
      query: ({ id, type }) => ({
        url: `/articles/${id}/view`,
        method: "POST",
        data: { type }
      })
    })
  })
});

export const { useGetArticlesQuery, useGetArticleByIdQuery, useGetArticleBySlugQuery, useTrackArticleViewMutation } = articlesApi;