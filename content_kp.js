// KinoFinder — content script for Kinopoisk film/series pages
(function () {
  function getKpId() {
    const m = location.pathname.match(/\/(film|series)\/(\d+)/);
    return m ? m[2] : null;
  }

  function getTitle() {
    const og = document.querySelector('meta[property="og:title"]');
    if (og && og.content) return og.content.trim();
    const h1 = document.querySelector('h1');
    if (h1) return h1.textContent.trim();
    return document.title.trim();
  }

  function getYear() {
    const yearLink = document.querySelector('a[href*="/lists/m_act%5Byear%5D/"]');
    if (yearLink) {
      const m = yearLink.textContent.match(/(\d{4})/);
      if (m) return m[1];
    }
    const m2 = document.title.match(/(\d{4})/);
    return m2 ? m2[1] : "";
  }

  const kpId = getKpId();
  if (!kpId) return;

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
          source: "kinopoisk",
          kpId,
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
