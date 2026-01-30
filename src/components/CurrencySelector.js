/**
 * Currency Selector Component
 * Dropdown for selecting currency pairs
 */

const CURRENCY_PAIRS = [
  { value: 'USD/JPY', label: 'USD/JPY (ドル円)' },
  { value: 'EUR/USD', label: 'EUR/USD (ユーロドル)' },
  { value: 'GBP/USD', label: 'GBP/USD (ポンドドル)' },
  { value: 'EUR/JPY', label: 'EUR/JPY (ユーロ円)' },
  { value: 'GBP/JPY', label: 'GBP/JPY (ポンド円)' },
  { value: 'AUD/USD', label: 'AUD/USD (豪ドル)' },
  { value: 'AUD/JPY', label: 'AUD/JPY (豪ドル円)' },
  { value: 'NZD/USD', label: 'NZD/USD (NZドル)' },
  { value: 'USD/CHF', label: 'USD/CHF (ドルフラン)' },
  { value: 'USD/CAD', label: 'USD/CAD (ドルカナダ)' },
  { value: 'EUR/GBP', label: 'EUR/GBP (ユーロポンド)' },
  { value: 'EUR/AUD', label: 'EUR/AUD (ユーロ豪ドル)' },
];

export function initCurrencySelector(onChange) {
  const container = document.getElementById('currency-selector');

  container.innerHTML = `
    <label class="control-label">通貨ペア</label>
    <select class="control-select" id="currency-select">
      ${CURRENCY_PAIRS.map(pair =>
    `<option value="${pair.value}">${pair.label}</option>`
  ).join('')}
    </select>
  `;

  const select = document.getElementById('currency-select');

  select.addEventListener('change', (e) => {
    onChange(e.target.value);
  });

  // Trigger initial callback
  onChange(select.value);
}
