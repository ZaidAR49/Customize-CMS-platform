"use client";

import { useEffect } from "react";
import "@n8n/chat/style.css";

export default function N8nChatbot() {
  const hour = new Date().getHours();
  const greeting = hour >= 4 && hour < 12 ? "صباح الخير" : "مساء الخير";

  useEffect(() => {
    import("@n8n/chat").then(({ createChat }) => {
      createChat({
        webhookUrl: process.env.NEXT_PUBLIC_WEBHOOKURL,
        showWelcomeScreen: false,
        mode: "window",
        initialMessages: [`${greeting}\nكيف يمكنني مساعدتك؟`],
        chatInputKey: "chatInput",
        chatSessionKey: "sessionId",
        i18n: {
          en: {
            title: "المحادثة المباشرة",
            subtitle: "تحدث معنا لأي استفسار",
            footer: "",
            getStarted: "ابدأ المحادثة",
            inputPlaceholder: "اكتب رسالتك هنا...",
            closeButtonTooltip: "إغلاق",
          },
        },
        theme: {
          // CSS var() is not supported here — use a literal hex value
          primaryColor: "#2e7d32",
        },
      });
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // `greeting` is derived from the hour at mount time; re-running on change
  // would reinitialise the widget mid-session, so the empty dep array is intentional.

  return <div id="n8n-chat" />;
}