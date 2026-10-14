import { createContext, useContext, useState, useCallback } from 'react';

const STORAGE_KEY = 'samotsvety_lang';

// Статичные тексты интерфейса. Данные о минералах/статьях (i18n.ru / i18n.en) сюда
// не входят — они выбираются хелперами pickI18n()/pickField() ниже прямо из ответа API.
const STRINGS = {
  ru: {
    articles_empty: 'Статьи скоро появятся.',
    articles_no_matches: 'По вашему запросу статьи не найдены.',
    articles_language_empty: 'На этом языке пока нет статей.',
    article_not_found: 'Статья не найдена',
    home_sea_alt: 'Морской берег с галькой и оранжево-красным сердоликом среди камней.',
    home_ural_alt: 'Южный Урал в ясный день. На старом рюкзаке из грубой ткани цвета хаки лежит сросток желтоватых кристаллов с еловой веточкой.',
    home_tanzania_alt: 'Ночная Танзания: звёздное небо, костёр и старый Defender. На камне в переднем плане лежат сине-фиолетовые танзаниты.',
    home_gallery: 'Минеральные экспедиции',
    hero_slide: (number) => `Изображение ${number}`,
    hero_pause: 'Остановить смену изображений',
    hero_play: 'Продолжить смену изображений',
    home_hero_alt: 'Ночной лагерь с костром и оранжевой палаткой под северным сиянием. На переднем плане — гранит с кристаллами граната.',
    nav_home: 'Главная',
    sitemap_title: 'Карта сайта',
    credits_title: 'Авторство',
    footer_description: 'Камни, их свойства и истории.',
    pagination_label: 'Страницы каталога',
    page_label: (number) => `Страница ${number}`,
    close_filters: 'Закрыть фильтры',
    reset_filters: 'Сбросить фильтры',
    results_unavailable: 'Не удалось загрузить результаты',
    show_results: (count) => {
      const mod10 = count % 10, mod100 = count % 100;
      const noun = mod10 === 1 && mod100 !== 11 ? 'камень' : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14) ? 'камня' : 'камней';
      return `Показать ${count} ${noun}`;
    },
    description_title: 'Описание',
    characteristics_title: 'Характеристики',
    contents_title: 'Содержание',
    care_title: 'Уход и предосторожности',
    composition_group: 'Состав и классификация',
    physical_group: 'Физические свойства',
    optical_group: 'Оптические свойства',

    nav_catalog: 'Каталог',
    nav_articles: 'Статьи',
    site_tag: 'тестовая витрина · данные из API',

    catalog_title: 'Каталог камней',
    catalog_count: (count) => {
      const mod10 = count % 10, mod100 = count % 100;
      const noun = mod10 === 1 && mod100 !== 11 ? 'камень' : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14) ? 'камня' : 'камней';
      return `${count} ${noun} в каталоге`;
    },
    results_count: (count) => `Найдено: ${count}`,
    catalog_desc: 'Рабочая витрина для проверки наполнения — тянет данные напрямую из Samotsvety API.',
    search_placeholder: 'Найти камень по названию или свойствам…',
    rarity_any: 'Любая редкость',
    rarity_common: 'Обычный',
    rarity_uncommon: 'Нечастый',
    rarity_rare: 'Редкий',
    rarity_very_rare: 'Очень редкий',
    rarity_label_prefix: 'Редкость:',
    color_any: 'Любой цвет',
    color_red: 'Красный',
    color_black: 'Чёрный',
    color_bi_color: 'Биколор',
    color_blue: 'Синий',
    color_brown: 'Коричневый',
    color_green: 'Зелёный',
    color_yellow: 'Жёлтый',
    color_grey: 'Серый',
    color_purple: 'Фиолетовый',
    color_white: 'Белый',
    color_pink: 'Розовый',
    color_multicolor: 'Разноцветный',
    color_orange: 'Оранжевый',
    russian_only: 'Только российские месторождения',
    filters_toggle: 'Фильтры',
    alphabet_all: 'Все',
    initial_letter: 'Начальная буква',
    letter_filter: (letter) => `Буква: ${letter}`,
    remove_letter_filter: (letter) => `Снять фильтр по букве ${letter}`,
    loading: 'Загрузка…',
    error_prefix: 'Не удалось получить данные:',
    empty: 'Ничего не найдено — база пуста или фильтр слишком строгий.',
    no_photo: 'нет фото',
    prev_page: '← Назад',
    next_page: 'Вперёд →',
    page_info: (page, total) => `Стр. ${page} из ${total}`,

    back_to_catalog: '← К каталогу',
    mineral_load_error: 'Не удалось загрузить образец:',
    synonyms_prefix: 'Также известен как:',
    esoteric_toggle: 'С эзотерикой',
    formula: 'Формула',
    group: 'Группа',
    crystal_system: 'Кристаллическая система',
    crystal_habit: 'Форма кристаллов',
    hardness: 'Твёрдость',
    density: 'Относительная плотность',
    luster: 'Блеск',
    transparency: 'Прозрачность',
    streak: 'Цвет черты',
    cleavage: 'Спайность',
    cleavage_directions: 'направл.',
    fracture: 'Излом',
    tenacity: 'Вязкость',
    ima_status: 'Статус IMA',
    rarity: 'Редкость',
    color_title: 'Цвет',
    lore_title: 'История и культура',
    identification_tips_title: 'Как отличить',
    composition_title: 'Состав',
    rock_type_title: 'Тип породы',
    phenomena_title: 'Оптические эффекты',
    esoteric_title: 'Эзотерика',
    esoteric_properties: 'Свойства:',
    esoteric_chakras: 'Чакры:',
    esoteric_zodiac: 'Знаки зодиака:',
    localities_title: 'Месторождения',
    russia_badge: 'РФ',
    gallery_title: 'Галерея',
    gallery_open_alt: 'Открыть фото крупно',
    safety_title: 'Меры предосторожности',
    related_title: 'Связанные камни',
    related_error: 'Не удалось загрузить связи:',
    not_found: 'Карточка не найдена (404).',
    sources_title: 'Источники',
    lightbox_close: 'Закрыть',
    page_not_found: 'Страница не найдена',
    page_not_found_desc: 'Проверьте адрес или вернитесь в каталог.',
    entity_mineral: 'Минерал', entity_rock: 'Горная порода', entity_gem_variety: 'Ювелирная разновидность', entity_organic: 'Органогенный материал',
    mineral_class: 'Минеральный класс', chemical_class: 'Химический класс', silicate_subclass: 'Подкласс силикатов', mineral_family: 'Семейство минералов', catalog_family: 'Семейство каталога', hardness_note: 'Примечание к твёрдости',

    // Показывается вместо русского текста, если перевода на выбранный язык нет —
    // принципиально не откатываемся на другой язык молча.
    not_translated: 'Перевод пока не готов',
    not_translated_full: 'Для этого образца пока нет перевода на английский язык.',

    articles_title: 'Блог и гиды о камнях',
    articles_desc: 'Истории и гиды о камнях.',
    search_articles_placeholder: 'Поиск по статьям…',
    type_any: 'Все типы',
    post_type_blog: 'Блог',
    post_type_guide: 'Гид',
    post_type_history: 'История',
    post_type_esoteric: 'Эзотерика',
    post_type_review: 'Обзор',
    no_cover: 'нет обложки',
    no_articles: 'Статей пока нет — база пуста или фильтр слишком строгий.',
    back_to_articles: '← К статьям',
    article_load_error: 'Не удалось загрузить статью:',
    tags_title: 'Теги',
    related_gems_title: 'Связанные камни',
  },
  en: {
    articles_empty: 'Articles are coming soon.',
    articles_no_matches: 'No articles match your search.',
    articles_language_empty: 'No articles are available in this language yet.',
    article_not_found: 'Article not found',
    home_sea_alt: 'A pebble seashore with an orange-red carnelian among the stones.',
    home_ural_alt: 'The Southern Ural mountains on a clear day. A pale yellow crystal cluster and a spruce twig rest on a vintage khaki canvas backpack.',
    home_tanzania_alt: 'Tanzania at night: a starry sky, campfire and classic Defender. Blue-violet tanzanite crystals rest on a foreground rock.',
    home_gallery: 'Mineral expeditions',
    hero_slide: (number) => `Image ${number}`,
    hero_pause: 'Pause slideshow',
    hero_play: 'Resume slideshow',
    home_hero_alt: 'A night camp with a fire and an orange tent beneath the northern lights. A granite rock with garnet crystals in the foreground.',
    nav_home: 'Home',
    sitemap_title: 'Sitemap',
    credits_title: 'Credits',
    footer_description: 'Stones, their properties and stories.',
    pagination_label: 'Catalog pages',
    page_label: (number) => `Page ${number}`,
    close_filters: 'Close filters',
    reset_filters: 'Reset filters',
    results_unavailable: 'Results could not be loaded',
    show_results: (count) => `Show ${count} ${count === 1 ? 'stone' : 'stones'}`,
    description_title: 'Description',
    characteristics_title: 'Characteristics',
    contents_title: 'Contents',
    care_title: 'Care & precautions',
    composition_group: 'Composition & classification',
    physical_group: 'Physical properties',
    optical_group: 'Optical properties',

    nav_catalog: 'Catalog',
    nav_articles: 'Articles',
    site_tag: 'test showcase · live API data',

    catalog_title: 'Stone catalog',
    catalog_count: (count) => `${count} ${count === 1 ? 'stone' : 'stones'} in the catalog`,
    results_count: (count) => `Found: ${count}`,
    catalog_desc: 'A working showcase for checking data population — pulls directly from the Samotsvety API.',
    search_placeholder: 'Find a stone by name or properties…',
    rarity_any: 'Any rarity',
    rarity_common: 'Common',
    rarity_uncommon: 'Uncommon',
    rarity_rare: 'Rare',
    rarity_very_rare: 'Very rare',
    rarity_label_prefix: 'Rarity:',
    color_any: 'Any color',
    color_red: 'Red',
    color_black: 'Black',
    color_bi_color: 'Bi Color',
    color_blue: 'Blue',
    color_brown: 'Brown',
    color_green: 'Green',
    color_yellow: 'Yellow',
    color_grey: 'Grey',
    color_purple: 'Purple',
    color_white: 'White',
    color_pink: 'Pink',
    color_multicolor: 'Multicolor',
    color_orange: 'Orange',
    russian_only: 'Russian localities only',
    filters_toggle: 'Filters',
    alphabet_all: 'All',
    initial_letter: 'Initial letter',
    letter_filter: (letter) => `Letter: ${letter}`,
    remove_letter_filter: (letter) => `Remove letter filter ${letter}`,
    loading: 'Loading…',
    error_prefix: 'Failed to load data:',
    empty: 'Nothing found — the database is empty or the filter is too strict.',
    no_photo: 'no photo',
    prev_page: '← Back',
    next_page: 'Next →',
    page_info: (page, total) => `Page ${page} of ${total}`,

    back_to_catalog: '← Back to catalog',
    mineral_load_error: 'Failed to load specimen:',
    synonyms_prefix: 'Also known as:',
    esoteric_toggle: 'Show esoteric info',
    formula: 'Formula',
    group: 'Group',
    crystal_system: 'Crystal system',
    crystal_habit: 'Crystal habit',
    hardness: 'Hardness',
    density: 'Specific gravity',
    luster: 'Luster',
    transparency: 'Transparency',
    streak: 'Streak',
    cleavage: 'Cleavage',
    cleavage_directions: 'directions',
    fracture: 'Fracture',
    tenacity: 'Tenacity',
    ima_status: 'IMA status',
    rarity: 'Rarity',
    color_title: 'Color',
    lore_title: 'History & culture',
    identification_tips_title: 'Identification tips',
    composition_title: 'Composition',
    rock_type_title: 'Rock type',
    phenomena_title: 'Optical phenomena',
    esoteric_title: 'Esoteric properties',
    esoteric_properties: 'Properties:',
    esoteric_chakras: 'Chakras:',
    esoteric_zodiac: 'Zodiac signs:',
    localities_title: 'Localities',
    russia_badge: 'RU',
    gallery_title: 'Gallery',
    gallery_open_alt: 'Open full-size photo',
    safety_title: 'Safety notes',
    related_title: 'Related stones',
    related_error: 'Failed to load related stones:',
    not_found: 'Specimen not found (404).',
    sources_title: 'Sources',
    lightbox_close: 'Close',
    page_not_found: 'Page not found',
    page_not_found_desc: 'Check the address or return to the catalog.',
    entity_mineral: 'Mineral', entity_rock: 'Rock', entity_gem_variety: 'Gem variety', entity_organic: 'Organic material',
    mineral_class: 'Mineral class', chemical_class: 'Chemical class', silicate_subclass: 'Silicate subclass', mineral_family: 'Mineral family', catalog_family: 'Catalog family', hardness_note: 'Hardness note',

    not_translated: 'Translation pending',
    not_translated_full: 'This specimen has not been translated into English yet.',

    articles_title: 'Blog & gem guides',
    articles_desc: 'Stories and guides about stones.',
    search_articles_placeholder: 'Search articles…',
    type_any: 'All types',
    post_type_blog: 'Blog',
    post_type_guide: 'Guide',
    post_type_history: 'History',
    post_type_esoteric: 'Esoteric',
    post_type_review: 'Review',
    no_cover: 'no cover',
    no_articles: 'No articles yet — the database is empty or the filter is too strict.',
    back_to_articles: '← Back to articles',
    article_load_error: 'Failed to load article:',
    tags_title: 'Tags',
    related_gems_title: 'Related gemstones',
  },
};

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    if (typeof window === 'undefined') return 'ru';
    return localStorage.getItem(STORAGE_KEY) || 'ru';
  });

  const setLang = useCallback((next) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // localStorage может быть недоступен (приватный режим и т.п.) — не критично
    }
  }, []);

  const t = useCallback(
    (key, ...args) => {
      const entry = STRINGS[lang]?.[key] ?? STRINGS.ru[key];
      return typeof entry === 'function' ? entry(...args) : entry;
    },
    [lang]
  );

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used inside <LangProvider>');
  return ctx;
}

// Возвращает языковой блок i18n[lang] или null, если для этого языка перевода
// вообще нет. ПРИНЦИПИАЛЬНО не откатывается на i18n.ru — если решили показать
// английский, показываем либо английский, либо явно "перевод не готов", но
// никогда не подсовываем русский текст молча.
export function pickI18n(i18n, lang) {
  return i18n?.[lang] ?? null;
}

// То же самое для точечных полей вида country_ru/country_en, description_ru/en.
// Без отката на _ru — если английского варианта нет, поле просто не рендерится.
export function pickField(obj, baseName, lang) {
  if (!obj) return undefined;
  return obj[`${baseName}_${lang}`] || undefined;
}
