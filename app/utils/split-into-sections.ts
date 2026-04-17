// lib/htmlSections.ts
import { load } from "cheerio";
import type { AnyNode } from "domhandler";

export type HtmlSection = {
  heading?: string;
  headingId?: string;
  content: string;
};

// Use BODY innerHTML if present; otherwise use the full root HTML (no normalization)
function getInner(html: string): string {
  const $ = load(html ?? "");
  const body = $("body");
  return (body.length ? body.html() : $.root().html()) ?? "";
}

/**
 * If <a target="_self"> has rel that includes "nofollow", remove only "nofollow".
 * (Leaves other rel tokens like noopener/noreferrer intact.)
 */
export function stripNofollowForSelfTargets(html: string): string {
  const $ = load(html ?? "");

  $("a[target='_self']").each((_, el) => {
    const $a = $(el);
    const rel = ($a.attr("rel") ?? "").trim();
    if (!rel) return;

    const tokens = rel.split(/\s+/).filter(Boolean);
    const cleaned = tokens.filter((t) => t.toLowerCase() !== "nofollow");

    if (cleaned.length) $a.attr("rel", cleaned.join(" "));
    else $a.removeAttr("rel");
  });

  const body = $("body");
  return (body.length ? body.html() : $.root().html()) ?? "";
}

/** Split at each <h2>; create a first section for content before the first <h2>. */
export function splitIntoSectionsNoIntro(html: string): HtmlSection[] {
  // 1) keep markup as-is (no normalize step)
  const inner = getInner(html ?? "");

  // 2) cleanup nofollow when target="_self"
  const cleaned = stripNofollowForSelfTargets(inner);

  const $ = load(`<div id="__wrap">${cleaned}</div>`);
  const container = $("#__wrap");

  const sections: HtmlSection[] = [];
  const prelude: string[] = [];
  let cur = -1;

  for (const el of container.children().toArray()) {
    const $el = $(el as AnyNode);

    if ($el.is("h2")) {
      // if we had content before the first h2, make it its own section
      if (cur === -1 && prelude.length) {
        sections.push({ content: prelude.join("") });
        prelude.length = 0;
      }

      const heading = $el.text().trim() || "Section";
      const headingId = ($el.attr("id") || "").trim() || undefined;

      sections.push({ heading, headingId, content: "" });
      cur = sections.length - 1;
      continue;
    }

    const frag = $.html(el as AnyNode) ?? "";
    if (cur === -1) prelude.push(frag);
    else sections[cur].content += frag;
  }

  // no h2 at all => single section
  if (sections.length === 0) {
    const content = prelude.join("").trim();
    if (content) sections.push({ content });
  }

  return sections;
}
