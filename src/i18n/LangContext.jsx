import { createContext, useContext, useState, useCallback } from 'react';

const STORAGE_KEY = 'samotsvety_lang';

// Статичные тексты интерфейса. Данные о минералах/статьях (i18n.ru / i18n.en) сюда
// не входят — они выбираются хелперами pickI18n()/pickField() ниже прямо из ответа API.
const STRINGS = {
  ru: {
    nav_catalog: 'Каталог',
    nav_articles: 'Статьи',
    site_tag: 'тестовая витрина · данные из API',

    catalog_title: 'Образцы в базе',
    catalog_desc: 'Рабочая витрина для проверки наполнения — тянет данные напрямую из Samotsvety API.',
    search_placeholder: 'Поиск по названию, формуле, lore…',
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
    density: 'Плотность',
    luster: 'Блеск',
    transparency: 'Прозрачность',
    streak: 'Цвет черты',
    cleavage: 'Спайность',
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
    related_title: 'Похожие минералы',

    // Показывается вместо русского текста, если перевода на выбранный язык нет —
    // принципиально не откатываемся на другой язык молча.
    not_translated: 'Перевод пока не готов',
    not_translated_full: 'Для этого образца пока нет перевода на английский язык.',

    articles_title: 'Блог и гиды о камнях',
    articles_desc: 'Истории, гиды по огранке и эзотерические заметки — тянутся напрямую из Samotsvety API.',
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
    nav_catalog: 'Catalog',
    nav_articles: 'Articles',
    site_tag: 'test showcase · live API data',

    catalog_title: 'Specimens in the database',
    catalog_desc: 'A working showcase for checking data population — pulls directly from the Samotsvety API.',
    search_placeholder: 'Search by name, formula, lore…',
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
    density: 'Density',
    luster: 'Luster',
    transparency: 'Transparency',
    streak: 'Streak',
    cleavage: 'Cleavage',
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
    related_title: 'Related minerals',

    not_translated: 'Translation pending',
    not_translated_full: 'This specimen has not been translated into English yet.',

    articles_title: 'Blog & gem guides',
    articles_desc: 'Stories, cutting guides, and esoteric notes — pulled directly from the Samotsvety API.',
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