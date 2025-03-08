export const processDimensionInput = (input: string) => {
  // Trim whitespace from the input
  const trimmedInput = input.trim();

  // Check if the input ends with 'px' or '%'
  if (trimmedInput.endsWith("px")) {
    // Return the input as it is valid
    return trimmedInput;
  } else if (trimmedInput.endsWith("%")) {
    // Parse the number from the percentage input
    const percentageValue = parseFloat(trimmedInput);
    // Cap the percentage at 100 if it exceeds it
    if (percentageValue > 100) {
      return "100%";
    } else {
      // Return the original percentage if it's less than or equal to 100
      return trimmedInput;
    }
  } else {
    // If there is no 'px' or '%', check if it is a valid number
    const numericValue = parseFloat(trimmedInput);
    if (!isNaN(numericValue)) {
      // Return the value with 'px' appended if it's a valid number
      return `${numericValue}px`;
    } else {
      // Return default value 100% as the input is invalid
      return "100%";
    }
  }
};

/**
 * Parses input to boolean.
 * Case:
 *  - 'true' | 'TRUE' -> true
 *  - 'false' | 'FALSE' -> false
 *  - '1' | 1 -> true
 *  - '0' | 0 -> false
 *  - 'yes' | 'YES' -> true
 *  - 'no' | 'NO' -> false
 *  - 'on' | 'ON' -> true
 *  - 'off' | 'OFF' -> false
 *  - 'enable' | 'ENABLE' -> true
 *  - 'disable' | 'DISABLE' -> false
 *  - true -> true
 *  - false -> false
 *
 * @param input - input to be parsed
 * @returns boolean
 */
export const parseBoolean = (
  input: string | boolean | number | undefined,
): boolean => {
  if (typeof input === "boolean") {
    return input;
  }
  if (typeof input === "number") {
    return input === 1;
  }
  if (typeof input === "string") {
    const lowerCaseInput = input.toLowerCase();
    switch (lowerCaseInput) {
      case "true":
      case "1":
      case "yes":
      case "on":
      case "enable":
        return true;
      case "false":
      case "0":
      case "no":
      case "off":
      case "disable":
        return false;
      default:
        return false;
    }
  }
  if (input === undefined) {
    return false;
  }

  return false;
};

/**
 * Generates a slug from a title.
 *
 * @param title - The title to generate a slug from
 * @returns The generated slug
 */
export const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
};
