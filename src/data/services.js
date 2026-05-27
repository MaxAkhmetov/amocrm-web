const services = [
  {
    id: "amocrm",
    slug: "amocrm",
    name: "Внедрение amoCRM",
    serviceBrand: "Граф Порядков",
    serviceSubtitle: "amoCRM для собственников",
    shortMark: "ГП",
    targetPath: "services/amocrm/index.html",
    targetUrl: "/services/amocrm/",
    temporaryOutputPath: "index.html",
    description: "Настройка amoCRM как системы контроля заявок, менеджеров, источников и потерь денег"
  },
  {
    id: "operational-efficiency",
    slug: "operational-efficiency",
    name: "Операционная эффективность",
    targetUrl: "/services/operational-efficiency/",
    description: "Процессы, регламенты, контроль исполнения и снижение ручной работы"
  },
  {
    id: "ai-automation",
    slug: "ai-automation",
    name: "AI-автоматизация",
    targetUrl: "/services/ai-automation/",
    description: "Практичная автоматизация повторяемых задач без AI-hype и лишних обещаний"
  },
  {
    id: "digitalization",
    slug: "digitalization",
    name: "Цифровизация процессов",
    targetUrl: "/services/digitalization/",
    description: "Перевод рабочих процессов в управляемые цифровые системы"
  }
];

function getService(serviceId) {
  const service = services.find((item) => item.id === serviceId);

  if (!service) {
    throw new Error(`Unknown service: ${serviceId}`);
  }

  return service;
}

module.exports = { getService, services };
