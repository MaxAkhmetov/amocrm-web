const ALLOWED_ORIGINS = new Set([
  "https://ilma.pro",
  "https://www.ilma.pro"
]);

const MAX_FIELD_LENGTH = 1200;
const DEFAULT_OFFER_CODE = "main";
const OFFERS = {
  main: {
    label: "экспресс-разбор с главной страницы",
    tag: "main"
  },
  no_crm_loss_map: {
    label: "карта потерь заявок без CRM",
    tag: "offer:no_crm_loss_map"
  }
};
const REQUIRED_ENV = [
  "AMOCRM_BASE_URL",
  "AMOCRM_ACCESS_TOKEN",
  "AMOCRM_PIPELINE_ID",
  "AMOCRM_STATUS_ID",
  "AMOCRM_RESPONSIBLE_USER_ID",
  "AMOCRM_CONTACT_WEBSITE_FIELD_ID",
  "AMOCRM_COMPANY_WEBSITE_FIELD_ID"
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

function normalizeWebsiteUrl(value) {
  const website = normalizeText(value);

  if (!website) {
    return "";
  }

  return /^[a-z][a-z0-9+.-]*:\/\//i.test(website) ? website : "https://" + website;
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

function normalizeOffer(value) {
  const offer = normalizeText(value);
  return OFFERS[offer] ? offer : DEFAULT_OFFER_CODE;
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
    offer: normalizeOffer(source.offer),
    utm_source: normalizeText(source.utm_source),
    utm_medium: normalizeText(source.utm_medium),
    utm_campaign: normalizeText(source.utm_campaign),
    utm_content: normalizeText(source.utm_content),
    utm_term: normalizeText(source.utm_term),
    referrer: normalizeText(source.referrer),
    landing_page: normalizeText(source.landing_page),
    form_page: normalizeText(source.form_page),
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

  if (payload.website && !payload.companyName) {
    customFields.push({
      field_id: envNumber("AMOCRM_CONTACT_WEBSITE_FIELD_ID"),
      values: [
        {
          value: normalizeWebsiteUrl(payload.website)
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

function buildCompanyBody(payload) {
  const company = {
    name: payload.companyName,
    responsible_user_id: envNumber("AMOCRM_RESPONSIBLE_USER_ID")
  };

  if (payload.website) {
    company.custom_fields_values = [
      {
        field_id: envNumber("AMOCRM_COMPANY_WEBSITE_FIELD_ID"),
        values: [
          {
            value: normalizeWebsiteUrl(payload.website)
          }
        ]
      }
    ];
  }

  return [company];
}

function buildLeadBody(payload) {
  const offer = OFFERS[payload.offer] || OFFERS[DEFAULT_OFFER_CODE];

  return [
    {
      name: payload.industry
        ? "Заявка с ilma.pro - " + payload.industry
        : "Заявка с ilma.pro - amoCRM",
      pipeline_id: envNumber("AMOCRM_PIPELINE_ID"),
      status_id: envNumber("AMOCRM_STATUS_ID"),
      responsible_user_id: envNumber("AMOCRM_RESPONSIBLE_USER_ID"),
      tags_to_add: [
        {
          name: offer.tag
        }
      ]
    }
  ];
}

function noteValue(value) {
  if (value === null || value === undefined) {
    return "";
  }

  const text = String(value).trim();
  return text && text !== "-" ? text : "";
}

function noteLine(label, value) {
  const text = noteValue(value);
  return text ? label + ": " + text : "";
}

function sameNoteValue(first, second) {
  const left = noteValue(first).replace(/\/+$/, "");
  const right = noteValue(second).replace(/\/+$/, "");
  return left && right && left === right;
}

function noteSection(title, rows) {
  const filledRows = rows.filter(Boolean);
  return filledRows.length > 0 ? [title, ...filledRows].join("\n") : "";
}

function buildNoteText(payload) {
  const offer = OFFERS[payload.offer] || OFFERS[DEFAULT_OFFER_CODE];
  const formPage = payload.form_page || payload.landing_page;
  const utmRows = [
    noteLine("utm_source", payload.utm_source),
    noteLine("utm_medium", payload.utm_medium),
    noteLine("utm_campaign", payload.utm_campaign),
    noteLine("utm_content", payload.utm_content),
    noteLine("utm_term", payload.utm_term)
  ];

  return [
    "Заявка с ilma.pro",
    noteSection("Контакт", [
      noteLine("Имя", payload.name),
      noteLine("Телефон", payload.phoneFormatted || payload.phone)
    ]),
    noteSection("Оффер", [
      noteLine("Оффер формы", offer.label)
    ]),
    noteSection("Компания и ниша", [
      noteLine("Компания", payload.companyName),
      noteLine("Ниша", payload.industry),
      noteLine("Сайт", payload.website)
    ]),
    noteSection("Что болит", [
      noteLine("Что болит в продажах", payload.pain)
    ]),
    noteSection("Источник", [
      noteLine("Страница отправки", formPage),
      sameNoteValue(payload.landing_page, formPage) ? "" : noteLine("Первая страница входа", payload.landing_page),
      sameNoteValue(payload.referrer, formPage) ? "" : noteLine("referrer", payload.referrer),
      noteLine("timestamp", payload.timestamp)
    ]),
    noteSection("UTM", utmRows)
  ].filter(Boolean).join("\n\n");
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
    const companyResult = await amoRequest("/api/v4/companies", buildCompanyBody(payload));

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
