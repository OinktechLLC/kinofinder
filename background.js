// KinoFinder background service worker (MV3)

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.type === "kf-open-player") {
    const p = msg.payload || {};
    const params = new URLSearchParams();
    if (p.source) params.set("source", p.source);
    if (p.imdbId) params.set("imdb_id", p.imdbId);
    if (p.kpId) params.set("kp_id", p.kpId);
    if (p.title) params.set("title", p.title);
    if (p.year) params.set("year", p.year);

    const url = chrome.runtime.getURL("player.html") + "?" + params.toString();

    chrome.windows.create(
      {
        url,
        type: "popup",
        width: 1000,
        height: 640,
        focused: true,
      },
      () => sendResponse({ ok: true })
    );

    return true; // async sendResponse
  }
});
