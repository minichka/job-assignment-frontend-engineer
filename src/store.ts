import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";

import articlesSlice from "./features/articles/articlesSlice";
import authSlice from "./features/auth/authSlice";
import profileSlice from "./features/profile/profileSlice";

export const store = configureStore({
  reducer: {
    auth: authSlice,
    articles: articlesSlice,
    profile: profileSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;