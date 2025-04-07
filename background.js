// Add a listener to modify headers for SteamDB requests
chrome.webRequest.onBeforeSendHeaders.addListener(
  function (details) {
    const headers = details.requestHeaders;

    const hasUA = headers.some((h) => h.name.toLowerCase() === "user-agent");
    if (!hasUA) {
      headers.push({
        name: "User-Agent",
        value:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
      });
    }

    return { requestHeaders: headers };
  },
  { urls: ["https://steamdb.info/*"] },
  ["blocking", "requestHeaders"]
);

// Regular fetch logic
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "fetchSteamDB") {
    const steamdbUrl = `https://steamdb.info/app/${message.appId}/`;

    fetch(steamdbUrl)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.text();
      })
      .then((html) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        let price = "Price not found";
        const rows = doc.querySelectorAll("table.table-sales tbody tr");
        for (let row of rows) {
          const label = row.querySelector("td:first-child");
          if (label && /lowest recorded price/i.test(label.textContent)) {
            const valueCell = row.querySelector("td:nth-child(2)");
            if (valueCell) {
              price = valueCell.textContent.trim();
              break;
            }
          }
        }

        sendResponse({ success: true, lowestPrice: price });
      })
      .catch((err) => {
        console.error("Error fetching SteamDB:", err);
        sendResponse({ success: false, error: err.message });
      });

    return true;
  }
});
