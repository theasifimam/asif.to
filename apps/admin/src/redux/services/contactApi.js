import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export const contactApi = createApi({
  reducerPath: "contactApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    credentials: "include",
    prepareHeaders: (headers) => {
      if (typeof window !== "undefined") {
        const token =
          localStorage.getItem("asif_admin_token") ||
          localStorage.getItem("token") ||
          localStorage.getItem("asif_token");
        if (token) {
          headers.set("authorization", `Bearer ${token}`);
        }
      }
      return headers;
    },
  }),
  tagTypes: ["ContactMessage"],
  endpoints: (builder) => ({
    getContactMessages: builder.query({
      query: (params) => ({
        url: "/contact",
        params,
      }),
      providesTags: ["ContactMessage"],
    }),
    updateMessageStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/contact/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["ContactMessage"],
    }),
  }),
});

export const { useGetContactMessagesQuery, useUpdateMessageStatusMutation } = contactApi;
