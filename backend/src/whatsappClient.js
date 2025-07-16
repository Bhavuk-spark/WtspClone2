import pkg from "whatsapp-web.js";
import qrcode from "qrcode";
import logger from "./configs/logger.config.js";

const { Client, LocalAuth } = pkg;

let whatsappClient;

export const setupWhatsapp = (io) => {
  whatsappClient = new Client({
    authStrategy: new LocalAuth({
      dataPath: "./.wwebjs_auth",
    }),
    puppeteer: {
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
  });

  whatsappClient.on("qr", (qr) => {
    logger.info("📲 QR received");
    qrcode.toDataURL(qr, (err, src) => {
      io.emit("whatsapp-qr", src);
    });
  });

  whatsappClient.on("authenticated", () => {
    logger.info("🔐 WhatsApp authenticated");
    io.emit("whatsapp-authenticated");
  });

  whatsappClient.on("ready", () => {
    logger.info("✅ WhatsApp is ready");
    io.emit("whatsapp-ready");
  });

  // ✅ Filter messages
  whatsappClient.on("message", async (msg) => {
    const chatId = msg.from;

    // ❌ Filter out status updates, channels, newsletters
    if (
      chatId.includes("status@broadcast") ||
      chatId.includes("channel@broadcast") ||
      chatId.includes("newsletter@broadcast") ||
      chatId.includes("broadcast")
    ) {
      logger.info("⛔ Ignored non-chat message from: " + chatId);
      return;
    }

    // ✅ Forward only real messages
    logger.info(`📩 Message: ${msg.body}`);
    io.emit("new-message", {
      id: msg.id._serialized,
      body: msg.body,
      from: msg.from,
      to: msg.to,
      timestamp: msg.timestamp,
    });
  });

  setTimeout(() => {
    whatsappClient.initialize();
  }, 1000);
};

export const getWhatsappClient = () => whatsappClient;
