const { amocrm } = require("./amocrm");
const { getService } = require("./services");
const { site } = require("./site");

function absoluteUrl(path) {
  if (!site.urls.canonicalBase || site.urls.canonicalBase.startsWith("TODO")) {
    return path === "/" ? "TODO_CANONICAL_URL" : `TODO_CANONICAL_BASE_URL${path}`;
  }

  return new URL(path, site.urls.canonicalBase).toString();
}

function withServiceData(serviceData, overrides = {}) {
  return {
    heroMetrics: overrides.heroMetrics || serviceData.heroMetrics,
    heroBenefits: overrides.heroBenefits || serviceData.heroBenefits,
    pains: overrides.pains || serviceData.pains,
    solutionSteps: overrides.solutionSteps || serviceData.solutionSteps,
    setupItems: overrides.setupItems || serviceData.setupItems,
    industries: overrides.industries || serviceData.industries,
    packages: overrides.packages || serviceData.packages,
    result: overrides.result || serviceData.result,
    processSteps: overrides.processSteps || serviceData.processSteps,
    why: overrides.why || serviceData.why,
    faq: overrides.faq || serviceData.faq
  };
}

const amocrmFaq = [
  {
    question: "Чем внедрение amoCRM отличается от простой настройки?",
    answer: "Простая настройка меняет поля и воронки. Внедрение сначала разбирает процесс продаж, роли, задачи, источники заявок и контрольные точки."
  },
  {
    question: "Сколько занимает запуск?",
    answer: "Базовый запуск обычно занимает 2-3 дня. Если нужны сложные интеграции, сроки считаются отдельно."
  },
  {
    question: "Можно ли внедрять amoCRM, если заявок пока мало?",
    answer: "Да. Малый поток проще сразу поставить на правильные правила, чтобы не накапливать хаос перед ростом рекламы."
  },
  {
    question: "Можно ли подключить сайт, WhatsApp, Telegram и телефонию?",
    answer: "Да. Подключение зависит от сайта, телефонии и каналов связи. Обычно начинаем с форм, мессенджеров и задач менеджерам."
  },
  {
    question: "Что делать, если менеджеры не ведут CRM?",
    answer: "Нужно упростить правила, убрать лишние поля, настроить обязательные шаги и контроль просрочек. CRM должна помогать, а не мешать работе."
  },
  {
    question: "Можно ли начать с минимальной версии?",
    answer: "Да. Можно собрать одну воронку, базовые поля, задачи и источники заявок, а доработки добавлять после проверки на реальных сделках."
  },
  {
    question: "Что нужно подготовить до внедрения?",
    answer: "Доступ к amoCRM, список менеджеров, этапы продаж, источники заявок, текущие формы сайта и понимание, где сейчас теряются сделки."
  },
  {
    question: "Как понять, что amoCRM окупается?",
    answer: "Смотрите потери заявок, скорость ответа, просрочки, конверсию по этапам и источники денег. Если эти цифры стали видны и управляемы, CRM работает."
  },
  {
    question: "Можно ли доработать существующую amoCRM?",
    answer: "Да. Часто задача не во внедрении с нуля, а в разборе старой CRM, чистке лишнего и настройке понятной логики продаж."
  },
  {
    question: "Что будет после внедрения?",
    answer: "Проверим реальные сценарии, обучим команду, зафиксируем правила работы и при необходимости добавим сопровождение или доработки."
  }
];

function createHomePage() {
  return {
    type: "home",
    layer: "brand_homepage",
    serviceId: "platform",
    serviceName: "CRM-системы, процессы и AI-автоматизация",
    serviceBrand: site.brand.name,
    serviceSubtitle: site.brand.subtitle,
    serviceShortMark: site.brand.shortMark,
    uniqueIntent: "Брендовая главная ilma.pro для трех направлений: CRM-системы, операционный порядок и AI-автоматизация.",
    outputPath: "index.html",
    targetOutputPath: "index.html",
    targetUrl: "/",
    canonical: absoluteUrl("/"),
    ogUrl: absoluteUrl("/"),
    ogImage: site.urls.ogImage,
    title: "ilma.pro - CRM, процессы и AI-автоматизация для управляемых продаж",
    description: "Настройка CRM-систем, операционных процессов и AI-автоматизации: заявки, задачи, деньги, потери и контроль собственника без хаоса в Excel и мессенджерах.",
    ogDescription: "CRM-системы, операционные процессы и AI-автоматизация для бизнеса, которому нужен порядок в заявках, задачах, деньгах и ответственности.",
    breadcrumbs: [],
    hero: {
      eyebrow: "ilma.pro / системы управления",
      h1: "Системы управления продажами, процессами и AI",
      lead: "Настраиваю CRM, операционные процессы и автоматизацию так, чтобы собственник видел заявки, задачи, деньги и потери - без хаоса в Excel, мессенджерах и головах менеджеров.",
      primaryCta: "Получить разбор",
      primaryHref: "#lead",
      secondaryCta: "",
      secondaryHref: "",
      dashboardLabel: "Контроль бизнеса",
      dashboardTitle: "CRM, процессы, AI",
      note: "Три направления одной системы: CRM фиксирует заявки, процессы держат порядок, AI забирает повторяющуюся ручную работу."
    },
    sections: {
      problemsTitle: "Направления ilma.pro",
      directionsTitle: "Три уровня порядка в бизнесе",
      directionsText: "Можно начать с CRM, процессов или AI. Важно выбрать тот слой, где сейчас теряются заявки, задачи, деньги и ответственность.",
      principleTitle: "Сначала порядок, потом автоматизация",
      principleText: "Автоматизация не спасает хаос. Сначала фиксируем, где теряются заявки, задачи и деньги. Потом настраиваем CRM, процессы и AI так, чтобы система работала каждый день, а не только на презентации.",
      leadMagnetTitle: "Получите экспресс-разбор системы продаж и процессов",
      leadMagnetText: "За 45 минут покажу, где сейчас есть потери в заявках, задачах, ответственности и автоматизации - и какие проблемы можно закрыть в первую очередь.",
      faqTitle: "Частые вопросы",
      finalCtaTitle: "Хотите понять, с чего начать наведение порядка?",
      finalCtaText: "Оставьте заявку - разберу текущую схему и покажу, какой слой системы даст самый быстрый управленческий эффект."
    },
    data: {
      heroMetrics: [
        { label: "Направления", value: "3" },
        { label: "Фокус", value: "контроль", tone: "warning" },
        { label: "Первый шаг", value: "разбор", wide: true }
      ],
      heroBenefits: [
        "CRM для заявок и продаж",
        "Процессы для ответственности",
        "AI для повторяющихся задач"
      ],
      directions: [
        {
          title: "CRM-системы для заявок и продаж",
          text: "Собираю заявки, источники, задачи менеджеров, воронки, причины отказов и отчеты в одну управляемую CRM-систему.",
          status: "Доступно сейчас",
          href: "/services/amocrm/",
          available: true
        },
        {
          title: "Процессы и операционный порядок",
          text: "Разбираю, где бизнес теряет время, деньги и ответственность: роли, контрольные точки, отчетность и управленческий ритм.",
          status: "Скоро",
          href: "#",
          available: false
        },
        {
          title: "AI-автоматизация",
          text: "Проектирую AI-помощников и автоматизации для повторяющихся задач: заявки, контент, документы, анализ и контроль исполнения.",
          status: "Скоро",
          href: "#",
          available: false
        }
      ],
      pains: [
        {
          title: "Заявки и задачи расходятся по разным местам",
          text: "Часть информации остается в мессенджерах, часть в Excel, часть в памяти менеджеров. Собственник видит итог слишком поздно."
        },
        {
          title: "Процессы держатся на ручном контроле",
          text: "Роли, сроки и точки ответственности не зафиксированы, поэтому управление превращается в постоянные напоминания."
        },
        {
          title: "AI пытаются внедрить поверх хаоса",
          text: "Автоматизация работает только там, где понятны входящие данные, правила, ответственные и ожидаемый результат."
        }
      ],
      faq: [
        {
          question: "С чего начать: CRM, процессы или AI?",
          answer: "Сначала нужно найти главный источник потерь. Если теряются заявки - начинаем с CRM. Если непонятна ответственность - с процессов. Если много ручной рутины - с AI."
        },
        {
          question: "Подходит ли это малому бизнесу?",
          answer: "Да. Обычно именно малому бизнесу быстрее всего помогает порядок в заявках, задачах и ответственности."
        },
        {
          question: "Можно ли начать с короткого разбора?",
          answer: "Да. Экспресс-разбор нужен, чтобы быстро понять, где потери и какой первый шаг даст больше эффекта."
        },
        {
          question: "Что будет на экспресс-разборе?",
          answer: "Посмотрим источники заявок, текущий процесс продаж, контроль задач, роли и ручные операции. В конце получите понятный следующий шаг."
        },
        {
          question: "Обязательно ли уже иметь CRM?",
          answer: "Нет. Можно прийти с Excel, мессенджерами или текущей CRM. Важно увидеть реальную схему работы."
        },
        {
          question: "Можно ли потом перейти к внедрению amoCRM?",
          answer: "Да. Если после разбора станет понятно, что нужна CRM для продаж, можно перейти к отдельному внедрению amoCRM."
        }
      ]
    },
    form: {
      offer: "main",
      buttonText: "Получить экспресс-разбор"
    },
    footer: {
      hideVk: true
    },
    relatedLinksTitle: "",
    relatedLinks: []
  };
}

function createAmocrmServicePage() {
  const service = getService("amocrm");

  return {
    type: "service",
    layer: "service_page",
    serviceId: service.id,
    serviceName: service.name,
    serviceBrand: service.serviceBrand,
    serviceSubtitle: service.serviceSubtitle,
    serviceShortMark: service.shortMark,
    uniqueIntent: "Внедрение amoCRM как системы контроля заявок, менеджеров, источников и потерь денег для собственника.",
    outputPath: service.targetPath,
    targetOutputPath: service.targetPath,
    targetUrl: service.targetUrl,
    canonical: absoluteUrl(service.targetUrl),
    ogUrl: absoluteUrl(service.targetUrl),
    ogImage: site.urls.ogImage,
    title: "Внедрение amoCRM за 2-3 дня - настройка CRM для контроля продаж",
    description: "Настрою amoCRM для малого бизнеса: заявки из сайта, звонков, WhatsApp, Telegram и рекламы, задачи менеджерам, контроль просрочек, источники и отчеты собственника.",
    ogDescription: "Заявки, менеджеры, просрочки, источники и потери денег под контролем собственника.",
    breadcrumbs: [
      { label: site.brand.name, href: "/" },
      { label: "Услуги", href: "/services/" },
      { label: "Внедрение amoCRM", href: service.targetUrl }
    ],
    hero: {
      eyebrow: "",
      h1: "Внедрение amoCRM за 2-3 дня: заявки, менеджеры и потери денег под контролем",
      lead: "Настраиваю amoCRM так, чтобы собственник видел все заявки, источники, просрочки, задачи менеджеров и места, где бизнес теряет деньги. Без долгих внедрений и абстрактной автоматизации.",
      primaryCta: "Получить экспресс-разбор",
      secondaryCta: "Что будет настроено",
      note: "Для компаний, где заявки приходят из сайта, звонков, WhatsApp, Telegram, Авито, ВК и рекламы."
    },
    sections: {
      problemsTitle: "CRM уже есть или нужна, но порядок в продажах все равно не появился?",
      solutionTitle: "Я собираю amoCRM как систему контроля продаж, а не как набор полей",
      solutionText: "Сначала разбираю вашу реальную схему продаж: откуда приходят заявки, кто их обрабатывает, где менеджеры тормозят, какие этапы влияют на деньги. Потом настраиваю amoCRM так, чтобы каждый лид, задача, источник и отказ были видны собственнику.",
      setupTitle: "Что можно настроить уже на первом внедрении",
      setupNote: "Состав зависит от текущей ситуации: кому-то достаточно быстро собрать порядок, кому-то нужно связать сайт, рекламу, мессенджеры, телефонию и аналитику.",
      industriesTitle: "Лучше всего подходит бизнесам, где нельзя терять заявки",
      packagesTitle: "Пакеты внедрения",
      resultTitle: "Как выглядит результат",
      processTitle: "Как проходит внедрение",
      whyTitle: "Почему это можно сделать быстро",
      whyText: "Я работаю как бизнес-аналитик: сначала понимаю процесс и деньги, потом настраиваю инструмент. Поэтому не растягиваю базовое внедрение на недели там, где можно быстро собрать рабочую систему.",
      leadMagnetTitle: "Получите карту потерь заявок без CRM",
      leadMagnetText: "Оставьте контакты - отправлю чек-лист по точкам, где бизнес теряет заявки и деньги без CRM, и предложу короткий разбор вашей схемы продаж.",
      faqTitle: "Частые вопросы",
      finalCtaTitle: "Хотите понять, где сейчас теряются заявки?",
      finalCtaText: "Оставьте заявку - разберу вашу текущую схему продаж и покажу, что нужно настроить в amoCRM в первую очередь."
    },
    data: withServiceData(amocrm, { faq: amocrmFaq }),
    form: {
      offer: "no_crm_loss_map",
      buttonText: "Получить карту потерь и разбор"
    },
    relatedLinksTitle: "Куда развернется направление amoCRM",
    relatedLinks: [
      { label: "Аудит amoCRM", href: "/services/amocrm/audit/" },
      { label: "Интеграции amoCRM", href: "/services/amocrm/integrations/" },
      { label: "Автоматизация задач в amoCRM", href: "/services/amocrm/automation/" },
      { label: "amoCRM для Москвы", href: "/services/amocrm/moskva/" },
      { label: "amoCRM для оконных компаний", href: "/services/amocrm/moskva/okonnye-kompanii/" },
      { label: "Потеря заявок: диагностика", href: "/services/amocrm/moskva/poterya-zayavok/" }
    ]
  };
}

function createServiceCityPageDraft(service, city) {
  return {
    type: "service_city",
    layer: "service_city",
    serviceId: service.id,
    city: city.slug,
    outputPath: `services/${service.slug}/${city.slug}/index.html`,
    uniqueIntent: `${service.name} в городе ${city.name} с акцентом на локальные источники заявок и контроль менеджеров.`,
    title: `${service.name} в ${city.prepositional} - контроль заявок и менеджеров`,
    description: `Настройка ${service.name} для бизнеса в ${city.prepositional}: заявки, источники, задачи менеджерам, просрочки и отчет собственника.`,
    hero: {
      h1: `${service.name} в ${city.prepositional}: заявки и менеджеры под контролем`,
      lead: `Будущая страница должна раскрывать локальную схему продаж в ${city.prepositional}, а не копировать федеральную услугу.`
    },
    uniqueContentSlots: {
      localBusinessExamples: city.businessExamples,
      localPains: city.localPains,
      localFaq: [],
      localCases: [],
      relatedLinks: []
    }
  };
}

function createServiceCityNichePageDraft(service, city, niche) {
  return {
    type: "service_city_niche",
    layer: "service_city_niche",
    serviceId: service.id,
    city: city.slug,
    niche: niche.slug,
    outputPath: `services/${service.slug}/${city.slug}/${niche.slug}/index.html`,
    uniqueIntent: `${service.name} для ${niche.genitive} в ${city.prepositional}: ${niche.scenario}.`,
    title: `${service.name} для ${niche.genitive} в ${city.prepositional}`,
    description: `Настройка ${service.name} для ${niche.genitive} в ${city.prepositional}: заявки, этапы, задачи, причины отказов и аналитика источников.`,
    hero: {
      h1: `${service.name} для ${niche.genitive} в ${city.prepositional}`,
      lead: `Будущая страница должна раскрывать сценарий: ${niche.scenario}. Отдельный фокус - ${niche.uniquePain}.`
    },
    uniqueContentSlots: {
      nicheScenario: niche.scenario,
      nichePain: niche.uniquePain,
      cityExamples: city.businessExamples,
      localFaq: [],
      relatedLinks: []
    }
  };
}

function createServiceCityPainPageDraft(service, city, painPoint) {
  return {
    type: "service_city_pain",
    layer: "service_city_pain",
    serviceId: service.id,
    city: city.slug,
    painPoint: painPoint.slug,
    outputPath: `services/${service.slug}/${city.slug}/${painPoint.slug}/index.html`,
    uniqueIntent: `${painPoint.intent} в ${city.prepositional} через ${service.name}.`,
    title: `${painPoint.name} в ${city.prepositional} - ${service.name}`,
    description: `Помогу решить проблему «${painPoint.name}» через ${service.name} для бизнеса в ${city.prepositional}: задачи, источники, контроль и отчет собственника.`,
    hero: {
      h1: `${painPoint.name}: ${service.name} для бизнеса в ${city.prepositional}`,
      lead: `Будущая страница должна раскрывать конкретный сценарий: ${painPoint.uniqueAngle}.`
    },
    uniqueContentSlots: {
      painIntent: painPoint.intent,
      uniqueAngle: painPoint.uniqueAngle,
      localExamples: city.businessExamples,
      localFaq: [],
      relatedLinks: []
    }
  };
}

module.exports = {
  createHomePage,
  createAmocrmServicePage,
  createServiceCityNichePageDraft,
  createServiceCityPainPageDraft,
  createServiceCityPageDraft,
  withServiceData
};
