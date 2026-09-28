import { describe, expect, it } from "@jest/globals";

import {
  ORGANIZATION_JSON_LD,
  SOFTWARE_APPLICATION_JSON_LD,
  SITE_URL,
  WEBSITE_JSON_LD,
  canonicalMetadata,
  formatPublicPageDate,
} from "../site";
import { PRICING } from "@/lib/pricing/config";

describe("public site metadata", () => {
  it("builds self-referencing canonical paths against the site metadata base", () => {
    expect(SITE_URL).toBe("https://draku.dev");
    expect(canonicalMetadata("/product")).toEqual({
      alternates: { canonical: "/product" },
    });
    expect(formatPublicPageDate("2026-09-01")).toBe("September 1, 2026");
  });

  it.each([
    ["/", "https://draku.dev/?utm_source=chatgpt&utm_medium=referral"],
    ["/product", "https://draku.dev/product?ref=assistant"],
    ["/pricing", "https://draku.dev/pricing?trk=partner"],
    [
      "/download",
      "https://draku.dev/download?snoball_referral=campaign#desktop",
    ],
  ] as const)(
    "keeps the %s canonical clean for parameterized entry URLs",
    (path, entryUrl) => {
      const canonical = canonicalMetadata(path).alternates?.canonical;

      expect(canonical).toBe(path);
      expect(new URL(String(canonical), entryUrl).href).toBe(
        `${SITE_URL}${path}`,
      );
    },
  );

  it("publishes supported organization and software application entities", () => {
    expect(ORGANIZATION_JSON_LD).toMatchObject({
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": "https://draku.dev/#organization",
      name: "Draku",
      url: "https://draku.dev",
    });
    expect(WEBSITE_JSON_LD).toMatchObject({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": "https://draku.dev/#website",
      name: "Draku",
      url: "https://draku.dev",
      publisher: { "@id": "https://draku.dev/#organization" },
    });
    expect(SOFTWARE_APPLICATION_JSON_LD).toMatchObject({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "@id": "https://draku.dev/product#software-application",
      name: "Draku",
      url: "https://draku.dev/product",
      publisher: { "@id": "https://draku.dev/#organization" },
    });
    const expectedOffers = [
      ["Draku Free", "0"],
      ["Draku Pro", String(PRICING.pro.monthly)],
      ["Draku Pro+", String(PRICING["pro-plus"].monthly)],
      ["Draku Ultra", String(PRICING.ultra.monthly)],
      ["Draku Team (per seat)", String(PRICING.team.monthly)],
    ];

    for (const [name, price] of expectedOffers) {
      expect(SOFTWARE_APPLICATION_JSON_LD.offers).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            "@type": "Offer",
            name,
            price,
            priceCurrency: "USD",
          }),
        ]),
      );
    }
  });
});
