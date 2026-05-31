"use client";

import { useEffect } from "react";
import "@n8n/chat/style.css";
import { useTranslations } from "next-intl";

export default function N8nChatbot() {
  const t = useTranslations("chatbot");
  const hour = new Date().getHours();
  const greeting = hour >= 4 && hour < 12 ? t("goodMorning") : t("goodEvening");

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
        initialMessages: [`${greeting}\n${t("howCanIHelp")}`],
        chatInputKey: "chatInput",
        chatSessionKey: "sessionId",
        i18n: {
          en: {
            title: t("liveChat"),
            subtitle: t("subtitle"),
            footer: "",
            getStarted: t("startConversation"),
            inputPlaceholder: t("inputPlaceholder"),
            closeButtonTooltip: t("close"),
          },
        },
        theme: {
          primaryColor: "#2e7d32",
        },
      });
    });

    // Observer to dynamically inject quick reply buttons inside n8n chat input area
    const targetNode = document.getElementById("n8n-chat");
    if (!targetNode) return;

    const observer = new MutationObserver(() => {
      const chatInput = targetNode.querySelector(".chat-window .chat-input");
      const hasQuickReplies = targetNode.querySelector(".chat-quick-replies");

      if (chatInput && !hasQuickReplies) {
        const container = document.createElement("div");
        container.className = "chat-quick-replies";

        const title = document.createElement("div");
        title.className = "chat-quick-replies-title";
        title.textContent = t("suggestedFaq");

        const list = document.createElement("div");
        list.className = "chat-quick-replies-list";

        const suggestions = [
          { text: t("faq.location"), label: t("faq.locationLabel") },
          { text: t("faq.donate"), label: t("faq.donateLabel") },
          { text: t("faq.about"), label: t("faq.aboutLabel") }
        ];

        suggestions.forEach((item) => {
          const button = document.createElement("button");
          button.className = "chat-quick-reply-btn";
          button.textContent = item.label;
          button.type = "button";
          button.addEventListener("click", () => {
            const textarea = chatInput.querySelector("textarea");
            const sendBtn = chatInput.querySelector('button[type="submit"]');
            if (textarea && sendBtn) {
              textarea.value = item.text;
              textarea.dispatchEvent(new Event("input", { bubbles: true }));
              // Small delay to let Vue/React catch the input value change before sending
              setTimeout(() => {
                sendBtn.dispatchEvent(new Event("click", { bubbles: true }));
              }, 50);
            }
          });
          list.appendChild(button);
        });

        container.appendChild(title);
        container.appendChild(list);

        // Inject the container right above the input box
        chatInput.parentNode?.insertBefore(container, chatInput);
      }
    });

    observer.observe(targetNode, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  }, [greeting, t]);

  return <div id="n8n-chat" />;
}