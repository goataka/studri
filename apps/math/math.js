const apps = [
  {
    href: "division/",
    title: "3年生・わり算",
    description: "九九をつかったわり算や、あまりのある計算に挑戦しよう。",
    label: "小学3年生",
  },
];

const appList = document.getElementById("mathApps");

apps.forEach((app) => {
  const link = document.createElement("a");
  link.className = "app-card";
  link.href = app.href;

  const copy = document.createElement("span");
  copy.className = "app-copy";
  const title = document.createElement("strong");
  title.textContent = `🔢 ${app.title}`;
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
