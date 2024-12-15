interface LoggerOptions {
  hint: string;
  event: string;
}

interface LogLevelColors {
  debug: string;
  info: string;
  warn: string;
  error: string;
}

const LogLevelColor: LogLevelColors = {
  debug: "#6c757d",
  info: "#0d6efd",
  warn: "#ffc107",
  error: "#dc3545",
};

const getLogColor = (event: string): string => {
  let hash = 0;
  for (let i = 0; i < event.length; i++) {
    hash = event.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 65%, 45%)`;
};

const formatLogMessage = (level: keyof LogLevelColors, { event, hint }: LoggerOptions): string[] => [
  `%c${level.toUpperCase()}%c ${event}%c ${hint.slice(0, 50)}${hint.length > 50 ? "..." : ""}`,
  `background: ${LogLevelColor[level]}; color: white; padding: 1.5px 2.2px; border-radius: 2px; font-size: 11px;`,
  `color: ${getLogColor(event)}; padding: 4px 0px; font-size: 11px;`,
  "color: gray; font-size: 11px; padding-left: 4px;",
];

interface Logger {
  debug: <T>(...args: [T, LoggerOptions]) => void;
  info: <T>(...args: [T, LoggerOptions]) => void;
  warn: <T>(...args: [T, LoggerOptions]) => void;
  error: <T>(...args: [T, LoggerOptions]) => void;
}

export const log: Logger = {
  debug: (payload, options) => {
    console.groupCollapsed(...formatLogMessage("debug", options));
    console.dir(payload, { depth: null, colors: true });
    console.groupEnd();
  },
  info: (payload, options) => {
    console.groupCollapsed(...formatLogMessage("info", options));
    console.dir(payload, { depth: null, colors: true });
    console.groupEnd();
  },
  warn: (payload, options) => {
    console.groupCollapsed(...formatLogMessage("warn", options));
    console.dir(payload, { depth: null, colors: true });
    console.groupEnd();
  },
  error: (payload, options) => {
    console.groupCollapsed(...formatLogMessage("error", options));
    console.dir(payload, { depth: null, colors: true });
    console.groupEnd();
  },
};
