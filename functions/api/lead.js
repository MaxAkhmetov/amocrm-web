const MAX_FIELD_LENGTH = 1200;
const REQUIRED_ENV = ["AMOCRM_BASE_URL", "AMOCRM_ACCESS_TOKEN"];
const OPTIONAL_NUMBER_ENV = ["AMOCRM_PIPELINE_ID", "AMOCRM_STATUS_ID", "AMOCRM_RESPONSIBLE_USER_ID"];

function jsonResponse(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

function createRequestId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return String(Date.now());
}

function normalizeText(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, MAX_FIELD_LENGTH);
}

function normalizeBaseUrl(value) {
  return normalizeText(value).replace(/\/+$/, "");
}

function getOptionalNumber(env, key) {
  var value = normalizeText(env[key]);

  if (!value) {
    return null;
  }

  var numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function getMissingEnv(env) {
  return REQUIRED_ENV.filter(function (key) {
    return !normalizeText(env[key]);
  });
}

async function readPayload(request) {
  var contentType = request.headers.get("content-type") || "";

  if (!contentType.toLowerCase().includes("application/json")) {
    return {
      error: "INVALID_CONTENT_TYPE"
    };
  }

  try {
    return {
      payload: await request.json()
    };
  } catch (error) {
    return {
      error: "INVALID_JSON"
    };
  }
}

function normalizePayload(payload) {
  var source = payload && typeof payload === "object" ? payload : {};
  var utm = source.utm && typeof source.utm === "object" ? source.utm : {};

  return {
    name: normalizeText(source.name),
    contact: normalizeText(source.contact),
    business: normalizeText(source.business),
    website: normalizeText(source.website),
    pain: normalizeText(source.pain),
    landing_page: normalizeText(source.landing_page || source.page),
    referrer: normalizeText(source.referrer),
    timestamp: normalizeText(source.timestamp),
    utm: {
      utm_source: normalizeText(source.utm_source || utm.utm_source),
      utm_medium: normalizeText(source.utm_medium || utm.utm_medium),
      utm_campaign: normalizeText(source.utm_campaign || utm.utm_campaign),
      utm_content: normalizeText(source.utm_content || utm.utm_content),
      utm_term: normalizeText(source.utm_term || utm.utm_term)
    }
  };
}

function validateLead(payload) {
  var errors = {};

  if (payload.name.length < 2) {
    errors.name = "Укажите имя, минимум 2 символа.";
  }

  if (!payload.contact) {
    errors.contact = "Укажите телефон или Telegram.";
  }

  if (payload.website) {
    try {
      new URL(payload.website);
    } catch (error) {
      errors.website = "Укажите сайт в формате https://example.ru.";
    }
  }

  return errors;
}

function buildLeadBody(payload, env) {
  var lead = {
    name: "Заявка с сайта: внедрение amoCRM",
    _embedded: {
      tags: [
        { name: "site" },
        { name: "amocrm" }
      ]
    }
  };

  OPTIONAL_NUMBER_ENV.forEach(function (key) {
    var value = getOptionalNumber(env, key);

    if (!value) {
      return;
    }

    if (key === "AMOCRM_PIPELINE_ID") {
      lead.pipeline_id = value;
    }

    if (key === "AMOCRM_STATUS_ID") {
      lead.status_id = value;
    }

    if (key === "AMOCRM_RESPONSIBLE_USER_ID") {
      lead.responsible_user_id = value;
    }
  });

  if (payload.business) {
    lead.name = "Заявка amoCRM: " + payload.business;
  }

  return [lead];
}

function buildNoteText(payload, requestId) {
  var lines = [
    "Заявка с сайта ilma.pro",
    "Request ID: " + requestId,
    "",
    "Имя: " + payload.name,
    "Контакт: " + payload.contact,
    "Бизнес: " + (payload.business || "-"),
    "Сайт: " + (payload.website || "-"),
    "Боль: " + (payload.pain || "-"),
    "",
    "Страница: " + (payload.landing_page || "-"),
    "Referrer: " + (payload.referrer || "-"),
    "Timestamp: " + (payload.timestamp || "-"),
    "",
    "UTM source: " + (payload.utm.utm_source || "-"),
    "UTM medium: " + (payload.utm.utm_medium || "-"),
    "UTM campaign: " + (payload.utm.utm_campaign || "-"),
    "UTM content: " + (payload.utm.utm_content || "-"),
    "UTM term: " + (payload.utm.utm_term || "-")
  ];

  return lines.join("\n");
}

function extractLeadId(data) {
  if (Array.isArray(data) && data[0] && data[0].id) {
    return data[0].id;
  }

  if (data && data._embedded && Array.isArray(data._embedded.leads) && data._embedded.leads[0]) {
    return data._embedded.leads[0].id;
  }

  return null;
}

async function callAmoCrm(path, body, env) {
  var baseUrl = normalizeBaseUrl(env.AMOCRM_BASE_URL);

  try {
    var response = await fetch(baseUrl + path, {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + env.AMOCRM_ACCESS_TOKEN,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    var data = null;
    var text = await response.text();

    if (text) {
      try {
        data = JSON.parse(text);
      } catch (error) {
        data = {
          raw: text.slice(0, 500)
        };
      }
    }

    return {
      ok: response.ok,
      status: response.status,
      data
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      data: {
        message: error && error.message ? error.message : "Network error"
      }
    };
  }
}

function getUserMessage(status) {
  if (status === 401 || status === 403) {
    return "Интеграция amoCRM требует проверки доступа. Напишите напрямую в Telegram или WhatsApp.";
  }

  if (status === 429) {
    return "amoCRM временно ограничила прием заявок. Напишите напрямую в Telegram или WhatsApp.";
  }

  return "Не удалось отправить заявку. Напишите напрямую в Telegram или WhatsApp.";
}

async function handleLeadRequest(context) {
  var requestId = createRequestId();
  var env = context.env || {};
  var missingEnv = getMissingEnv(env);

  if (missingEnv.length > 0) {
    console.error("Lead request configuration missing", {
      requestId,
      missingEnv
    });

    return jsonResponse({
      ok: false,
      code: "CONFIG_MISSING",
      message: "Отправка заявки пока не настроена. Напишите напрямую в Telegram или WhatsApp.",
      requestId
    }, 503);
  }

  var parsed = await readPayload(context.request);

  if (parsed.error === "INVALID_CONTENT_TYPE") {
    return jsonResponse({
      ok: false,
      code: "INVALID_CONTENT_TYPE",
      message: "Некорректный формат запроса.",
      requestId
    }, 415);
  }

  if (parsed.error === "INVALID_JSON") {
    return jsonResponse({
      ok: false,
      code: "INVALID_JSON",
      message: "Некорректные данные формы.",
      requestId
    }, 400);
  }

  var payload = normalizePayload(parsed.payload);
  var validationErrors = validateLead(payload);

  if (Object.keys(validationErrors).length > 0) {
    return jsonResponse({
      ok: false,
      code: "VALIDATION_ERROR",
      message: "Проверьте обязательные поля формы.",
      errors: validationErrors,
      requestId
    }, 400);
  }

  var leadResult = await callAmoCrm("/api/v4/leads", buildLeadBody(payload, env), env);

  if (!leadResult.ok) {
    console.error("amoCRM lead creation failed", {
      requestId,
      status: leadResult.status,
      response: leadResult.data
    });

    return jsonResponse({
      ok: false,
      code: "AMOCRM_LEAD_ERROR",
      message: getUserMessage(leadResult.status),
      requestId
    }, 502);
  }

  var leadId = extractLeadId(leadResult.data);

  if (!leadId) {
    console.error("amoCRM lead id missing", {
      requestId,
      response: leadResult.data
    });

    return jsonResponse({
      ok: false,
      code: "AMOCRM_LEAD_ID_MISSING",
      message: "Заявка не подтверждена amoCRM. Напишите напрямую в Telegram или WhatsApp.",
      requestId
    }, 502);
  }

  var noteBody = [
    {
      note_type: "common",
      params: {
        text: buildNoteText(payload, requestId)
      }
    }
  ];
  var noteResult = await callAmoCrm("/api/v4/leads/" + leadId + "/notes", noteBody, env);

  if (!noteResult.ok) {
    console.error("amoCRM note creation failed", {
      requestId,
      leadId,
      status: noteResult.status,
      response: noteResult.data
    });
  }

  return jsonResponse({
    ok: true,
    leadId,
    noteSaved: noteResult.ok,
    requestId
  }, 200);
}

export async function onRequest(context) {
  if (context.request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Allow": "POST, OPTIONS",
        "Cache-Control": "no-store"
      }
    });
  }

  if (context.request.method !== "POST") {
    return jsonResponse({
      ok: false,
      code: "METHOD_NOT_ALLOWED",
      message: "Метод не поддерживается."
    }, 405);
  }

  return handleLeadRequest(context);
}
