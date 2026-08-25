import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";

export const topicsApi = createApi({
  reducerPath: "topicsApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Topics"],
  endpoints: (builder) => ({
    getTopics: builder.query({
      query: () => ({
        url: "/article-topics",
        method: "GET",
      }),
      providesTags: ["Topics"],
    }),
    getPublicTopics: builder.query({
      query: (params) => ({
        url: "/topics/public",
        method: "GET",
        params,
      }),
      providesTags: ["Topics"],
    }),
  }),
});

export const { useGetTopicsQuery, useGetPublicTopicsQuery } = topicsApi;
