"use strict";
let io;
module.exports = {
    init: (httpServer) => {
        io = require("socket.io")(httpServer, {
            cors: {
                origin: process.env.frontend_domain,
                methods: ["GET", "POST", "PUT", "DELETE "],
            },
        });
        return io;
    },
    getIo: () => {
        if (!io) {
            throw new Error("Socket.io not initialized!");
        }
        return io;
    },
};
