# Литотека

Публичная витрина React/Vite для Samotsvety API. Каталог и карточки читают `/api/v2/gem-entities`, статьи сохраняют отдельный контракт V1.

## Локальный запуск

```bash
npm install
cp .env.example .env
npm run dev
```

Для локальной разработки Vite проксирует `/api` на `API_PROXY_TARGET` (по умолчанию `http://localhost:8080`). Для другого публичного API укажите `VITE_API_BASE_URL`. Чтобы показывать фотографии, укажите `VITE_CDN_BASE_URL` равным публичному `YC_S3_PUBLIC_URL` backend. Значение должно быть общедоступным URL без секретов.

V2 отдаёт полный список; поиск, совместные фильтры, сортировка и пагинация выполняются в браузере. Снимки строятся из `images.storage_key` и путей изображения. Ошибка API отображается, перехода на V1 для каталога нет.

```bash
npm test
npm run build
```

Для ручной проверки данных, фотографий, связей и статей нужны запущенный backend, заполненная PostgreSQL и доступное публичное хранилище.


### Запуск из WSL
Если WSL подхватывает Windows npm, используйте локальный запуск:
```sh
sh scripts/npm-wsl.sh run dev
sh scripts/npm-wsl.sh test
sh scripts/npm-wsl.sh run build
```
Скрипт выбирает Linux Node из установленного nvm, не меняя глобальные настройки.
Каталог использует API v2 с page/limit/lang/q/rarity/base_color/country_code/letter.
Сначала обновите и перезапустите API; непагинированный контракт сохранён.


### CDN and article covers

Set `VITE_CDN_BASE_URL=https://lithoteka-cdn.storage.yandexcloud.net` for deployment
and local development. Restart Vite after changing environment variables.
Mineral paths are resolved centrally by `imageUrl` as
`{CDN_BASE}/entities/{storage_key}/images/{path}`; storage keys are never slugified.
Article media URLs (including historical absolute URLs) are used unchanged.

Cards request `/api/v1/posts/{slug}/cover-frames?lang=ru|en` within 200px of the
viewport. Requests, including empty/error results, are shared per slug/language
for this page session. Only the poster is loaded initially; hover preloads the
next frame and advances every 700ms once available, skipping broken frames.
Leaving the card stops playback and restores the poster. Touch/coarse pointers
and reduced-motion preferences disable playback. The article page uses the first
frame statically, falling back to `cover_image`; existing editorial slides remain
available if neither cover exists. Markdown images retain their supplied URLs.

No hardcoded old bucket URLs for shared site images were found in source/public.
Existing local shared assets remain unchanged; no unknown object names are assumed.

Manual API verification: inspect catalog thumbnails, mineral hero/gallery and
fullscreen viewer with a storage_key different from slug; check covers in RU/EN,
empty sequences, failed URLs, keyboard links, touch and reduced motion. Confirm
actual common_images object locations before replacing any local assets.

Older Article V2 posts without endpoint frames use their saved media.slides URLs
in the original order for hover playback. New endpoint frames always take priority.
