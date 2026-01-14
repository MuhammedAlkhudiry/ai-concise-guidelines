/**
 * Colored console output utilities
 */

const colors = {
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  blue: (s: string) => `\x1b[34m${s}\x1b[0m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
  reset: (s: string) => `\x1b[0m${s}\x1b[0m`,
};

export { colors };

export const print = {
  error: (msg: string) => console.error(colors.red(`ERROR: ${msg}`)),
  success: (msg: string) => console.log(colors.green(msg)),
  info: (msg: string) => console.log(colors.blue(msg)),
  warning: (msg: string) => console.log(colors.yellow(msg)),
  dim: (msg: string) => console.log(colors.dim(msg)),
};

/**
 * Print a boxed header
 */
export function printBox(title: string, color: keyof typeof colors = "blue"): void {
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
  console.log(colors[color]("=".repeat(59)));
}
