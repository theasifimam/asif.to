import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import themeReducer from './slices/themeSlice';
import wishlistReducer from './slices/wishlistSlice';
import toastReducer from './slices/toastSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    theme: themeReducer,
    wishlist: wishlistReducer,
    toast: toastReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
