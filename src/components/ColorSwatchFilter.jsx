import { useLang } from '../i18n/LangContext.jsx';

// Фиксированный порядок и hex для 13 базовых цветов — те же значения,
// что и Scientific.BaseColor на бэкенде. Порядок соответствует референсу.
const BASE_COLORS = [
  { value: 'red', hex: '#C0392B' },
  { value: 'black', hex: '#23262B' },
  { value: 'bi_color', gradient: 'linear-gradient(135deg, #7C5CBF 0%, #7C5CBF 48%, #2F5D9C 52%, #2F5D9C 100%)' },
  { value: 'blue', hex: '#2438C9' },
  { value: 'brown', hex: '#8A5A34' },
  { value: 'green', hex: '#237A45' },
  { value: 'yellow', hex: '#F0C230' },
  { value: 'grey', hex: '#9CA1A6' },
  { value: 'purple', hex: '#6B21A8' },
  { value: 'white', hex: '#F5F3EE' },
  { value: 'pink', hex: '#F2A8BC' },
  { value: 'multicolor', gradient: 'conic-gradient(from 200deg, #7C5CBF, #2F5D9C, #237A45, #F0C230, #C0392B, #F2A8BC, #7C5CBF)' },
  { value: 'orange', hex: '#DD8A1E' },
];

function swatchStyle(item) {
  if (item.gradient) return { background: item.gradient };
  return { background: item.hex };
}

export default function ColorSwatchFilter({ available, value, onChange }) {
  const { t } = useLang();
  const availableSet = available ? new Set(available) : null;

  return (
    <div className="color-filter">
      <span className="color-filter-label">{t('color_title')}</span>
      <div className="color-swatches">
        <button
          type="button"
          className={`color-swatch color-swatch-all${value === '' ? ' active' : ''}`}
          onClick={() => onChange('')}
        >
          <span className="color-swatch-gem" />
          <span className="color-swatch-label">{t('color_any')}</span>
        </button>

        {BASE_COLORS.map((item) => {
          const isAvailable = !availableSet || availableSet.has(item.value);
          return (
            <button
              key={item.value}
              type="button"
              className={`color-swatch${value === item.value ? ' active' : ''}${
                !isAvailable ? ' unavailable' : ''
              }`}
              onClick={() => isAvailable && onChange(value === item.value ? '' : item.value)}
              disabled={!isAvailable}
              title={t(`color_${item.value}`)}
            >
              <span
                className={`color-swatch-gem${item.value === 'multicolor' ? ' multicolor' : ''}`}
                style={swatchStyle(item)}
              />
              <span className="color-swatch-label">{t(`color_${item.value}`)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}