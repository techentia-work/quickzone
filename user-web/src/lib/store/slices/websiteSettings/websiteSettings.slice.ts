import { WebsiteSettingsType } from "@/lib/types/websiteSettings/websiteSettings.types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface WebsiteSettingsState {
  settings: WebsiteSettingsType | null;
  loading: boolean;
}

const initialState: WebsiteSettingsState = {
  settings: null,
  loading: true,
};

const websiteSettingsSlice = createSlice({
  name: "websiteSettings",
  initialState,
  reducers: {
    setSettings: (state, action: PayloadAction<WebsiteSettingsType>) => {
      state.settings = action.payload;
      state.loading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setSettings, setLoading } = websiteSettingsSlice.actions;
export const websiteSettingsReducer = websiteSettingsSlice.reducer;