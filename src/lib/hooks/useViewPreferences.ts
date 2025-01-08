import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import type { SortBy } from "@/components/dashboard/InstanceGrid";

type ViewLayout = "compact" | "comfortable" | "list";
type GroupBy = "none" | "server" | "health" | "dbType" | string;
type SortOrder = "asc" | "desc";

interface ViewPreferences {
  layout: ViewLayout;
  groupBy: GroupBy;
  sortBy: SortBy;
  sortOrder: SortOrder;
}

const defaultPreferences: ViewPreferences = {
  layout: "comfortable",
  groupBy: "none",
  sortBy: "name",
  sortOrder: "asc",
};

export function useViewPreferences() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize from URL params or localStorage
  const [preferences, setPreferences] = useState<ViewPreferences>(() => {
    const layout = searchParams.get("layout") as ViewLayout;
    const groupBy = searchParams.get("groupBy") as GroupBy;
    const sortBy = searchParams.get("sortBy") as SortBy;
    const sortOrder = searchParams.get("sortOrder") as SortOrder;

    // If we have URL params, use those
    if (layout || groupBy || sortBy || sortOrder) {
      return {
        layout: layout || defaultPreferences.layout,
        groupBy: groupBy || defaultPreferences.groupBy,
        sortBy: sortBy || defaultPreferences.sortBy,
        sortOrder: sortOrder || defaultPreferences.sortOrder,
      };
    }

    // Otherwise try localStorage
    const saved = localStorage.getItem("viewPreferences");
    return saved ? JSON.parse(saved) : defaultPreferences;
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("viewPreferences", JSON.stringify(preferences));
  }, [preferences]);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    Object.entries(preferences).forEach(([key, value]) => {
      if (value && value !== defaultPreferences[key as keyof ViewPreferences]) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    setSearchParams(params, { replace: true });
  }, [preferences, searchParams, setSearchParams]);

  const updatePreference = <K extends keyof ViewPreferences>(
    key: K,
    value: ViewPreferences[K],
  ) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  return {
    preferences,
    updatePreference,
  };
}
