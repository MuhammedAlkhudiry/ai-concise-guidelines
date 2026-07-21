/**
 * Colored console output utilities
 */

import pc from "picocolors";

export const compactOutput =
  process.argv.includes("--compact") || process.env.MY_SETUP_OUTPUT === "compact";

export const colors = {
  red: pc.red,
  green: pc.green,
  yellow: pc.yellow,
  blue: pc.blue,
  magenta: pc.magenta,
  cyan: pc.cyan,
  dim: pc.dim,
};

export const print = {
  error: (msg: string) => console.error(colors.red(`ERROR: ${msg}`)),
  success: (msg: string) => {
    if (!compactOutput) console.log(colors.green(msg));
  },
  info: (msg: string) => {
    if (!compactOutput) console.log(colors.blue(msg));
  },
  warning: (msg: string) => console.log(colors.yellow(msg)),
  dim: (msg: string) => {
    if (!compactOutput) console.log(colors.dim(msg));
  },
};

/**
 * Print a boxed header
 */
export function printBox(title: string, color: keyof typeof colors = "blue"): void {
  if (compactOutput) return;
  const width = 61;
  const padding = Math.max(0, width - title.length - 4);
  const paddedTitle = title + " ".repeat(padding);

  const colorFn = colors[color];
  console.log(colorFn(`+${"=".repeat(width)}+`));
  console.log(colorFn(`|   ${paddedTitle}|`));
  console.log(colorFn(`+${"=".repeat(width)}+`));
}

/**
 * Print a separator line
 */
export function printSeparator(color: keyof typeof colors = "yellow"): void {
  if (compactOutput) return;
  console.log(colors[color]("=".repeat(59)));
}
