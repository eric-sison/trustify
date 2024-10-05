import pino from "pino";

const levels = {
  emerg: 80,
  alert: 70,
  crit: 60,
  error: 50,
  warn: 40,
  notice: 30,
  info: 20,
  debug: 10,
};

export const logger = pino({
  level: "debug",
  customLevels: levels,
  formatters: {
    level: (label) => ({ level: label.toUpperCase() }),
  },
  enabled: true,
  useOnlyCustomLevels: true,
  timestamp: pino.stdTimeFunctions.isoTime,
});
