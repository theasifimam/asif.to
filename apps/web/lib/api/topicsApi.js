import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";









export const topicsApi = createApi({
  reducerPath: "topicsApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Topics"],
  endpoints: (builder) => ({
    getTopics: builder.query({
      query: () => ({
        url: "/topics",
        method: "GET"
      }),
      providesTags: ["Topics"]
    })
  })
});

export const { useGetTopicsQuery } = topicsApi;