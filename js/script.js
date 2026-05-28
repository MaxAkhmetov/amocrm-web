(function () {
  var UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
  var STORAGE_KEY = "graf_poryadkov_utm";
  var LEAD_API_URL = window.LEAD_API_URL || "https://functions.yandexcloud.net/d4e9csenibv3gfmm6sjb";

  var navToggle = document.querySelector(".nav-toggle");
  var navMenu = document.querySelector("#nav-menu");
  var leadForm = document.querySelector("#lead-form");
  var statusNode = document.querySelector("#form-status");
  var countedNodes = new WeakSet();

  function initRevealAnimations() {
    var animatedItems = Array.prototype.slice.call(document.querySelectorAll("[data-animate]"));

    if (animatedItems.length === 0) {
      return;
    }

    if (!("IntersectionObserver" in window)) {
      animatedItems.forEach(function (item) {
        item.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: "0px 0px -8% 0px",
      threshold: 0.14
    });

    animatedItems.forEach(function (item) {
      observer.observe(item);
    });
  }

  function animateCounter(node) {
    if (countedNodes.has(node)) {
      return;
    }

    var target = Number(node.getAttribute("data-counter"));
    if (!Number.isFinite(target)) {
      return;
    }

    countedNodes.add(node);

    var duration = 1100;
    var start = performance.now();

    function tick(now) {
      var progress = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      node.textContent = String(Math.round(target * eased));

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        node.textContent = String(target);
      }
    }

    requestAnimationFrame(tick);
  }

  function initCounters() {
    var counterNodes = Array.prototype.slice.call(document.querySelectorAll("[data-counter]"));

    if (counterNodes.length === 0) {
      return;
    }

    if (!("IntersectionObserver" in window)) {
      counterNodes.forEach(animateCounter);
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.5
    });

    counterNodes.forEach(function (node) {
      observer.observe(node);
    });
  }

  function setFaqContentState(details, isOpen) {
    var content = details.querySelector("p");
    if (!content) {
      return;
    }

    if (isOpen) {
      details.open = true;
      content.style.height = "0px";
      content.style.opacity = "0";
      requestAnimationFrame(function () {
        content.style.height = content.scrollHeight + "px";
        content.style.opacity = "1";
      });
      window.setTimeout(function () {
        content.style.height = "auto";
      }, 290);
    } else {
      content.style.height = content.scrollHeight + "px";
      content.style.opacity = "1";
      requestAnimationFrame(function () {
        content.style.height = "0px";
        content.style.opacity = "0";
      });
      window.setTimeout(function () {
        details.open = false;
        content.style.height = "";
        content.style.opacity = "";
      }, 290);
    }
  }

  function initFaqAnimation() {
    var detailsNodes = Array.prototype.slice.call(document.querySelectorAll(".faq-list details"));

    detailsNodes.forEach(function (details) {
      var summary = details.querySelector("summary");
      var content = details.querySelector("p");

      if (!summary || !content) {
        return;
      }

      summary.addEventListener("click", function (event) {
        event.preventDefault();
        setFaqContentState(details, !details.open);
      });
    });
  }

  function getStoredAttribution() {
    try {
      return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY) || "{}");
    } catch (error) {
      return {};
    }
  }

  function saveAttribution(data) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      // Storage may be unavailable in private mode. The form still works with current page data.
    }
  }

  function collectAttribution() {
    var params = new URLSearchParams(window.location.search);
    var stored = getStoredAttribution();
    var attribution = {};
    var hasNewUtm = false;

    UTM_KEYS.forEach(function (key) {
      var value = params.get(key);
      if (value) {
        hasNewUtm = true;
        attribution[key] = value;
      } else if (stored[key]) {
        attribution[key] = stored[key];
      } else {
        attribution[key] = "";
      }
    });

    attribution.referrer = stored.referrer || document.referrer || "";
    attribution.landing_page = stored.landing_page || window.location.href;

    if (hasNewUtm || !stored.landing_page) {
      saveAttribution(attribution);
    }

    return attribution;
  }

  function fillHiddenFields(attribution) {
    if (!leadForm) {
      return;
    }

    UTM_KEYS.concat(["referrer", "landing_page"]).forEach(function (key) {
      var field = leadForm.elements[key];
      if (field) {
        field.value = attribution[key] || "";
      }
    });
  }

  function setFieldError(name, message) {
    var node = document.querySelector('[data-error-for="' + name + '"]');
    if (node) {
      node.textContent = message || "";
    }
  }

  function setStatus(message, type) {
    if (!statusNode) {
      return;
    }

    statusNode.textContent = message;
    statusNode.className = "form-status" + (type ? " " + type : "");
  }

  function validateForm(form) {
    var isValid = true;
    var name = form.elements.name.value.trim();
    var phone = form.elements.phone.value.trim();
    var website = form.elements.website.value.trim();

    setFieldError("name", "");
    setFieldError("phone", "");
    setFieldError("website", "");

    if (name.length < 2) {
      setFieldError("name", "Укажите имя, минимум 2 символа.");
      isValid = false;
    }

    if (!phone) {
      setFieldError("phone", "Укажите телефон.");
      isValid = false;
    }

    if (website) {
      try {
        new URL(website);
      } catch (error) {
        setFieldError("website", "Укажите сайт в формате https://example.ru.");
        isValid = false;
      }
    }

    return isValid;
  }

  function buildPayload(form) {
    var attribution = collectAttribution();
    var timestamp = new Date().toISOString();
    var payload = {
      name: form.elements.name.value.trim(),
      phone: form.elements.phone.value.trim(),
      companyName: form.elements.companyName.value.trim(),
      industry: form.elements.industry.value.trim(),
      website: form.elements.website.value.trim(),
      pain: form.elements.pain.value.trim(),
      utm_source: attribution.utm_source || "",
      utm_medium: attribution.utm_medium || "",
      utm_campaign: attribution.utm_campaign || "",
      utm_content: attribution.utm_content || "",
      utm_term: attribution.utm_term || "",
      referrer: attribution.referrer || "",
      landing_page: attribution.landing_page || window.location.href,
      timestamp: timestamp
    };

    if (form.elements.timestamp) {
      form.elements.timestamp.value = timestamp;
    }

    return payload;
  }

  async function submitLead(payload) {
    if (!LEAD_API_URL || LEAD_API_URL === "TODO_YANDEX_FUNCTION_URL") {
      throw new Error("Форма пока не подключена. Напишите напрямую в Telegram, WhatsApp или на info@ilma.pro.");
    }

    var response = await fetch(LEAD_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    var result = {};

    try {
      result = await response.json();
    } catch (error) {
      result = {};
    }

    if (!response.ok || result.success !== true) {
      throw new Error(result.message || "Lead endpoint request failed");
    }

    return result;
  }

  window.submitLead = submitLead;

  function initNavigation() {
    if (!navToggle || !navMenu) {
      return;
    }

    navToggle.addEventListener("click", function () {
      var isOpen = navMenu.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navMenu.addEventListener("click", function (event) {
      if (event.target.tagName === "A") {
        navMenu.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  function initLeadForm() {
    var attribution = collectAttribution();
    fillHiddenFields(attribution);

    if (!leadForm) {
      return;
    }

    leadForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      if (!validateForm(leadForm)) {
        setStatus("Проверьте обязательные поля формы.", "error");
        return;
      }

      var payload = buildPayload(leadForm);
      fillHiddenFields(payload);
      setStatus("Пытаюсь отправить заявку...", "");

      try {
        await submitLead(payload);
        setStatus("Заявка отправлена. Я свяжусь с вами и предложу короткий разбор продаж.", "success");
        leadForm.reset();
        fillHiddenFields(collectAttribution());
      } catch (error) {
        setStatus(error.message || "Не удалось отправить заявку. Напишите в Telegram, WhatsApp, на info@ilma.pro или позвоните: +7 903 158 00 51.", "error");
      }
    });
  }

  initNavigation();
  initLeadForm();
  initRevealAnimations();
  initCounters();
  initFaqAnimation();
})();
