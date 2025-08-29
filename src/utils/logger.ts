const DEBUG = import.meta.env.VITE_DEBUG === "true"; // can toggle with env variable

export const logDebug = (...args: any[]) => {
  if (DEBUG) {
    console.log("[DEBUG]", ...args);
  }
}

export const logError = (...args: any[]) => {
  console.error("[ERROR]", ...args);
}

