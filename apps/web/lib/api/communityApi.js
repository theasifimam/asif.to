import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";

export const communityApi = createApi({
  reducerPath: "communityApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["CommunityPosts", "CommunityPost", "CommunityProfile"],
  endpoints: (builder) => ({
    getCommunityPosts: builder.query({ query: (params = {}) => ({ url: "/community/posts", params }), providesTags: ["CommunityPosts"] }),
    getCommunityPost: builder.query({ query: (slug) => ({ url: `/community/posts/${slug}` }), providesTags: (_r, _e, slug) => [{ type: "CommunityPost", id: slug }] }),
    createCommunityPost: builder.mutation({ query: (data) => ({ url: "/community/posts", method: "POST", data }), invalidatesTags: ["CommunityPosts"] }),
    updateCommunityPost: builder.mutation({ query: ({ slug, ...data }) => ({ url: `/community/posts/${slug}`, method: "PATCH", data }), invalidatesTags: (_r, _e, { slug }) => ["CommunityPosts", { type: "CommunityPost", id: slug }] }),
    deleteCommunityPost: builder.mutation({ query: (slug) => ({ url: `/community/posts/${slug}`, method: "DELETE" }), invalidatesTags: ["CommunityPosts", "CommunityPost"] }),
    createCommunityComment: builder.mutation({ query: ({ postId, ...data }) => ({ url: `/community/posts/${postId}/comments`, method: "POST", data }), invalidatesTags: ["CommunityPost"] }),
    updateCommunityComment: builder.mutation({ query: ({ commentId, ...data }) => ({ url: `/community/comments/${commentId}`, method: "PATCH", data }), invalidatesTags: ["CommunityPost"] }),
    deleteCommunityComment: builder.mutation({ query: (commentId) => ({ url: `/community/comments/${commentId}`, method: "DELETE" }), invalidatesTags: ["CommunityPost"] }),
    acceptCommunityComment: builder.mutation({ query: ({ postId, commentId }) => ({ url: `/community/posts/${postId}/accepted-solution/${commentId}`, method: "PUT" }), invalidatesTags: ["CommunityPost"] }),
    reportCommunityContent: builder.mutation({ query: (data) => ({ url: "/community/reports", method: "POST", data }) }),
    getCommunityProfile: builder.query({ query: (username) => ({ url: `/community/profiles/${username}` }), providesTags: (_r, _e, username) => [{ type: "CommunityProfile", id: username }] }),
    followCommunityUser: builder.mutation({ query: (username) => ({ url: `/community/profiles/${username}/follow`, method: "POST" }), invalidatesTags: (_r, _e, username) => [{ type: "CommunityProfile", id: username }] }),
    unfollowCommunityUser: builder.mutation({ query: (username) => ({ url: `/community/profiles/${username}/follow`, method: "DELETE" }), invalidatesTags: (_r, _e, username) => [{ type: "CommunityProfile", id: username }] }),
  }),
});

export const { useGetCommunityPostsQuery, useGetCommunityPostQuery, useCreateCommunityPostMutation, useUpdateCommunityPostMutation, useDeleteCommunityPostMutation, useCreateCommunityCommentMutation, useUpdateCommunityCommentMutation, useDeleteCommunityCommentMutation, useAcceptCommunityCommentMutation, useReportCommunityContentMutation, useGetCommunityProfileQuery, useFollowCommunityUserMutation, useUnfollowCommunityUserMutation } = communityApi;
