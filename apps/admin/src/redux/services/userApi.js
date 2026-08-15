import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export const userApi = createApi({
  reducerPath: "userApi",
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
  tagTypes: ["Users", "User", "Permissions"],
  endpoints: (builder) => ({
    getUserOverview: builder.query({
      query: () => "/users/overview",
      providesTags: ["Users"],
    }),
    getUsers: builder.query({
      query: (params) => ({
        url: "/users",
        params,
      }),
      providesTags: ["Users"],
    }),
    getUserById: builder.query({
      query: (id) => `/users/${id}`,
      providesTags: (result, error, id) => [{ type: "User", id }],
    }),
    getManagedUser: builder.query({
      query: (id) => `/users/${id}/management`,
      providesTags: (result, error, id) => [{ type: "User", id }],
    }),
    getAuditLogs: builder.query({
      query: (params) => ({ url: "/users/audit", params }),
      providesTags: ["Users"],
    }),
    getInvitations: builder.query({
      query: (params) => ({ url: "/users/invitations", params }),
      providesTags: ["Users"],
    }),
    getPermissionMatrix: builder.query({
      query: () => "/users/permissions/matrix",
      providesTags: ["Permissions"],
    }),
    updatePermissionMatrix: builder.mutation({
      query: (roles) => ({
        url: "/users/permissions/matrix",
        method: "PUT",
        body: { roles },
      }),
      invalidatesTags: ["Permissions"],
    }),
    createInvitation: builder.mutation({
      query: (body) => ({ url: "/users/invitations", method: "POST", body }),
      invalidatesTags: ["Users"],
    }),
    cancelInvitation: builder.mutation({
      query: (id) => ({ url: `/users/invitations/${id}`, method: "DELETE" }),
      invalidatesTags: ["Users"],
    }),
    addUserNote: builder.mutation({
      query: ({ id, body }) => ({
        url: `/users/${id}/notes`,
        method: "POST",
        body: { body },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "User", id }],
    }),
    revokeUserSessions: builder.mutation({
      query: (id) => ({ url: `/users/${id}/revoke-sessions`, method: "POST" }),
      invalidatesTags: (result, error, id) => [{ type: "User", id }],
    }),
    createUser: builder.mutation({
      query: (body) => ({
        url: "/users",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Users"],
    }),
    updateUser: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/users/${id}`,
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [
        "Users",
        { type: "User", id },
      ],
    }),
    updateUserRole: builder.mutation({
      query: ({ id, role }) => ({
        url: `/users/${id}/role`,
        method: "PATCH",
        body: { role },
      }),
      invalidatesTags: (result, error, { id }) => [
        "Users",
        { type: "User", id },
      ],
    }),
    updateUserStatus: builder.mutation({
      query: ({ id, status, reason, expiresAt }) => ({
        url: `/users/${id}/status`,
        method: "PATCH",
        body: { status, reason, expiresAt },
      }),
      invalidatesTags: (result, error, { id }) => [
        "Users",
        { type: "User", id },
      ],
    }),
    resetUserPassword: builder.mutation({
      query: ({ id, newPassword }) => ({
        url: `/users/${id}/reset-password`,
        method: "PATCH",
        body: { newPassword },
      }),
    }),
    deleteUser: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/users/${id}`,
        method: "DELETE",
        body: { reason },
      }),
      invalidatesTags: ["Users"],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserOverviewQuery,
  useGetUserByIdQuery,
  useGetManagedUserQuery,
  useGetAuditLogsQuery,
  useGetInvitationsQuery,
  useGetPermissionMatrixQuery,
  useUpdatePermissionMatrixMutation,
  useCreateInvitationMutation,
  useCancelInvitationMutation,
  useAddUserNoteMutation,
  useRevokeUserSessionsMutation,
  useCreateUserMutation,
  useUpdateUserMutation,
  useUpdateUserRoleMutation,
  useUpdateUserStatusMutation,
  useResetUserPasswordMutation,
  useDeleteUserMutation,
} = userApi;
