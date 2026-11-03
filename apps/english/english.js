const apps = [
  {
    href: "phonics/",
    title: "フォニックス",
    description: "英語の文字と音のつながりを、ゲーム感覚で練習しよう。",
    label: "英語",
  },
];

const appList = document.getElementById("englishApps");

apps.forEach((app) => {
  const link = document.createElement("a");
  link.className = "app-card";
  link.href = app.href;

  const copy = document.createElement("span");
  copy.className = "app-copy";
  const title = document.createElement("strong");
  title.textContent = `🔤 ${app.title}`;
  const description = document.createElement("small");
  description.textContent = `${app.label}｜${app.description}`;
  copy.append(title, description);

  const arrow = document.createElement("span");
  arrow.className = "app-arrow";
  arrow.setAttribute("aria-hidden", "true");
  arrow.textContent = "→";
  link.append(copy, arrow);
  appList.append(link);
});
