"use strict";

// 静的なアプリ用。学習記録の保存名に環境名を付ける。環境名は、ビルドが html の data-env に入れる
// 形：<環境名>:<アプリの保存名>。決まりは specs/environments.md の「データの分離」
(() => {
  const env = document.documentElement.dataset.env || "develop";

  function studriStorageKey(name) {
    const key = `${env}:${name}`;
    // 環境名を付ける前の本番の記録を、初めて開いたときに引き継ぐ。元の記録は消さない
    if (env === "production") {
      try {
        const legacy = localStorage.getItem(name);
        if (legacy !== null && localStorage.getItem(key) === null) localStorage.setItem(key, legacy);
      } catch {
        // 保存できない環境では引き継がない
      }
    }
    return key;
  }

  window.studriStorageKey = studriStorageKey;
})();
