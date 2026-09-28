import { partnerProvisioningUrl } from "../provisioning";

it.each([
  "https://draku.dev",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://[::1]:3000",
])("supports verified HTTPS or local web origins: %s", (base) => {
  expect(partnerProvisioningUrl(base).toString()).toBe(
    `${base}/api/internal/influencers/partners`,
  );
});
it.each([
  "http://draku.co",
  "https://user:password@draku.co",
  "file:///tmp/test",
  "http://localhost.evil.example",
  "ftp://draku.co",
])("does not transmit credentials to unsafe base %s", (base) => {
  expect(() => partnerProvisioningUrl(base)).toThrow();
});
