const ALLOWED_ORIGINS = new Set([
  "https://ilma.pro",
  "https://www.ilma.pro"
]);

const MAX_FIELD_LENGTH = 1200;
const REQUIRED_ENV = [
  "AMOCRM_BASE_URL",
  "AMOCRM_ACCESS_TOKEN",
  "AMOCRM_PIPELINE_ID",
  "AMOCRM_STATUS_ID",
  "AMOCRM_RESPONSIBLE_USER_ID",
  "AMOCRM_CONTACT_WEBSITE_FIELD_ID"
];

const FALLBACK_MESSAGE = "Не удалось отправить заявку. Напишите напрямую в Telegram, WhatsApp или на info@ilma.pro.";

function getHeader(headers, name) {
  if (!headers) {
    return "";
  }

  const targetName = name.toLowerCase();
  const foundKey = Object.keys(headers).find((key) => key.toLowerCase() === targetName);
  const value = foundKey ? headers[foundKey] : "";

  if (Array.isArray(value)) {
    return value[0] || "";
  }

  return typeof value === "string" ? value : String(value || "");
}

function normalizeOrigin(origin) {
  return normalizeText(origin).replace(/\/+$/, "");
}

function getRequestOrigin(event) {
  return normalizeOrigin(getHeader(event.headers, "origin"));
}

function getMethod(event) {
  return event.httpMethod || event.requestContext?.http?.method || "GET";
}

function isAllowedOrigin(origin) {
  return ALLOWED_ORIGINS.has(normalizeOrigin(origin));
}

function buildCorsHeaders(origin) {
  const normalizedOrigin = normalizeOrigin(origin);

  if (!isAllowedOrigin(normalizedOrigin)) {
    return {
      "Vary": "Origin"
    };
  }

  return {
    "Access-Control-Allow-Origin": normalizedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin"
  };
}

function originDebug(origin) {
  return {
    receivedOrigin: origin || "",
    allowedOrigins: Array.from(ALLOWED_ORIGINS)
  };
}

function jsonResponse(statusCode, body, origin) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...buildCorsHeaders(origin)
    },
    body: JSON.stringify(body)
  };
}

function emptyResponse(statusCode, origin) {
  return {
    statusCode,
    headers: {
      "Cache-Control": "no-store",
      ...buildCorsHeaders(origin)
    },
    body: ""
  };
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

function getMissingEnv() {
  return REQUIRED_ENV.filter((key) => !normalizeText(process.env[key]));
}

function envNumber(key) {
  const value = Number(process.env[key]);
  return Number.isFinite(value) ? value : null;
}

function getPhoneNationalDigits(value) {
  let digits = String(value || "").replace(/\D/g, "");

  if (digits.charAt(0) === "7" || digits.charAt(0) === "8") {
    digits = digits.slice(1);
  }

  return digits.slice(0, 10);
}

function normalizePhone(value) {
  const digits = getPhoneNationalDigits(value);
  return digits.length === 10 ? "+7" + digits : "";
}

function formatPhone(value) {
  const digits = getPhoneNationalDigits(value);

  if (digits.length !== 10) {
    return normalizeText(value);
  }

  return "+7 (" + digits.slice(0, 3) + ") " + digits.slice(3, 6) + " " + digits.slice(6, 8) + " " + digits.slice(8, 10);
}

function parseBody(event) {
  if (!event.body) {
    return {
      error: "EMPTY_BODY"
    };
  }

  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body, "base64").toString("utf8")
    : event.body;

  try {
    return {
      payload: JSON.parse(rawBody)
    };
  } catch (error) {
    return {
      error: "INVALID_JSON"
    };
  }
}

function normalizePayload(payload) {
  const source = payload && typeof payload === "object" ? payload : {};

  return {
    name: normalizeText(source.name),
    phone: normalizePhone(source.phone),
    phoneFormatted: formatPhone(source.phoneFormatted || source.phone),
    companyName: normalizeText(source.companyName),
    industry: normalizeText(source.industry),
    website: normalizeText(source.website),
    pain: normalizeText(source.pain),
    utm_source: normalizeText(source.utm_source),
    utm_medium: normalizeText(source.utm_medium),
    utm_campaign: normalizeText(source.utm_campaign),
    utm_content: normalizeText(source.utm_content),
    utm_term: normalizeText(source.utm_term),
    referrer: normalizeText(source.referrer),
    landing_page: normalizeText(source.landing_page),
    timestamp: normalizeText(source.timestamp)
  };
}

function validatePayload(payload) {
  const errors = {};

  if (payload.name.length < 2) {
    errors.name = "Укажите имя, минимум 2 символа.";
  }

  if (!payload.phone) {
    errors.phone = "Укажите телефон в формате +7 (999) 999 99 99.";
  }

  return errors;
}

async function amoRequest(path, body) {
  const baseUrl = normalizeBaseUrl(process.env.AMOCRM_BASE_URL);
  const response = await fetch(baseUrl + path, {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + process.env.AMOCRM_ACCESS_TOKEN,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const text = await response.text();
  let data = null;

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
}

function extractCreatedId(data, collectionName) {
  if (Array.isArray(data) && data[0]?.id) {
    return data[0].id;
  }

  const collection = data?._embedded?.[collectionName];
  return Array.isArray(collection) && collection[0]?.id ? collection[0].id : null;
}

function buildContactBody(payload) {
  const customFields = [
    {
      field_code: "PHONE",
      values: [
        {
          value: payload.phone,
          enum_code: "WORK"
        }
      ]
    }
  ];

  if (payload.website) {
    customFields.push({
      field_id: envNumber("AMOCRM_CONTACT_WEBSITE_FIELD_ID"),
      values: [
        {
          value: payload.website
        }
      ]
    });
  }

  return [
    {
      name: payload.name,
      responsible_user_id: envNumber("AMOCRM_RESPONSIBLE_USER_ID"),
      custom_fields_values: customFields
    }
  ];
}

function buildLeadBody(payload) {
  return [
    {
      name: payload.industry
        ? "Заявка с ilma.pro - " + payload.industry
        : "Заявка с ilma.pro - amoCRM",
      pipeline_id: envNumber("AMOCRM_PIPELINE_ID"),
      status_id: envNumber("AMOCRM_STATUS_ID"),
      responsible_user_id: envNumber("AMOCRM_RESPONSIBLE_USER_ID")
    }
  ];
}

function buildNoteText(payload) {
  return [
    "Заявка с ilma.pro",
    "",
    "Имя: " + payload.name,
    "Телефон: " + (payload.phoneFormatted || payload.phone),
    "Телефон для amoCRM: " + payload.phone,
    "Название компании: " + (payload.companyName || "-"),
    "Ниша компании: " + (payload.industry || "-"),
    "Сайт компании: " + (payload.website || "-"),
    "Что болит в продажах: " + (payload.pain || "-"),
    "",
    "utm_source: " + (payload.utm_source || "-"),
    "utm_medium: " + (payload.utm_medium || "-"),
    "utm_campaign: " + (payload.utm_campaign || "-"),
    "utm_content: " + (payload.utm_content || "-"),
    "utm_term: " + (payload.utm_term || "-"),
    "referrer: " + (payload.referrer || "-"),
    "landing_page: " + (payload.landing_page || "-"),
    "timestamp: " + (payload.timestamp || "-")
  ].join("\n");
}

async function linkEntityToLead(leadId, entityType, entityId) {
  return amoRequest("/api/v4/leads/" + leadId + "/link", [
    {
      to_entity_id: entityId,
      to_entity_type: entityType
    }
  ]);
}

async function createAmoLead(payload) {
  const contactResult = await amoRequest("/api/v4/contacts", buildContactBody(payload));

  if (!contactResult.ok) {
    return {
      ok: false,
      step: "contact",
      status: contactResult.status,
      data: contactResult.data
    };
  }

  const contactId = extractCreatedId(contactResult.data, "contacts");

  if (!contactId) {
    return {
      ok: false,
      step: "contact_id",
      status: 502,
      data: contactResult.data
    };
  }

  let companyId = null;

  if (payload.companyName) {
    const companyResult = await amoRequest("/api/v4/companies", [
      {
        name: payload.companyName,
        responsible_user_id: envNumber("AMOCRM_RESPONSIBLE_USER_ID")
      }
    ]);

    if (!companyResult.ok) {
      return {
        ok: false,
        step: "company",
        status: companyResult.status,
        data: companyResult.data
      };
    }

    companyId = extractCreatedId(companyResult.data, "companies");

    if (!companyId) {
      return {
        ok: false,
        step: "company_id",
        status: 502,
        data: companyResult.data
      };
    }
  }

  const leadResult = await amoRequest("/api/v4/leads", buildLeadBody(payload));

  if (!leadResult.ok) {
    return {
      ok: false,
      step: "lead",
      status: leadResult.status,
      data: leadResult.data
    };
  }

  const leadId = extractCreatedId(leadResult.data, "leads");

  if (!leadId) {
    return {
      ok: false,
      step: "lead_id",
      status: 502,
      data: leadResult.data
    };
  }

  const contactLinkResult = await linkEntityToLead(leadId, "contacts", contactId);

  if (!contactLinkResult.ok) {
    return {
      ok: false,
      step: "contact_link",
      status: contactLinkResult.status,
      data: contactLinkResult.data
    };
  }

  if (companyId) {
    const companyLinkResult = await linkEntityToLead(leadId, "companies", companyId);

    if (!companyLinkResult.ok) {
      return {
        ok: false,
        step: "company_link",
        status: companyLinkResult.status,
        data: companyLinkResult.data
      };
    }
  }

  const noteResult = await amoRequest("/api/v4/leads/" + leadId + "/notes", [
    {
      note_type: "common",
      params: {
        text: buildNoteText(payload)
      }
    }
  ]);

  if (!noteResult.ok) {
    return {
      ok: false,
      step: "note",
      status: noteResult.status,
      data: noteResult.data
    };
  }

  return {
    ok: true,
    leadId,
    contactId,
    companyId
  };
}

exports.handler = async (event) => {
  const requestId = createRequestId();
  const origin = getRequestOrigin(event);
  const method = getMethod(event);

  if (method === "OPTIONS") {
    return isAllowedOrigin(origin)
      ? emptyResponse(204, origin)
      : jsonResponse(403, {
        success: false,
        message: "Origin is not allowed.",
        requestId,
        ...originDebug(origin)
      }, origin);
  }

  if (!isAllowedOrigin(origin)) {
    return jsonResponse(403, {
      success: false,
      message: "Origin is not allowed.",
      requestId,
      ...originDebug(origin)
    }, origin);
  }

  if (method !== "POST") {
    return jsonResponse(405, {
      success: false,
      message: "Метод не поддерживается.",
      requestId
    }, origin);
  }

  const contentType = getHeader(event.headers, "content-type");

  if (!contentType.toLowerCase().includes("application/json")) {
    return jsonResponse(415, {
      success: false,
      message: "Некорректный формат запроса.",
      requestId
    }, origin);
  }

  const missingEnv = getMissingEnv();

  if (missingEnv.length > 0) {
    console.error("Lead function configuration missing", {
      requestId,
      missingEnv
    });

    return jsonResponse(503, {
      success: false,
      message: "Форма пока не подключена. Напишите напрямую в Telegram, WhatsApp или на info@ilma.pro.",
      requestId
    }, origin);
  }

  const parsed = parseBody(event);

  if (parsed.error) {
    return jsonResponse(400, {
      success: false,
      message: "Некорректные данные формы.",
      requestId
    }, origin);
  }

  const payload = normalizePayload(parsed.payload);
  const validationErrors = validatePayload(payload);

  if (Object.keys(validationErrors).length > 0) {
    return jsonResponse(400, {
      success: false,
      message: "Проверьте обязательные поля формы.",
      errors: validationErrors,
      requestId
    }, origin);
  }

  try {
    const result = await createAmoLead(payload);

    if (!result.ok) {
      console.error("amoCRM lead flow failed", {
        requestId,
        step: result.step,
        status: result.status,
        response: result.data
      });

      return jsonResponse(502, {
        success: false,
        message: FALLBACK_MESSAGE,
        requestId
      }, origin);
    }

    return jsonResponse(200, {
      success: true,
      leadId: result.leadId,
      requestId
    }, origin);
  } catch (error) {
    console.error("Unexpected lead function error", {
      requestId,
      message: error && error.message ? error.message : "Unknown error"
    });

    return jsonResponse(500, {
      success: false,
      message: FALLBACK_MESSAGE,
      requestId
    }, origin);
  }
};
