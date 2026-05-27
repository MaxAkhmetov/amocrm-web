const seoArchitecture = {
  layers: [
    {
      id: "federal",
      label: "Федеральный слой",
      intent: "Общие коммерческие запросы без привязки к городу",
      routePattern: "/{serviceSlug}/"
    },
    {
      id: "city",
      label: "Городской слой",
      intent: "Запросы вида «внедрение amoCRM в [город]»",
      routePattern: "/{citySlug}/"
    },
    {
      id: "city_niche",
      label: "Город + ниша",
      intent: "Запросы вида «amoCRM для [ниша] в [город]»",
      routePattern: "/{citySlug}/{nicheSlug}/"
    },
    {
      id: "city_pain",
      label: "Город + боль",
      intent: "Запросы по потере заявок, контролю менеджеров, аналитике и автоматизации в городе",
      routePattern: "/{citySlug}/{painSlug}/"
    }
  ],
  federalRoutes: [
    { slug: "", outputPath: "index.html", label: "Главная" },
    { slug: "services", outputPath: "services/index.html", label: "Услуги" },
    { slug: "services/amocrm-implementation", outputPath: "services/amocrm-implementation/index.html", label: "Внедрение amoCRM" },
    { slug: "services/amocrm-audit", outputPath: "services/amocrm-audit/index.html", label: "Аудит amoCRM" },
    { slug: "services/amocrm-integration", outputPath: "services/amocrm-integration/index.html", label: "Интеграции amoCRM" },
    { slug: "services/amocrm-automation", outputPath: "services/amocrm-automation/index.html", label: "Автоматизация amoCRM" },
    { slug: "services/crm-for-sales-control", outputPath: "services/crm-for-sales-control/index.html", label: "CRM для контроля продаж" },
    { slug: "prices", outputPath: "prices/index.html", label: "Цены" },
    { slug: "cases", outputPath: "cases/index.html", label: "Кейсы" },
    { slug: "faq", outputPath: "faq/index.html", label: "FAQ" },
    { slug: "contacts", outputPath: "contacts/index.html", label: "Контакты" }
  ],
  cities: [
    {
      slug: "moskva",
      name: "Москва",
      prepositional: "Москве",
      businessExamples: ["услуги", "ремонт", "медицина", "образование", "B2B-продажи"],
      localPains: ["дорогие лиды из рекламы", "много менеджеров и просрочек", "сложно сравнивать источники"]
    },
    {
      slug: "spb",
      name: "Санкт-Петербург",
      prepositional: "Санкт-Петербурге",
      businessExamples: ["сервисные компании", "клиники", "ремонт", "мебель", "образование"],
      localPains: ["заявки из разных районов", "несколько филиалов", "потери после первичного обращения"]
    },
    {
      slug: "kazan",
      name: "Казань",
      prepositional: "Казани",
      businessExamples: ["локальные услуги", "строительство", "медицина", "курсы", "торговля"],
      localPains: ["рост входящих заявок", "хаос в мессенджерах", "нет понятного контроля рекламы"]
    },
    {
      slug: "ekaterinburg",
      name: "Екатеринбург",
      prepositional: "Екатеринбурге",
      businessExamples: ["B2B", "ремонт", "сервис", "мебель", "обучение"],
      localPains: ["длинные сделки", "забытые повторные касания", "непонятные причины отказов"]
    },
    {
      slug: "novosibirsk",
      name: "Новосибирск",
      prepositional: "Новосибирске",
      businessExamples: ["услуги", "опт", "выездной сервис", "ремонт", "медицина"],
      localPains: ["распределение заявок", "контроль задач", "разрозненные каналы связи"]
    }
  ],
  niches: [
    {
      slug: "amocrm-dlya-okonnyh-kompaniy",
      name: "оконные компании",
      genitive: "оконных компаний",
      scenario: "замер, КП, согласование, оплата и выполнение работ",
      uniquePain: "заявки из рекламы и звонков быстро остывают, если замер не назначен вовремя"
    },
    {
      slug: "amocrm-dlya-remonta",
      name: "ремонт и отделка",
      genitive: "ремонта и отделки",
      scenario: "заявка, расчет, смета, договор, оплата и этапы работ",
      uniquePain: "сложно контролировать длинный путь от обращения до договора"
    },
    {
      slug: "amocrm-dlya-stomatologii",
      name: "стоматологии",
      genitive: "стоматологий",
      scenario: "обращение, запись, консультация, план лечения и повторный визит",
      uniquePain: "администраторы теряют повторные касания после первичной консультации"
    },
    {
      slug: "amocrm-dlya-obrazovaniya",
      name: "образование и курсы",
      genitive: "образовательных центров",
      scenario: "заявка, консультация, пробное занятие, оплата и продление",
      uniquePain: "источники заявок есть, но не видно, какие группы и курсы дают деньги"
    },
    {
      slug: "amocrm-dlya-mebelnyh-kompaniy",
      name: "мебельные компании",
      genitive: "мебельных компаний",
      scenario: "замер, расчет, дизайн-проект, договор, производство и монтаж",
      uniquePain: "много сделок зависает после расчета без понятной причины"
    }
  ],
  painPoints: [
    {
      slug: "zayavki-teryayutsya",
      name: "заявки теряются",
      intent: "как не терять заявки из сайта, звонков и мессенджеров",
      uniqueAngle: "единый входящий поток и обязательный следующий шаг"
    },
    {
      slug: "kontrol-menedzherov",
      name: "контроль менеджеров",
      intent: "как видеть просрочки, забытые сделки и работу менеджеров",
      uniqueAngle: "задачи, сроки, причины отказов и отчет собственника"
    },
    {
      slug: "utm-analitika-v-crm",
      name: "UTM-аналитика в CRM",
      intent: "как связать рекламу, UTM и продажи в amoCRM",
      uniqueAngle: "источник заявки сохраняется до сделки и оплаты"
    },
    {
      slug: "avtomatizaciya-zadach",
      name: "автоматизация задач",
      intent: "как не забывать перезвоны и следующие шаги",
      uniqueAngle: "автозадачи менеджерам и контроль просрочек"
    },
    {
      slug: "integraciya-saita-s-amocrm",
      name: "интеграция сайта с amoCRM",
      intent: "как передавать заявки с сайта в amoCRM",
      uniqueAngle: "формы, источники, UTM и ответственный в одной сделке"
    }
  ],
  integrations: [
    {
      slug: "whatsapp",
      name: "WhatsApp",
      scenario: "переписка и заявки фиксируются в карточке сделки"
    },
    {
      slug: "telegram",
      name: "Telegram",
      scenario: "обращения из Telegram попадают в CRM и получают ответственного"
    },
    {
      slug: "telefoniya",
      name: "телефония",
      scenario: "звонки, пропущенные и записи связаны со сделками"
    },
    {
      slug: "yandex-direct",
      name: "Яндекс Директ",
      scenario: "UTM-метки и заявки из рекламы доходят до отчетов по продажам"
    }
  ],
  antiDuplicateRequirements: [
    "uniqueIntent",
    "title",
    "description",
    "hero.h1",
    "hero.lead",
    "sections.problemsTitle",
    "data.pains",
    "data.faq",
    "relatedLinks"
  ]
};

module.exports = { seoArchitecture };
