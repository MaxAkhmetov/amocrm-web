# amoCRM integration plan

Короткий проектный ориентир для подключения формы сайта к amoCRM. Сырая справочная выгрузка лежит в `_codex_refs/amocrm/combined_all_text_files.md` и не должна попадать в коммиты.

## Current architecture

Текущий production-путь:

```text
GitHub Pages static site
  -> public Yandex Cloud Function URL
  -> Yandex Cloud Function, Node.js 22, entrypoint index.handler
  -> amoCRM API v4
```

Frontend не вызывает amoCRM API напрямую. Все секреты amoCRM хранятся только в environment variables Yandex Cloud Function.

Прежняя Cloudflare Pages Function в `functions/api/lead.js` оставлена как deprecated/reference, потому что сайт работает на GitHub Pages и не может использовать Cloudflare Pages Functions как локальный `/api/lead`.

## Frontend endpoint

Форма отправляет POST-запрос на URL из:

```js
const LEAD_API_URL = window.LEAD_API_URL || "TODO_YANDEX_FUNCTION_URL";
```

Пока URL не задан или равен `TODO_YANDEX_FUNCTION_URL`, frontend показывает честную ошибку и не показывает success.

После получения публичного URL Yandex Cloud Function его нужно задать во frontend:

```html
<script>
  window.LEAD_API_URL = "https://functions.yandexcloud.net/...";
</script>
```

Или заменить значение `TODO_YANDEX_FUNCTION_URL` в `js/script.js`.

## Final form mapping

Финальные поля формы:

- `name` - имя, required.
- `phone` - телефон, required.
- `companyName` - название компании, optional.
- `industry` - ниша компании, optional.
- `website` - сайт компании, optional.
- `pain` - что сейчас болит в продажах, optional.

Frontend payload:

```json
{
  "name": "",
  "phone": "",
  "companyName": "",
  "industry": "",
  "website": "",
  "pain": "",
  "utm_source": "",
  "utm_medium": "",
  "utm_campaign": "",
  "utm_content": "",
  "utm_term": "",
  "referrer": "",
  "landing_page": "",
  "timestamp": ""
}
```

UTM, referrer, landing_page и timestamp обязательно попадают в note сделки.

## Yandex Cloud env variables

Добавить в environment variables Yandex Cloud Function:

- `AMOCRM_BASE_URL` - `https://maksimpartner.amocrm.ru`
- `AMOCRM_ACCESS_TOKEN` - только в Yandex Cloud env, не в код, HTML, JS, README или документацию.
- `AMOCRM_PIPELINE_ID` - `4118389`
- `AMOCRM_STATUS_ID` - `43070671`
- `AMOCRM_RESPONSIBLE_USER_ID` - `6391603`
- `AMOCRM_CONTACT_WEBSITE_FIELD_ID` - `327399`
- `AMOCRM_COMPANY_WEBSITE_FIELD_ID` - `103951`

`AMOCRM_ACCESS_TOKEN` нельзя хранить в репозитории.

## Website mapping

- Если `companyName` заполнено, функция создает компанию и записывает `website` в поле компании `AMOCRM_COMPANY_WEBSITE_FIELD_ID`.
- Если `companyName` не заполнено, функция не создает компанию и записывает `website` в поле контакта `AMOCRM_CONTACT_WEBSITE_FIELD_ID`.
- Если `website` пустой, функция не отправляет сайт ни в контакт, ни в компанию.
- Перед отправкой в amoCRM website без протокола нормализуется: `ilma.pro` -> `https://ilma.pro`.
- В note сайт остается частью блока "Компания и ниша", но пустые значения не добавляются.

## Yandex Cloud Function

Файл функции:

```text
serverless/yandex-lead-function/index.js
```

Runtime:

- Node.js 22
- Entry point: `index.handler`
- Timeout: 10 sec
- Memory: 256 MB

Функция:

- принимает `POST`;
- обрабатывает `OPTIONS` preflight;
- поддерживает CORS только для `https://ilma.pro` и `https://www.ilma.pro`;
- не использует `Access-Control-Allow-Origin: *`;
- валидирует JSON;
- проверяет обязательные поля `name` и `phone`;
- читает amoCRM-настройки только из env variables;
- не логирует полный payload пользователя;
- не возвращает токены или технические секреты в response;
- возвращает success только после успешного amoCRM flow.

## amoCRM flow

Текущая логика Yandex Function:

1. Создает контакт через `POST /api/v4/contacts`.
   - `contact.name = name`
   - телефон записывается в `custom_fields_values` через `field_code: PHONE`, `enum_code: WORK`
   - если `website` заполнен и `companyName` не заполнено, сайт записывается в контактное поле `AMOCRM_CONTACT_WEBSITE_FIELD_ID`
2. Создает компанию через `POST /api/v4/companies`, только если заполнен `companyName`.
   - если `website` заполнен, сайт записывается в поле компании `AMOCRM_COMPANY_WEBSITE_FIELD_ID`
   - сайт без протокола нормализуется до URL с `https://`
3. Создает сделку через `POST /api/v4/leads`.
   - `pipeline_id = AMOCRM_PIPELINE_ID`
   - `status_id = AMOCRM_STATUS_ID`
   - `responsible_user_id = AMOCRM_RESPONSIBLE_USER_ID`
   - если `industry` заполнено, `lead.name = "Заявка с ilma.pro - {industry}"`
   - иначе `lead.name = "Заявка с ilma.pro - amoCRM"`
4. Связывает сделку с контактом.
5. Если компания создана, связывает сделку с компанией.
6. Добавляет note к сделке через `POST /api/v4/leads/{lead_id}/notes`.

## Note content

В note записываются:

- Имя
- Телефон
- Название компании
- Ниша компании
- Сайт компании
- Что болит в продажах
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- `utm_term`
- `referrer`
- `landing_page`
- `timestamp`

UTM в custom fields пока не пишем, чтобы не ломать создание сделки без подтвержденных field IDs. Гарантированный источник UTM-контекста - note.

## Error handling

Yandex Function должна возвращать честную ошибку, если:

- origin не разрешен;
- метод не `POST` или `OPTIONS`;
- body не JSON;
- отсутствуют `name` или `phone`;
- отсутствуют env variables;
- amoCRM вернула ошибку на любом обязательном шаге.

Frontend показывает success только если backend вернул:

```json
{ "success": true }
```

## TODO

- Вставить публичный URL Yandex Function во frontend вместо `TODO_YANDEX_FUNCTION_URL` или задать `window.LEAD_API_URL`.
- Добавить `AMOCRM_ACCESS_TOKEN` только в Yandex Cloud environment variables.
- Проверить реальную заявку с `https://ilma.pro`.
- Убедиться, что контакт, компания, сделка, связи и note создаются в amoCRM.
- После проверки решить, нужны ли UTM custom fields в сделке.
- Добавить антиспам: Turnstile, rate limit или серверную защиту.
