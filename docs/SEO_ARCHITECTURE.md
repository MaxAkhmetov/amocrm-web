# SEO-архитектура ilma.pro

Проект остается статическим: итоговые страницы генерируются в HTML без React, Next.js, Vite, Tailwind и тяжелых зависимостей.

amoCRM - не главная всего домена, а одно сервисное направление внутри будущей B2B-платформы ilma.pro.

## Целевая структура

- `/` - будущая главная бренда ilma.pro.
- `/services/` - каталог направлений.
- `/services/amocrm/` - страница услуги внедрения amoCRM.
- `/services/operational-efficiency/` - операционная эффективность.
- `/services/ai-automation/` - AI-автоматизация без hype-подачи.
- `/services/digitalization/` - цифровизация процессов.
- `/blog/` - материалы.
- `/cases/` - кейсы.

Сейчас amoCRM-страница временно генерируется в `index.html` для быстрой публикации, но в данных имеет `targetOutputPath: services/amocrm/index.html`.

## Service-first SEO-слои

1. `service_page`: `/services/{service}/`
2. `service_city`: `/services/{service}/{city}/`
3. `service_city_niche`: `/services/{service}/{city}/{niche}/`
4. `service_city_pain`: `/services/{service}/{city}/{pain-point}/`

Примеры будущих URL:

- `/services/amocrm/`
- `/services/amocrm/moskva/`
- `/services/amocrm/moskva/okonnye-kompanii/`
- `/services/amocrm/moskva/poterya-zayavok/`

## Где лежат данные

- `src/data/site.js` - платформа ilma.pro: бренд, контакты, общая навигация.
- `src/data/services.js` - сервисные направления.
- `src/data/amocrm.js` - контент страницы услуги amoCRM.
- `src/data/seo-architecture.js` - маршруты, города, ниши, боли, интеграции и антидубль-требования.
- `src/data/page-factories.js` - фабрики активной amoCRM-страницы и будущих SEO-страниц.
- `src/data/pages.js` - активные страницы для генерации и черновики будущих страниц.

## Где лежат шаблоны

- `src/templates/layout.js` - общий HTML layout, platform header, service strip, SEO, Open Graph.
- `src/templates/sections.js` - переиспользуемые секции услуги.
- `src/templates/schemas.js` - JSON-LD: ProfessionalService, FAQPage, BreadcrumbList.
- `src/templates/helpers.js` - экранирование HTML, JSON-LD, относительные пути к CSS/JS.

## Как добавлять страницы позже

Новая активная страница добавляется в массив `pages` в `src/data/pages.js`.

Для будущих SEO-страниц использовать фабрики:

- `createServiceCityPageDraft(service, city)`
- `createServiceCityNichePageDraft(service, city, niche)`
- `createServiceCityPainPageDraft(service, city, painPoint)`

Черновик нельзя публиковать как готовую страницу. Его нужно наполнить уникальными блоками: первые абзацы, боли, примеры, FAQ, CTA, внутренние ссылки, schema.

## Как избегать дублей

Нельзя выпускать страницу, где заменен только город или ниша.

Для каждой SEO-страницы должны быть уникальны:

- `serviceId`
- `uniqueIntent`
- `title`
- `description`
- `hero.h1`
- `hero.lead`
- первые смысловые абзацы
- список болей
- FAQ
- внутренние ссылки
- примеры сценариев внедрения
- блок "что настроим именно здесь"

Скрипт `scripts/build-site.js` запускает проверки из `src/lib/seo-validation.js`.

## Сборка

```powershell
node scripts\build-site.js
```

Сейчас генерируется только `index.html`. Черновики будущих страниц проверяются как архитектурные данные, но HTML-файлы для них пока не создаются.
