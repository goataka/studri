const apps = [
  {
    href: "kanji-g3/",
    title: "3年生の漢字",
    description: "3年生でならう200字の読みと書きを、10字ずつ練習しよう。",
    label: "国語",
  },
];

const appList = document.getElementById("japaneseApps");

apps.forEach((app) => {
  const link = document.createElement("a");
  link.className = "app-card";
  link.href = app.href;

  const copy = document.createElement("span");
  copy.className = "app-copy";
  const title = document.createElement("strong");
  title.textContent = `📖 ${app.title}`;
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
