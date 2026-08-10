import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";

export const contactApi = createApi({
  reducerPath: "contactApi",
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    submitContactMessage: builder.mutation({
      query: (data) => ({
        url: "/contact",
        method: "POST",
        data,
      }),
    }),
  }),
});

export const { useSubmitContactMessageMutation } = contactApi;
