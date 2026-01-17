(function () {
  const tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;

  const urlParams = new URLSearchParams(window.location.search);
  const chatId = urlParams.get("chatId") || "";

  if (tg) {
    tg.ready();
    tg.expand();
  }

  async function post(path, payload) {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res;
  }

  // notify opened (server -> admin)
  post("/api/opened", {
    initData: tg ? tg.initData : "",
    chatId: chatId || undefined,
  }).catch(() => {});

  const form = document.querySelector("form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const color = document.getElementById("color")?.value || "";
    const animal = document.getElementById("animal")?.value || "";

    // Optional: show Telegram native progress
    try { tg?.MainButton?.hide(); } catch {}

    const btn = form.querySelector("button[type=submit]");
    const prevText = btn ? btn.textContent : "";
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Отправка...";
    }

    try {
      const r = await post("/api/submit", {
        initData: tg ? tg.initData : "",
        chatId: chatId || undefined,
        color,
        animal,
      });
      if (!r.ok) throw new Error("submit_failed");
      // close webapp after successful send (Telegram only)
      try { tg?.close(); } catch {}
    } catch (err) {
      alert("Не удалось отправить. Проверьте подключение и попробуйте ещё раз.");
      if (btn) {
        btn.disabled = false;
        btn.textContent = prevText || "Отправить";
      }
    }
  });
})();
