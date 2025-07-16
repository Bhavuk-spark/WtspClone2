import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { Server } from "socket.io";
import app from "./app.js";
import logger from "./configs/logger.config.js";
import SocketServer from "./SocketServer.js";
import { setupWhatsapp } from "./whatsappClient.js"; // <-- ADD THIS

const { DATABASE_URL } = process.env;
const PORT = process.env.PORT || 8000;

mongoose.connection.on("error", (err) => {
  logger.error(`Mongodb connection error : ${err}`);
  process.exit(1);
});

if (process.env.NODE_ENV !== "production") {
  mongoose.set("debug", true);
}

mongoose.connect(DATABASE_URL).then(() => {
  logger.info("Connected to Mongodb.");
});

let server = app.listen(PORT, () => {
  logger.info(`Server is listening at ${PORT}.`);
});

// socket io
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.CLIENT_ENDPOINT,
    credentials: true,
  },
});

io.on("connection", (socket) => {
  logger.info("✅ Socket.io connected");
  SocketServer(socket, io);
});

// Initialize WhatsApp Web
setupWhatsapp(io); // <-- ADD THIS

//handle server errors
const exitHandler = () => {
  if (server) {
    logger.info("Server closed.");
    process.exit(1);
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};
process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);

//SIGTERM
process.on("SIGTERM", () => {
  if (server) {
    logger.info("Server closed.");
    process.exit(1);
  }
});
