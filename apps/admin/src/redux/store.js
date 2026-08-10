import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { dashboardApi } from './services/dashboardApi';
import { userApi } from './services/userApi';
import { contactApi } from './services/contactApi';

export const store = configureStore({
  reducer: {
    [dashboardApi.reducerPath]: dashboardApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [contactApi.reducerPath]: contactApi.reducer
  },
  middleware: (getDefaultMiddleware) =>
  getDefaultMiddleware().concat(
    dashboardApi.middleware,
    userApi.middleware,
    contactApi.middleware
  )
});

setupListeners(store.dispatch);