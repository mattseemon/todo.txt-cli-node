const chalk = require('chalk');
const dateformat = require('dateformat');
const { createLogger, format, transports } = require('winston');
const stripAnsi = require('strip-ansi');
const cliFormat = require('cli-format');
require('winston-daily-rotate-file');

const { combine, timestamp, label, printf } = format;
const logDateFormat  = 'yyyy-mm-dd HH:MM:ss:l';
const prefix = 'TODO';

const consoleFormat = printf(({ level, message, label, timestamp }) => {
    //let stringFormat = chalk`{bgWhite  {black ${label}} }`;
    let stringFormat = '';
    switch(level) {
        case "error":
            stringFormat += `{bgRed  {white ${prefix}} }`;
            break;
        case "warn":
            stringFormat += `{bgYellow  {black ${prefix}} }`;
            break;
        case "info":
            stringFormat += `{bgGreen  {black ${prefix}} }`;
            break;
        case "verbose":
            stringFormat += `{bgWhite  {black ${prefix}} }`;
            break;
        case "debug":
            stringFormat += `{bgMagenta  {white ${prefix}} }`;
            break
    }
    return cliFormat.wrap(this.chalkish `${stringFormat}{reset  ${message.replace(/\\/g, '\\\\')}}`,  { hangingIndent: '       ', width: 80 });
});

const fileFormat = printf(({ level, message, label, timestamp }) => {
    return JSON.stringify({ source: label, date: dateformat(timestamp, logDateFormat), level, message: stripAnsi(message) }) ;
});

const logger = createLogger({
    level: 'silly',
    format: format.json(),
    transports: [
        new transports.DailyRotateFile({
            level: 'silly',
            filename: `${process.cwd()}/logs/log-%DATE%.log`,
            zippedArchive: true,
            format: combine(
                label({ label: prefix }),
                timestamp(),
                fileFormat
            )
        }),
        new transports.Console({
            level: 'info',
            format: combine(
                label({ label: prefix }),
                timestamp(),
                consoleFormat
            )
        })
    ],
    exitOnError: true
})


exports.info = (message) => {
    logger.info(message);
}

exports.warn = (message) => {
    logger.warn(message);
}

exports.success = (message) => {
    logger.info(`{green {bold ${message}}}`);
}

exports.error = (message) => {
    logger.error(message);
}

exports.debug = (message) => {
    logger.debug(message);
}

exports.verbose = (message) => {
    logger.verbose(message);
}

exports.chalkish = (parts, ...substitutions) => {
    let rawResults = [], cookedResults = [];

    for(let i = 0; i < parts.length; i++) {
        rawResults.push(parts.raw[i]);
        cookedResults.push(parts[i]);

        if(i < substitutions.length) {
            rawResults.push(substitutions[i]);
            cookedResults.push(substitutions[i]);
        }
    }

    // Now that we have all the template parts and the value substitutions from the
    // original string, we can build the SINGLE value that we pass onto chalk. This
    // will cause chalk to evaluate the original template as if it were a static
    // string (rather than a set of value substitutions).
    let chalkParts = [cookedResults.join( "" )];
    chalkParts.raw = [rawResults.join( "" )];

    return chalk(chalkParts);
}