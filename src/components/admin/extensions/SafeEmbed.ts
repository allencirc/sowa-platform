/**
 * SafeEmbed Tiptap node.
 *
 * Stores an embed as a structured node — `{provider, url, embedUrl, id, title}` —
 * rather than raw HTML. On render, emits a sandboxed iframe whose `src` is
 * always a provider-controlled embed endpoint (see @/lib/safe-embed).
 *
 * Paste-handling deliberately re-parses incoming URLs through the allowlist,
 * so a user pasting a YouTube link gets an embed but a random iframe HTML
 * blob does not survive the trip through Tiptap's schema.
 */

import { Node, mergeAttributes } from "@tiptap/core";
import {
  EMBED_IFRAME_SANDBOX,
  EMBED_PROVIDER_LABELS,
  type EmbedProvider,
  type ParsedEmbed,
  parseEmbedUrl,
} from "@/lib/safe-embed";

export interface SafeEmbedAttributes {
  provider: EmbedProvider | null;
  url: string | null;
  embedUrl: string | null;
  embedId: string | null;
  title: string | null;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    safeEmbed: {
      /**
       * Insert a SafeEmbed node by URL. Returns false (no-op) if the URL is
       * not in the provider allowlist.
       */
      insertSafeEmbed: (url: string, title?: string) => ReturnType;
    };
  }
}

export const SafeEmbed = Node.create({
  name: "safeEmbed",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      provider: { default: null as EmbedProvider | null },
      url: { default: null as string | null },
      embedUrl: { default: null as string | null },
      embedId: { default: null as string | null },
      title: { default: null as string | null },
    };
  },

  parseHTML() {
    // Only match our own serialised marker tag. Raw `<iframe>` tags in pasted
    // HTML are intentionally ignored — the paste handler below re-resolves URLs.
    return [
      {
        tag: "div[data-safe-embed]",
        getAttrs: (el) => {
          if (!(el instanceof HTMLElement)) return false;
          const url = el.getAttribute("data-url") || "";
          const parsed = parseEmbedUrl(url);
          if (!parsed) return false;
          return {
            provider: parsed.provider,
            url: parsed.url,
            embedUrl: parsed.embedUrl,
            embedId: parsed.id,
            title: el.getAttribute("data-title"),
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    const attrs = node.attrs as SafeEmbedAttributes;

    // Defensive: if somehow the node lost its provider or url, render nothing
    // rather than an unsafe iframe.
    if (!attrs.provider || !attrs.url || !attrs.embedUrl) {
      return ["div", { "data-safe-embed": "invalid" }, ""];
    }

    const providerLabel = EMBED_PROVIDER_LABELS[attrs.provider];
    const iframeTitle = attrs.title || `${providerLabel} embed`;

    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-safe-embed": attrs.provider,
        "data-url": attrs.url,
        "data-embed-id": attrs.embedId || "",
        "data-title": attrs.title || "",
        class: "safe-embed safe-embed--" + attrs.provider,
      }),
      [
        "iframe",
        {
          src: attrs.embedUrl,
          title: iframeTitle,
          loading: "lazy",
          referrerpolicy: "strict-origin-when-cross-origin",
          sandbox: EMBED_IFRAME_SANDBOX,
          allowfullscreen: "true",
          frameborder: "0",
          width: "100%",
          height: "400",
        },
      ],
    ];
  },

  addCommands() {
    return {
      insertSafeEmbed:
        (url: string, title?: string) =>
        ({ commands }) => {
          const parsed = parseEmbedUrl(url);
          if (!parsed) return false;
          return commands.insertContent({
            type: this.name,
            attrs: toAttrs(parsed, title),
          });
        },
    };
  },
});

function toAttrs(
  parsed: ParsedEmbed,
  title?: string,
): SafeEmbedAttributes {
  return {
    provider: parsed.provider,
    url: parsed.url,
    embedUrl: parsed.embedUrl,
    embedId: parsed.id,
    title: title || null,
  };
}
