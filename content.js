(function () {
  const appIdMatch = window.location.href.match(/\/app\/(\d+)/);
  if (!appIdMatch) return;

  const appId = appIdMatch[1];

  chrome.runtime.sendMessage(
    { action: "fetchSteamDB", appId },
    (response) => {
      const container = document.createElement("div");
      container.style.padding = "10px";
      container.style.background = "#222";
      container.style.color = "#0f0";
      container.style.fontWeight = "bold";
      container.style.borderRadius = "6px";
      container.style.marginTop = "10px";

      if (!response.success || /451/.test(response.error)) {
        const link = document.createElement("a");
        link.href = `https://steamdb.info/app/${appId}/`;
        link.target = "_blank";
        link.textContent = "🌐 View lowest recorded price on SteamDB";
        link.style.color = "#0af";
        container.textContent = "SteamDB is not accessible due to legal restrictions. ";
        container.appendChild(link);
      } else {
        container.textContent = `🤑 Lowest recorded price on SteamDB: ${response.lowestPrice}`;
      }

      const insertAfter = document.querySelector(".apphub_AppName");
      if (insertAfter) {
        insertAfter.after(container);
      }
    }
  );
})();
