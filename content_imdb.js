// KinoFinder — content script for IMDb title pages
(function () {
  function getImdbId() {
    const m = location.pathname.match(/\/title\/(tt\d+)/);
    return m ? m[1] : null;
  }

  function getTitle() {
    const og = document.querySelector('meta[property="og:title"]');
    if (og && og.content) return og.content.replace(/\s*\(.*?\)\s*$/, "").trim();
    const h1 = document.querySelector('h1');
    if (h1) return h1.textContent.trim();
    return document.title.replace(/ - IMDb.*/i, "").trim();
  }

  function getYear() {
    const link = document.querySelector('a[href*="releaseinfo"]');
    if (link) {
      const m = link.textContent.match(/(\d{4})/);
      if (m) return m[1];
    }
    const m2 = document.title.match(/\((\d{4})\)/);
    return m2 ? m2[1] : "";
  }

  const imdbId = getImdbId();
  if (!imdbId) return; // не страница конкретного тайтла

  const btn = document.createElement("button");
  btn.id = "kinofinder-watch-btn";
  btn.type = "button";
  btn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
    <span>Смотреть онлайн</span>
  `;

  btn.addEventListener("click", () => {
    btn.classList.add("kf-loading");
    chrome.runtime.sendMessage(
      {
        type: "kf-open-player",
        payload: {
          source: "imdb",
          imdbId,
          title: getTitle(),
          year: getYear(),
        },
      },
      () => {
        btn.classList.remove("kf-loading");
      }
    );
  });

  document.documentElement.appendChild(btn);
})();
