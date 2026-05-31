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
            if (!textarea) return;

            // Use the native setter so Vue's reactivity picks up the change
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
              HTMLTextAreaElement.prototype,
              "value"
            )?.set;

            if (nativeInputValueSetter) {
              nativeInputValueSetter.call(textarea, item.text);
            } else {
              textarea.value = item.text;
            }

            // Dispatch both input and change events for maximum framework compatibility
            textarea.dispatchEvent(new Event("input", { bubbles: true }));
            textarea.dispatchEvent(new Event("change", { bubbles: true }));

            // Focus so the user can review then hit Enter/Send themselves
            textarea.focus();
          });
          list.appendChild(button);
        });

        container.appendChild(title);
        container.appendChild(list);

        // Inject the container right above the input box
        chatInput.parentNode?.insertBefore(container, chatInput);

        // Watch for user messages: hide suggestions on first, enforce limit at 10
        const MAX_MESSAGES = 10;
        const limitMsg = t("maxLimitReached");

        const enforceLimitAndHideSuggestions = new MutationObserver(() => {
          // Lazy lookup — messagesList may not exist when quick-replies are injected
          const messagesList = targetNode.querySelector(".chat-messages-list");
          if (!messagesList) return;

          const userMessages = messagesList.querySelectorAll(
            ".chat-message.chat-message-from-user"
          );

          // Hide suggestions after the first user message
          if (userMessages.length > 0 && container.isConnected) {
            container.remove();
          }

          // Enforce the max message limit
          if (userMessages.length >= MAX_MESSAGES) {
            const textarea = chatInput.querySelector<HTMLTextAreaElement>("textarea");
            const sendBtn = chatInput.querySelector<HTMLButtonElement>("button");

            if (textarea && !textarea.disabled) {
              textarea.disabled = true;
              textarea.placeholder = limitMsg;
              textarea.style.cursor = "not-allowed";
              textarea.style.opacity = "0.5";
            }
            if (sendBtn && !sendBtn.disabled) {
              sendBtn.disabled = true;
              sendBtn.style.opacity = "0.4";
              sendBtn.style.cursor = "not-allowed";
            }

            // Show a banner above the input if not already shown
            const existingBanner = chatInput.parentNode?.querySelector(".chat-limit-banner");
            if (!existingBanner) {
              const banner = document.createElement("div");
              banner.className = "chat-limit-banner";
              banner.textContent = limitMsg;
              Object.assign(banner.style, {
                padding: "10px 14px",
                margin: "8px 0 4px",
                background: "#fff3cd",
                border: "1px solid #ffc107",
                borderRadius: "8px",
                color: "#856404",
                fontSize: "13px",
                lineHeight: "1.5",
                textAlign: "center",
              });
              chatInput.parentNode?.insertBefore(banner, chatInput);
            }

            enforceLimitAndHideSuggestions.disconnect();
          }
        });

        // Observe the whole targetNode subtree so we catch messages regardless of
        // when .chat-messages-list appears in the DOM
        enforceLimitAndHideSuggestions.observe(targetNode, {
          childList: true,
          subtree: true,
        });
      }
    });

    observer.observe(targetNode, {
      childList: true,
      subtree: true,
    });

    // Close the chat window when the user clicks anywhere outside it.
    // Guard: only act when the window is actually VISIBLE on screen.
    // n8n keeps .chat-window in the DOM even when closed (CSS scale/opacity
    // transition), so we check getBoundingClientRect().height instead of
    // DOM presence to avoid triggering on an already-closed window.
    const handleClickOutside = (e: MouseEvent) => {
      const chatRoot = document.getElementById("n8n-chat");
      if (!chatRoot) return;

      // Find the chat window and verify it is visually open (has height > 0)
      const chatWindow = chatRoot.querySelector<HTMLElement>(".chat-window");
      if (!chatWindow) return;
      if (chatWindow.getBoundingClientRect().height === 0) return;

      // If the click landed inside the chat widget, do nothing
      if (chatRoot.contains(e.target as Node)) return;

      // Click was genuinely outside an open chat → close it
      const toggleBtn = chatRoot.querySelector<HTMLButtonElement>(".chat-window-toggle");
      if (toggleBtn) {
        toggleBtn.click();
      }
    };

    // Capture phase: fires before the widget's own handlers
    document.addEventListener("click", handleClickOutside, true);

    return () => {
      observer.disconnect();
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, [greeting, t]);

  return <div id="n8n-chat" />;
}