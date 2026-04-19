"use client";

import { useWebsiteSettings } from "@/hooks/entities/useWebsiteSettings";
import { useAppDispatch } from "@/lib/store";
import {
  setLoading,
  setSettings,
} from "@/lib/store/slices/websiteSettings/websiteSettings.slice";
import { useEffect } from "react";

export const WebsiteSettingsInitializer = () => {
  const dispatch = useAppDispatch();
  const { settings, isLoading } = useWebsiteSettings();

  // whenever settings or loading changes, update Redux
  useEffect(() => {
    dispatch(setLoading(isLoading));
    if (settings) dispatch(setSettings(settings));
  }, [settings, isLoading, dispatch]);

  // this component doesn’t render anything
  return null;
};
