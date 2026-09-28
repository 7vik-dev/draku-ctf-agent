import { resolvePendingInfluencerReferral } from "../pending-referral";

function browser(href = "https://draku.dev/?ref=medusa") {
  return {
    location: { href, replace: jest.fn() },
  } as unknown as Pick<Window, "location">;
}

describe("pending influencer consent", () => {
  it("leaves the pending URL untouched before a decision", () => {
    const tab = browser();
    resolvePendingInfluencerReferral(tab, null);
    expect(tab.location.replace).not.toHaveBeenCalled();
  });

  it("resumes through the validated short link after acceptance", () => {
    const tab = browser("https://draku.dev/?ref=Medusa");
    resolvePendingInfluencerReferral(tab, "accepted");
    expect(tab.location.replace).toHaveBeenCalledWith("/r/medusa");
  });

  it("discards only the pending code on rejection", () => {
    const tab = browser("https://draku.dev/?ref=medusa&utm_source=x#pricing");
    resolvePendingInfluencerReferral(tab, "declined");
    expect(tab.location.replace).toHaveBeenCalledWith(
      "https://draku.dev/?utm_source=x#pricing",
    );
  });

  it.each(["", "//evil.example", "../signup", "javascript:alert(1)"])(
    "removes empty or invalid codes on rejection: %s",
    (code) => {
      const tab = browser(
        `https://draku.dev/?ref=${encodeURIComponent(code)}`,
      );
      resolvePendingInfluencerReferral(tab, "declined");
      expect(tab.location.replace).toHaveBeenCalledWith("https://draku.dev/");
    },
  );

  it("keeps rejection cleanup on the current origin for double-slash paths", () => {
    const tab = browser("https://draku.dev//evil.example?ref=medusa");
    resolvePendingInfluencerReferral(tab, "declined");
    expect(tab.location.replace).toHaveBeenCalledWith(
      "https://draku.dev//evil.example",
    );
  });

  it.each([
    "",
    "?ref=",
    "?ref=//evil.example",
    "?ref=../signup",
    "?ref=javascript:alert(1)",
  ])(
    "never navigates for absent or invalid referral parameters: %s",
    (search) => {
      const tab = browser(`https://draku.dev/${search}`);
      resolvePendingInfluencerReferral(tab, "accepted");
      expect(tab.location.replace).not.toHaveBeenCalled();
    },
  );
});
