"use client";

import { useEffect } from "react";
import "@n8n/chat/style.css";

export default function N8nChatbot() {
  const hour = new Date().getHours();
  const greeting = hour >= 4 && hour < 12 ? "صباح الخير" : "مساء الخير";

  useEffect(() => {
    /* Vue feature flags required by @n8n/chat's bundled Vue runtime */
    (globalThis as Record<string, unknown>).__VUE_OPTIONS_API__ = true;
    (globalThis as Record<string, unknown>).__VUE_PROD_DEVTOOLS__ = false;
    (globalThis as Record<string, unknown>).__VUE_PROD_HYDRATION_MISMATCH_DETAILS__ = false;

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
          primaryColor: "#2e7d32",
        },
      });
    });
  }, []);

  return <div id="n8n-chat" />;
}