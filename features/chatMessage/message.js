const path = require('path');
const axios = require("axios");
const configPath = path.resolve(__dirname, '../../config/chatMessage.json');
const config = require(configPath);

exports.getChatMessage =  function(req) {
    const {message, sender, character, location, radius} = req.query;
    return `\`TeleportPlayer ${location}\`\`\`${sender}${sender !== character ? "(" + character + ")" : ""}${radius}s:${message}\`\`\``.trim();
}

exports.postChatMessage = function(message) {
    axios.post(
        config.discord.webhook,
        {
            content: message,
        }
    );
}

