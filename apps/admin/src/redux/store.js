import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { dashboardApi } from './services/dashboardApi';
import { userApi } from './services/userApi';

export const store = configureStore({
  reducer: {
    [dashboardApi.reducerPath]: dashboardApi.reducer,
    [userApi.reducerPath]: userApi.reducer
  },
  middleware: (getDefaultMiddleware) =>
  getDefaultMiddleware().concat(
    dashboardApi.middleware,
    userApi.middleware
  )
});

setupListeners(store.dispatch);