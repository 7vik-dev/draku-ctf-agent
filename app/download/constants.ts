const GITHUB_RELEASE_BASE =
  "https://github.com/draku-ctf-agent/draku-ctf-agent/releases/latest/download";

export const downloadLinks = {
  macos: `${GITHUB_RELEASE_BASE}/Draku-universal.dmg`,
  windows: `${GITHUB_RELEASE_BASE}/Draku-windows-x64.exe`,
  linuxAppImage: `${GITHUB_RELEASE_BASE}/Draku-linux-x64.AppImage`,
  linuxArm64AppImage: `${GITHUB_RELEASE_BASE}/Draku-linux-arm64.AppImage`,
  linuxDeb: `${GITHUB_RELEASE_BASE}/Draku-linux-x64.deb`,
  linuxArm64Deb: `${GITHUB_RELEASE_BASE}/Draku-linux-arm64.deb`,
};
