import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Auth", "Bookmarks", "Saves"],
  endpoints: (builder) => ({
    // Sign in with email + password
    signin: builder.mutation({
      query: (credentials) => ({
        url: "/auth/signin",
        method: "POST",
        data: credentials,
      }),
    }),

    // Sign up (full registration)
    signup: builder.mutation({
      query: (body) => ({
        url: "/auth/signup",
        method: "POST",
        data: body,
      }),
    }),

    // Send OTP to email
    sendOtp: builder.mutation({
      query: (body) => ({
        url: "/auth/otp/send",
        method: "POST",
        data: body,
      }),
    }),

    // Verify OTP
    verifyOtp: builder.mutation({
      query: (body) => ({
        url: "/auth/otp/verify",
        method: "POST",
        data: body,
      }),
    }),

    // Reset password with OTP
    resetPassword: builder.mutation({
      query: (body) => ({
        url: "/auth/reset-password",
        method: "POST",
        data: body,
      }),
    }),

    // Get current user
    getMe: builder.query({
      query: () => ({
        url: "/auth/me",
        method: "GET",
      }),
      providesTags: ["Auth"],
    }),

    // Check username availability
    checkUsername: builder.query({
      query: (username) => ({
        url: `/auth/check-username?username=${username}`,
        method: "GET",
      }),
    }),

    // Sign out
    signout: builder.mutation({
      query: () => ({
        url: "/auth/signout",
        method: "POST",
      }),
      invalidatesTags: ["Auth"],
    }),

    // Update own password
    updatePassword: builder.mutation({
      query: (body) => ({
        url: "/auth/update-password",
        method: "PATCH",
        data: body,
      }),
    }),

    // ─── USER PROFILE ENDPOINTS ───
    getProfile: builder.query({
      query: () => ({
        url: "/users/me/profile",
        method: "GET",
      }),
      providesTags: ["Auth"],
    }),

    updateAttemptVisibility: builder.mutation({
      query: ({ attemptId, visibility }) => ({
        url: `/users/me/quiz-attempts/${attemptId}/visibility`,
        method: "PATCH",
        data: { visibility },
      }),
      invalidatesTags: ["Auth"],
    }),

    getCertificate: builder.query({
      query: (verificationId) => ({
        url: `/users/certificates/${verificationId}`,
        method: "GET",
      }),
    }),

    getPublicProfile: builder.query({
      query: (username) => ({
        url: `/users/public/${username}`,
        method: "GET",
      }),
    }),

    updateProfile: builder.mutation({
      query: (body) => ({
        url: "/users/me/update",
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: ["Auth"],
    }),
    deactivateAccount: builder.mutation({
      query: (confirmation) => ({
        url: "/users/me/deactivate",
        method: "POST",
        data: { confirmation },
      }),
    }),
    deleteAccount: builder.mutation({
      query: (confirmation) => ({
        url: "/users/me/account",
        method: "DELETE",
        data: { confirmation },
      }),
    }),

    // Bookmark Endpoints
    toggleBookmark: builder.mutation({
      query: (articleId) => ({
        url: `/users/me/bookmarks/toggle/${articleId}`,
        method: "POST",
      }),
      invalidatesTags: ["Bookmarks"],
    }),

    getBookmarks: builder.query({
      query: () => ({
        url: "/users/me/bookmarks",
        method: "GET",
      }),
      providesTags: ["Bookmarks"],
    }),

    // ─── Unified Save System ───────────────────────────────────────────
    // Toggle save for course/chapter/cheatsheet/quiz_question
    toggleSavedItem: builder.mutation({
      query: (body) => ({
        url: "/users/me/saves/toggle",
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["Saves"],
    }),

    // Get all saved items, populated
    getMySavedItems: builder.query({
      query: () => ({
        url: "/users/me/saves",
        method: "GET",
      }),
      providesTags: ["Saves"],
    }),
  }),
});

export const {
  useSigninMutation,
  useSignupMutation,
  useSendOtpMutation,
  useVerifyOtpMutation,
  useResetPasswordMutation,
  useGetMeQuery,
  useCheckUsernameQuery,
  useSignoutMutation,
  useUpdatePasswordMutation,
  useGetProfileQuery,
  useUpdateAttemptVisibilityMutation,
  useGetCertificateQuery,
  useGetPublicProfileQuery,
  useUpdateProfileMutation,
  useDeactivateAccountMutation,
  useDeleteAccountMutation,
  useToggleBookmarkMutation,
  useGetBookmarksQuery,
  useToggleSavedItemMutation,
  useGetMySavedItemsQuery,
} = authApi;
