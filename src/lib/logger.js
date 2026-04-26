/**
 * Environment-aware logging system
 * dev → colored console, prod → silent
 */

const isDev = process.env.NODE_ENV === "development";

const colors = {
  info: "#6C5CE7",
  warn: "#FDCB6E",
  error: "#D63031",
  success: "#00B894",
  debug: "#74B9FF",
};

function log(level, message, data = null) {
  if (!isDev && level !== "error") return;

  const color = colors[level] || colors.info;
  const prefix = `%c[KLP:${level.toUpperCase()}]`;
  const style = `color: ${color}; font-weight: bold;`;

  if (data) {
    console.log(prefix, style, message, data);
  } else {
    console.log(prefix, style, message);
  }
}

export const logger = {
  info: (msg, data) => log("info", msg, data),
  warn: (msg, data) => log("warn", msg, data),
  error: (msg, data) => log("error", msg, data),
  success: (msg, data) => log("success", msg, data),
  debug: (msg, data) => log("debug", msg, data),
};
