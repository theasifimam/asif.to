"use client";

import { Provider } from "react-redux";
import { store } from "@/lib/store/store";
import { useEffect } from "react";
import { hydrateAuth } from "@/lib/store/authSlice";
import { useAppDispatch } from "@/lib/store/hooks";
import { Toaster } from "sonner";

function AuthHydrator({ children }) {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(hydrateAuth());
  }, [dispatch]);
  return <>{children}</>;
}

export function ReduxProvider({ children }) {
  return (
    <Provider store={store}>
            <AuthHydrator>
                {children}
            </AuthHydrator>
            <Toaster richColors position="top-center" />
      
        </Provider>);

}