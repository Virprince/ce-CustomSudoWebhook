const path = require('path');
const axios = require("axios");
const configPath = path.resolve(__dirname, '../../config/chatMessage.json');
const config = require(configPath);

exports.getChatMessage =  function(req) {
    const {message, sender, character, location, radius, channel} = req.query;
    
    console.log(req.query);
    
    return `\`TeleportPlayer ${location}\` \n ${sender}${sender !== character ? "(" + character + ")" : ""} ${radius} in channel ${channel} : ${message}`.trim();
}

exports.postChatMessage = function(message) {
    axios.post(
        config.discord.webhook,
        {
            content: message,
        }
    );
}

