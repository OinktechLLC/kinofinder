// KinoFinder player.js
// Логика: одновременно (асинхронно) запускаем загрузку двух источников
// и показываем тот, который первым успешно отдал плеер.
// Если у тебя другие параметры embed-URL для kinoboxtv.tatnet.app / kinoplayertop.tatnet.app —
// поправь шаблоны в SOURCES ниже, больше ничего менять не нужно.

const SOURCES = {
  kinobox: {
    label: "KinoBox TV",
    // Подставляются {imdb_id}, {kp_id}, {title}, {year}
    buildUrl: ({ imdbId, kpId }) => {
      const base = "https://kinoboxtv.tatnet.app/embed/#";
      const params = new URLSearchParams();
      if (imdbId) params.set("imdb_id", imdbId);
      if (kpId) params.set("kp_id", kpId);
  },
  kinoplayertop: {
    label: "KinoPlayer Top",
    buildUrl: ({ imdbId, kpId }) => {
      const base = "https://kinoplayertop.tatnet.app/embed/#";
      const params = new URLSearchParams();
      if (imdbId) params.set("imdb_id", imdbId);
      if (kpId) params.set("kinopoisk_id", kpId);
  },
};

const RACE_TIMEOUT_MS = 9000;

function qs(name) {
  return new URLSearchParams(location.search).get(name);
}

function init() {
  const data = {
    source: qs("source") || "",
    imdbId: qs("imdb_id") || "",
    kpId: qs("kp_id") || "",
    title: qs("title") || "",
    year: qs("year") || "",
  };

  document.getElementById("kf-movie-title").textContent =
    data.title + (data.year ? ` (${data.year})` : "");

  const frames = {
    kinobox: document.getElementById("kf-frame-kinobox"),
    kinoplayertop: document.getElementById("kf-frame-kinoplayertop"),
  };
  const buttons = {
    kinobox: document.querySelector('.kf-source-btn[data-src="kinobox"]'),
    kinoplayertop: document.querySelector(
      '.kf-source-btn[data-src="kinoplayertop"]'
    ),
  };

  const statusEl = document.getElementById("kf-status");
  const statusText = document.getElementById("kf-status-text");

  let resolved = false;
  let loadedCount = 0;
  const loadedKeys = [];

  function showSource(key) {
    Object.keys(frames).forEach((k) => {
      frames[k].classList.toggle("kf-visible", k === key);
      buttons[k].classList.toggle("kf-active", k === key);
    });
    statusEl.classList.add("kf-hidden");
  }

  function markReady(key) {
    buttons[key].classList.add("kf-ready");
  }

  function onFrameLoad(key) {
    loadedCount += 1;
    loadedKeys.push(key);
    markReady(key);

    if (!resolved) {
      resolved = true;
      showSource(key);
    }
  }

  Object.keys(SOURCES).forEach((key) => {
    const frame = frames[key];
    frame.addEventListener("load", () => onFrameLoad(key), { once: false });
    frame.addEventListener("error", () => {
      buttons[key].disabled = true;
      buttons[key].textContent = SOURCES[key].label + " (недоступен)";
    });
  });

  // запускаем загрузку обоих источников "одновременно"
  Object.keys(SOURCES).forEach((key) => {
    const url = SOURCES[key].buildUrl(data);
    frames[key].src = url;
  });

  // переключение вручную после того как источник готов
  Object.keys(buttons).forEach((key) => {
    buttons[key].addEventListener("click", () => {
      if (!buttons[key].classList.contains("kf-ready")) return;
      showSource(key);
    });
  });

  // если за разумное время ни один источник не отдал load — покажем первый
  // загрузившийся (в т.ч. с ошибкой контента) либо предложим открыть вручную
  setTimeout(() => {
    if (resolved) return;
    if (loadedKeys.length > 0) {
      resolved = true;
      showSource(loadedKeys[0]);
      return;
    }
    statusText.innerHTML =
      'Не получилось автоматически найти плеер. ' +
      'Попробуй выбрать источник вручную сверху, когда кнопка станет активной, ' +
      'либо проверь соединение.';
    statusEl.classList.add("kf-error");
  }, RACE_TIMEOUT_MS);
}

document.addEventListener("DOMContentLoaded", init);
