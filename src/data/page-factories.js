const { site } = require("./site");

function withSharedData(overrides = {}) {
  return {
    pains: overrides.pains || site.pains,
    solutionSteps: overrides.solutionSteps || site.solutionSteps,
    setupItems: overrides.setupItems || site.setupItems,
    industries: overrides.industries || site.industries,
    packages: overrides.packages || site.packages,
    result: overrides.result || site.result,
    processSteps: overrides.processSteps || site.processSteps,
    why: overrides.why || site.why,
    faq: overrides.faq || site.faq
  };
}

function createHomePage() {
  return {
    type: "home",
    layer: "federal",
    uniqueIntent: "Быстрое внедрение amoCRM как системы контроля заявок, менеджеров, источников и потерь денег для собственника.",
    outputPath: "index.html",
    canonical: site.urls.canonical,
    ogUrl: site.urls.ogUrl,
    ogImage: site.urls.ogImage,
    title: "Внедрение amoCRM за 2-3 дня - настройка CRM для контроля продаж",
    description: "Настрою amoCRM для малого бизнеса: заявки из сайта, звонков, WhatsApp, Telegram и рекламы, задачи менеджерам, контроль просрочек, источники и отчеты собственника.",
    ogDescription: "Заявки, менеджеры, просрочки, источники и потери денег под контролем собственника.",
    hero: {
      eyebrow: "Порядок в продажах за дни, не месяцы",
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
      leadMagnetTitle: "Получите чек-лист: 25 ошибок в amoCRM, из-за которых теряются заявки",
      leadMagnetText: "Оставьте контакты - отправлю чек-лист и предложу короткий разбор вашей схемы продаж.",
      faqTitle: "Частые вопросы",
      finalCtaTitle: "Хотите понять, где сейчас теряются заявки?",
      finalCtaText: "Оставьте заявку - разберу вашу текущую схему продаж и покажу, что нужно настроить в amoCRM в первую очередь."
    },
    data: withSharedData(),
    relatedLinks: []
  };
}

function createCityPageDraft(city) {
  return {
    type: "city",
    layer: "city",
    city: city.slug,
    outputPath: `${city.slug}/index.html`,
    uniqueIntent: `Внедрение amoCRM в городе ${city.name} с акцентом на локальные источники заявок и контроль менеджеров.`,
    title: `Внедрение amoCRM в ${city.prepositional} - контроль заявок и менеджеров`,
    description: `Настройка amoCRM для бизнеса в ${city.prepositional}: заявки, источники, задачи менеджерам, просрочки и отчет собственника.`,
    hero: {
      h1: `Внедрение amoCRM в ${city.prepositional}: заявки и менеджеры под контролем`,
      lead: `Настраиваю amoCRM для компаний в ${city.prepositional} с учетом локальных источников заявок, рекламы, мессенджеров и типовых просрочек отдела продаж.`
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

function createCityNichePageDraft(city, niche) {
  return {
    type: "city_niche",
    layer: "city_niche",
    city: city.slug,
    niche: niche.slug,
    outputPath: `${city.slug}/${niche.slug}/index.html`,
    uniqueIntent: `amoCRM для ${niche.genitive} в ${city.prepositional}: ${niche.scenario}.`,
    title: `amoCRM для ${niche.genitive} в ${city.prepositional} - внедрение CRM`,
    description: `Настройка amoCRM для ${niche.genitive} в ${city.prepositional}: заявки, этапы, задачи, причины отказов и аналитика источников.`,
    hero: {
      h1: `amoCRM для ${niche.genitive} в ${city.prepositional}`,
      lead: `Собираю CRM под сценарий: ${niche.scenario}. Отдельный фокус - ${niche.uniquePain}.`
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

function createCityPainPageDraft(city, painPoint) {
  return {
    type: "city_pain",
    layer: "city_pain",
    city: city.slug,
    painPoint: painPoint.slug,
    outputPath: `${city.slug}/${painPoint.slug}/index.html`,
    uniqueIntent: `${painPoint.intent} в ${city.prepositional}.`,
    title: `${painPoint.name} в ${city.prepositional} - настройка amoCRM`,
    description: `Помогу решить проблему «${painPoint.name}» в amoCRM для бизнеса в ${city.prepositional}: задачи, источники, контроль и отчет собственника.`,
    hero: {
      h1: `${painPoint.name}: настройка amoCRM для бизнеса в ${city.prepositional}`,
      lead: `Страница должна раскрывать не общую услугу, а конкретный сценарий: ${painPoint.uniqueAngle}.`
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
  createCityNichePageDraft,
  createCityPainPageDraft,
  createCityPageDraft,
  createHomePage,
  withSharedData
};
