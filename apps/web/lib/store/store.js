import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "../api/authApi";
import { articlesApi } from "../api/articlesApi";
import { topicsApi } from "../api/topicsApi";
import { pagesApi } from "../api/pagesApi";
import { courseApi } from "../api/courseApi";
import { contactApi } from "../api/contactApi";
import { libraryApi } from "../api/libraryApi";
import authReducer from "./authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [articlesApi.reducerPath]: articlesApi.reducer,
    [topicsApi.reducerPath]: topicsApi.reducer,
    [pagesApi.reducerPath]: pagesApi.reducer,
    [courseApi.reducerPath]: courseApi.reducer,
    [contactApi.reducerPath]: contactApi.reducer,
    [libraryApi.reducerPath]: libraryApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      articlesApi.middleware,
      topicsApi.middleware,
      pagesApi.middleware,
      courseApi.middleware,
      contactApi.middleware,
      libraryApi.middleware,
    ),
});
