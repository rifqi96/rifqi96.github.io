import { supabaseOptions } from "../services/supabase";
import type { AppOption } from "../types";
import { OptionAccessLevel } from "../types";
import { useAuth } from "./useAuth";

export function useOptions() {
  const options = useState<AppOption[]>("app-options", () => []);
  const loading = useState<boolean>("app-options-loading", () => false);
  const error = useState<string | null>("app-options-error", () => null);

  // Get user auth info
  const { isAuthenticated, isSuperAdmin, isWhitelisted } = useAuth();

  // Load options based on access level
  const loadOptions = async () => {
    loading.value = true;
    error.value = null;

    try {
      let data = await supabaseOptions.getAllOptions();

      // Filter options based on user's role and access level
      if (!isAuthenticated.value) {
        // Public users only see PUBLIC options
        data = data.filter(
          (opt) => opt.access_level === OptionAccessLevel.PUBLIC,
        );
      } else if (isSuperAdmin.value) {
        // Superadmins see all options
        // No filtering needed
      } else if (isWhitelisted.value) {
        // Whitelisted users see WHITELISTED and PUBLIC options
        data = data.filter(
          (opt) =>
            opt.access_level === OptionAccessLevel.WHITELISTED ||
            opt.access_level === OptionAccessLevel.PUBLIC,
        );
      } else {
        // Authenticated but not whitelisted - only see PUBLIC options
        data = data.filter(
          (opt) => opt.access_level === OptionAccessLevel.PUBLIC,
        );
      }

      options.value = data;
      return data;
    } catch (err: any) {
      console.error("Failed to load options:", err);
      error.value = err.message || "Failed to load options";
      return [];
    } finally {
      loading.value = false;
    }
  };

  // Get a single option by key
  const getOption = async (key: string) => {
    try {
      // Check if we already have the option in state
      const existing = options.value.find((opt) => opt.key === key);
      if (existing) {
        // Check access level
        if (
          !isAuthenticated.value &&
          existing.access_level !== OptionAccessLevel.PUBLIC
        ) {
          return null;
        }

        if (
          !isSuperAdmin.value &&
          !isWhitelisted.value &&
          existing.access_level !== OptionAccessLevel.PUBLIC
        ) {
          return null;
        }

        if (
          !isSuperAdmin.value &&
          existing.access_level === OptionAccessLevel.SUPERADMIN_ONLY
        ) {
          return null;
        }

        return existing;
      }

      // Otherwise fetch it
      const data = await supabaseOptions.getOptionByKey(key);

      // Check access level for the fetched option
      if (data) {
        if (
          !isAuthenticated.value &&
          data.access_level !== OptionAccessLevel.PUBLIC
        ) {
          return null;
        }

        if (
          !isSuperAdmin.value &&
          !isWhitelisted.value &&
          data.access_level !== OptionAccessLevel.PUBLIC
        ) {
          return null;
        }

        if (
          !isSuperAdmin.value &&
          data.access_level === OptionAccessLevel.SUPERADMIN_ONLY
        ) {
          return null;
        }
      }

      return data;
    } catch (err: any) {
      console.error(`Failed to get option ${key}:`, err);
      return null;
    }
  };

  // Get a option value by key
  const getOptionValue = async (key: string): Promise<string | null> => {
    const option = await getOption(key);
    return option ? option.value : null;
  };

  // Update an option (superadmin only)
  const updateOption = async (id: string, value: string) => {
    loading.value = true;
    error.value = null;

    // Check if user is superadmin
    if (!isSuperAdmin.value) {
      error.value = "Only superadmins can update options";
      loading.value = false;
      return null;
    }

    try {
      const data = await supabaseOptions.updateOption(id, value);

      // Update the state
      const index = options.value.findIndex((opt) => opt.id === id);
      if (index !== -1) {
        options.value[index] = data[0];
      }

      return data[0];
    } catch (err: any) {
      console.error("Failed to update option:", err);
      error.value = err.message || "Failed to update option";
      return null;
    } finally {
      loading.value = false;
    }
  };

  return {
    options: computed(() => options.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),

    loadOptions,
    getOption,
    getOptionValue,
    updateOption,
  };
}
