import { configureStore } from "@reduxjs/toolkit";
import { uiReducer, categoryReducer } from "./slices";
import { TypedUseSelectorHook, useSelector, useDispatch } from "react-redux";
import { websiteSettingsReducer } from "./slices/websiteSettings/websiteSettings.slice";

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    category: categoryReducer,
    websiteSettings: websiteSettingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch: () => AppDispatch = useDispatch;
