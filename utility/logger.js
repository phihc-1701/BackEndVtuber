const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;
require('winston-daily-rotate-file');

let transportApi = new (transports.DailyRotateFile)({
  filename: 'log/api.%DATE%.log',
  datePattern: 'YYYY-MM-DD'
});

let transportSocketIO = new (transports.DailyRotateFile)({
  filename: 'log/socketIo.%DATE%.log',
  datePattern: 'YYYY-MM-DD'
});

const formatLog = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

let api = createLogger({
  format: combine(
    timestamp(),
    formatLog
  ),
  transports: [
    transportApi
    ]
  });

  let socketIo = createLogger({
  format: combine(
    timestamp(),
    formatLog
  ),
  transports: [
    transportSocketIO
    ]
  });

  let logger = {
  api: api,
  socketIo: socketIo
};

module.exports = {logger};