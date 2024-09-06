"use strict";
var io;
module.exports = {
    init: function (httpServer) {
        io = require("socket.io")(httpServer, {
            cors: {
                origin: process.env.frontend_domain,
                methods: ["GET", "POST", "PUT", "DELETE "],
            },
        });
        return io;
    },
    getIo: function () {
        if (!io) {
            throw new Error("Socket.io not initialized!");
        }
        return io;
    },
};
