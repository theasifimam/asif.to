import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";









export const pagesApi = createApi({
  reducerPath: "pagesApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Pages"],
  endpoints: (builder) => ({
    getPages: builder.query({
      query: () => ({
        url: "/pages",
        method: "GET"
      }),
      providesTags: ["Pages"]
    }),
    getPageBySlug: builder.query({
      query: (slug) => ({
        url: `/pages/${slug}`,
        method: "GET"
      }),
      providesTags: (result, error, slug) => [{ type: "Pages", id: slug }]
    })
  })
});

export const { useGetPagesQuery, useGetPageBySlugQuery } = pagesApi;