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
