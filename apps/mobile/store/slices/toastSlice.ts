import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ToastState {
  message: string | null;
  type: 'success' | 'info' | 'error';
  visible: boolean;
}

const initialState: ToastState = {
  message: null,
  type: 'info',
  visible: false,
};

const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    showToast: (state, action: PayloadAction<{ message: string; type?: 'success' | 'info' | 'error' }>) => {
      state.message = action.payload.message;
      state.type = action.payload.type || 'info';
      state.visible = true;
    },
    hideToast: (state) => {
      state.visible = false;
    },
  },
});

export const { showToast, hideToast } = toastSlice.actions;
export default toastSlice.reducer;
