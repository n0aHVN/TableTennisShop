// `create` is the core Zustand function that creates a global store (like React useState, but shared across all components)
import { create } from "zustand";
// `persist` is a middleware that automatically saves/loads state to/from localStorage
import { persist } from "zustand/middleware";

// Only allow "light" or "dark" as valid theme values
type Theme = "light" | "dark";

// Define the shape of our store: what data it holds and what actions it exposes
interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
}

// Create the store and export it as a React hook called `useTheme`
// Any component can call `const { theme, toggleTheme } = useTheme()` to use it
export const useTheme = create<ThemeState>()(
  // `persist` wraps the store so that every state change is saved to localStorage
  // and restored automatically when the page reloads
  persist(
    // `set` is how you update the store's state (similar to setState in React)
    (set) => ({
      theme: "dark", // default theme if nothing is saved in localStorage yet
      toggleTheme: () =>
        // Flip the theme: dark -> light, light -> dark
        set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),
    }),
    // The localStorage key — stored as JSON: {"state":{"theme":"dark"},"version":0}
    { name: "theme" }
  )
);

// --- DOM side-effect: keep the <html> element's CSS class in sync with the store ---
// This runs only in the browser (not during server-side rendering where `window` doesn't exist)
if (typeof window !== "undefined") {
  // Helper: add or remove the "dark" class on <html>
  // Tailwind CSS uses this class to activate all `dark:` styles (e.g. dark:bg-zinc-950)
  const applyTheme = (theme: Theme) => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  };

  // Apply the theme immediately when this file first loads
  // `getState()` reads the current store value without needing a React component
  applyTheme(useTheme.getState().theme);

  // Subscribe to future changes — whenever toggleTheme() is called from any component,
  // this callback fires and updates the <html> class accordingly
  useTheme.subscribe((state) => {
    applyTheme(state.theme);
  });
}
