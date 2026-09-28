import {
  canUseExtraUsage,
  canUseMaxModel,
  normalizeMaxModelForSubscription,
  normalizeSelectedModelForSubscription,
  normalizeSelectedModelOverrideForSubscription,
  withExtraUsageBillingForModel,
} from "../chat";

describe("normalizeSelectedModelForSubscription", () => {
  it("forces free users to auto even when a paid model is stored", () => {
    expect(normalizeSelectedModelForSubscription("draku-pro", "free")).toBe(
      "auto",
    );
    expect(normalizeSelectedModelForSubscription("draku-max", "free")).toBe(
      "auto",
    );
  });

  it("preserves paid users' selected model and defaults missing values to auto", () => {
    expect(normalizeSelectedModelForSubscription("draku-pro", "pro")).toBe(
      "draku-pro",
    );
    expect(normalizeSelectedModelForSubscription("draku-max", "ultra")).toBe(
      "draku-max",
    );
    expect(normalizeSelectedModelForSubscription(null, "ultra")).toBe("auto");
    expect(normalizeSelectedModelForSubscription(undefined, "team")).toBe(
      "auto",
    );
  });

  it("preserves paid Max until entitlement-aware routing", () => {
    expect(normalizeSelectedModelForSubscription("draku-max", "pro")).toBe(
      "draku-max",
    );
    expect(
      normalizeSelectedModelForSubscription("draku-max", "pro-plus"),
    ).toBe("draku-max");
    expect(normalizeSelectedModelForSubscription("draku-max", "team")).toBe(
      "draku-max",
    );
  });
});

describe("normalizeSelectedModelOverrideForSubscription", () => {
  it("forces free users to auto even when no override was sent", () => {
    expect(normalizeSelectedModelOverrideForSubscription(null, "free")).toBe(
      "auto",
    );
    expect(
      normalizeSelectedModelOverrideForSubscription(undefined, "free"),
    ).toBe("auto");
  });

  it("preserves missing paid overrides as undefined", () => {
    expect(
      normalizeSelectedModelOverrideForSubscription(undefined, "pro"),
    ).toBeUndefined();
    expect(
      normalizeSelectedModelOverrideForSubscription(null, "ultra"),
    ).toBeUndefined();
  });

  it("preserves explicit paid overrides until entitlement-aware routing", () => {
    expect(
      normalizeSelectedModelOverrideForSubscription("draku-max", "ultra"),
    ).toBe("draku-max");
    expect(
      normalizeSelectedModelOverrideForSubscription("draku-max", "team"),
    ).toBe("draku-max");
    expect(
      normalizeSelectedModelOverrideForSubscription("draku-pro", "team"),
    ).toBe("draku-pro");
  });
});

describe("Max model entitlement helpers", () => {
  it("allows Max for Ultra users", () => {
    expect(canUseMaxModel("ultra")).toBe(true);
  });

  it("allows Max for paid users with usable extra usage", () => {
    const extraUsageConfig = {
      enabled: true,
      hasBalance: true,
      balanceDollars: 10,
      autoReloadEnabled: false,
    };

    expect(canUseExtraUsage(extraUsageConfig)).toBe(true);
    expect(canUseMaxModel("pro", { extraUsageConfig })).toBe(true);
    expect(
      normalizeMaxModelForSubscription("draku-max", "pro", {
        extraUsageConfig,
      }),
    ).toBe("draku-max");
  });

  it("downgrades Max for paid users without usable extra usage", () => {
    expect(canUseMaxModel("pro")).toBe(false);
    expect(normalizeMaxModelForSubscription("draku-max", "pro")).toBe(
      "draku-pro",
    );
    expect(
      normalizeMaxModelForSubscription("draku-max", "pro-plus", {
        extraUsageConfig: {
          enabled: true,
          hasBalance: true,
          balanceDollars: 10,
          autoReloadEnabled: false,
          monthlyRemainingDollars: 0,
        },
      }),
    ).toBe("draku-pro");
  });

  it("bills Max entirely through Extra Usage outside Ultra", () => {
    const extraUsageConfig = {
      enabled: true,
      hasBalance: true,
      autoReloadEnabled: false,
    };

    expect(
      withExtraUsageBillingForModel(
        extraUsageConfig,
        "draku-max",
        "pro-plus",
      ),
    ).toEqual({
      ...extraUsageConfig,
      chargeAllUsage: true,
    });
    expect(
      withExtraUsageBillingForModel(extraUsageConfig, "draku-max", "ultra"),
    ).toBe(extraUsageConfig);
    expect(
      withExtraUsageBillingForModel(
        extraUsageConfig,
        "draku-pro",
        "pro-plus",
      ),
    ).toBe(extraUsageConfig);
  });
});
