import React, { useEffect, useState } from "react";

export default function WhatsappQR({ socket }) {
  const [qrCode, setQrCode] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!socket) return;

    socket.on("whatsapp-qr", (qrImage) => {
      setQrCode(qrImage);
      setReady(false);
    });

    socket.on("whatsapp-ready", () => {
      setQrCode(null);
      setReady(true);
    });

    socket.on("whatsapp-authenticated", () => {
      setQrCode(null);
      setReady(true);
    });

    return () => {
      socket.off("whatsapp-qr");
      socket.off("whatsapp-ready");
      socket.off("whatsapp-authenticated");
    };
  }, [socket]);

  if (ready || !qrCode) return null;

  return (
    <div className="absolute top-0 left-0 w-full h-full bg-white dark:bg-dark_bg_1 flex flex-col items-center justify-center z-50">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
        Scan WhatsApp QR Code
      </h2>
      <img
        src={qrCode}
        alt="WhatsApp QR Code"
        className="w-80 h-80 border rounded-lg shadow-md"
      />
    </div>
  );
}
