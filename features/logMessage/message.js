const path = require('path');
const axios = require("axios");
const configPath = path.resolve(__dirname, '../../config/logMessage.json');
const config = require(configPath);
const fs = require("fs");

/**
 * Get all the configuration for the eventId
 * @param req
 * @returns {*[]}
 */
exports.getEventConfig = function(req) {
    const {eventId,params} = req.query;
    let configs= [];

    // no particular configuration for this eventId, return default
    if (!eventId in config.eventId){
        return [config.eventId.default];
    }
    
    // get the configuration for this eventId
    const subConfig = config.eventId[eventId];
    
    // is log to file enabled globally for eventId ?
    if (subConfig.hasOwnProperty('logInFile') && subConfig.logInFile.enabled) {
        logToFile(req, subConfig.logInFile);
    }

    // split the params to get the first part which is often the most important data (e.g. "AbilityName|targetName(status)")
    let eventName = params.split("|")[0];
    
    // search for the configurations that match the event
    for (let key in subConfig) {
        
        // search for the exact event name in the find array and get the configuration
        if (subConfig[key].hasOwnProperty('find') && subConfig[key]['find'].includes(eventName)) {
            configs.push(subConfig[key]);
        }

        // search include string in the params and get the configuration
        if (subConfig[key].hasOwnProperty('include') && params.includes(subConfig[key]['include'])) {
            configs.push(subConfig[key]);
        }
    }

    // if no configuration found, return the default configuration of the eventId
    if (configs.length === 0) {
        configs.push(subConfig.default);
    }

    return configs;
    
}

/**
 * Post message to discord
 * @param req
 * @param configs
 */
exports.postMessage =  function(req, configs) {
    // loop through all the configurations and post the message to discord
    configs.forEach((config) => {
        
        let discordConfig = config.discord;

        discordConfig.forEach((conf) => {
            const message = getLogMessage(req, conf);
            axios.post(
                conf.webhook,
                {
                    content: message,
                }
            ).then(r => {
                // is log to file enabled ?
                if (conf.hasOwnProperty('logInFile') && conf.logInFile.enabled) {
                    logToFile(req, conf.logInFile);
                }
            });
        });
    });
}

/**
 * Get the log message based on the configuration
 * @param req
 * @param config
 * @returns {*}
 */
const getLogMessage =  function(req, config) {
    const {charName, eventId, eventType, eventCategory, params} = req.query;
    let message = config.message;
    
    message = message
        .replace("[[charName]]", charName)
        .replace("[[eventId]]", eventId)
        .replace("[[eventType]]", eventType)
        .replace("[[eventCategory]]", eventCategory)
        .replace("[[params]]", params)
    ;
    
    return message;
    
}

/**
 * Log the message to a file
 * @param req
 * @param config
 */
const logToFile = function(req, config ) {
    // get the log message
    let message = getLogMessage(req, config);
    // get the root log file name
    let fileName = config.fileName ?? 'logfile';
    
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    
    // create the log file name with the year and month so that we can have a new log file every month
    const logFileName = `${fileName}_${year}_${month}.log`;
    
    // get the full path of the log file
    const logFilePath = path.resolve(path.join(__dirname, '../../logs/' + logFileName));
    
    // add date to the message
    const logMessage = `${now.toISOString()} - ${message}\n`;

    // write the message to the log file
    fs.appendFile(logFilePath, logMessage, (err) => {
        if (err) {
            console.error('Error while writing in file', err);
        }
    });
}