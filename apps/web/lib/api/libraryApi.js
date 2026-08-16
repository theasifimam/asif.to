import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";

export const libraryApi = createApi({
  reducerPath: "libraryApi", baseQuery: axiosBaseQuery(), tagTypes: ["Library"],
  endpoints: (builder) => ({
    getMyLibrary: builder.query({ query: (params) => ({ url: "/library/me", method: "GET", params }), providesTags: ["Library"] }),
    createEntry: builder.mutation({ query: (data) => ({ url: "/library/entries", method: "POST", data }), invalidatesTags: ["Library"] }),
    updateEntry: builder.mutation({ query: ({ id, ...data }) => ({ url: `/library/entries/${id}`, method: "PATCH", data }), invalidatesTags: ["Library"] }),
    createBookmark: builder.mutation({ query: (data) => ({ url: "/library/bookmarks", method: "POST", data }), invalidatesTags: ["Library"] }),
    createCollection: builder.mutation({ query: (data) => ({ url: "/library/collections", method: "POST", data }), invalidatesTags: ["Library"] }),
  }),
});
export const { useGetMyLibraryQuery, useCreateEntryMutation, useUpdateEntryMutation, useCreateBookmarkMutation, useCreateCollectionMutation } = libraryApi;
