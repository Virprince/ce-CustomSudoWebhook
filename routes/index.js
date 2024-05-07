const express = require("express");
const router = express.Router();

const fs = require('fs');
const path = require('path');

const {getChatMessage, postChatMessage} = require('../features/chatMessage/message.js');
const {getEventConfig, postMessage} = require('../features/logMessage/message');

router.get(`/log`, function (req, res, next) {
    const eventConfigs = getEventConfig(req);
    postMessage(req, eventConfigs);

    res.json({
        ManifestFileVersion: "000000000000",
        bIsFileData: false,
        AppID: "000000000000",
        AppNameString: "",
        BuildVersionString: "",
        LaunchExeString: "",
        LaunchCommand: "",
        PrereqIds: [],
        PrereqName: "",
        PrereqPath: "",
        PrereqArgs: "",
        FileManifestList: [],
        ChunkHashList: {},
        ChunkShaList: {},
        DataGroupList: {},
        ChunkFilesizeList: {},
        CustomFields: {},
    });
});

router.get(`/message`, function (req, res, next) {
    const {message, sender, character, location, radius} = req.query;

    const content = getChatMessage(req);
    postChatMessage(content);

    res.json({
        ManifestFileVersion: "000000000000",
        bIsFileData: false,
        AppID: "000000000000",
        AppNameString: "",
        BuildVersionString: "",
        LaunchExeString: "",
        LaunchCommand: "",
        PrereqIds: [],
        PrereqName: "",
        PrereqPath: "",
        PrereqArgs: "",
        FileManifestList: [],
        ChunkHashList: {},
        ChunkShaList: {},
        DataGroupList: {},
        ChunkFilesizeList: {},
        CustomFields: {},
    });
});

module.exports = router;