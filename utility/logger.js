const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;
require('winston-daily-rotate-file');

var transportApi = new (transports.DailyRotateFile)({
  filename: 'log/VtuberApi-%DATE%.log',
  datePattern: 'YYYY-MM-DD'
});

var transportSocketIO = new (transports.DailyRotateFile)({
  filename: 'log/VtuberSocketIO-%DATE%.log',
  datePattern: 'YYYY-MM-DD'
});

const formatLog = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

var logVtuberApi = createLogger({
  format: combine(
    timestamp(),
    formatLog
  ),
  transports: [
    transportApi
    ]
  });

var logVtuberSocketIO = createLogger({
  format: combine(
    timestamp(),
    formatLog
  ),
  transports: [
    transportSocketIO
    ]
  });

var logger = {
  logVtuberApi: logVtuberApi,
  logVtuberSocketIO: logVtuberSocketIO
};

module.exports = {logger};