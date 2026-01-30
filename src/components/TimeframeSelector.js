/**
 * Timeframe Selector Component
 * Dropdown for selecting chart timeframes
 */

const TIMEFRAMES = [
    { value: '1M', label: '1分足' },
    { value: '5M', label: '5分足' },
    { value: '15M', label: '15分足' },
    { value: '30M', label: '30分足' },
    { value: '1H', label: '1時間足' },
    { value: '4H', label: '4時間足' },
    { value: '1D', label: '日足' },
    { value: '1W', label: '週足' },
    { value: '1MO', label: '月足' },
];

export function initTimeframeSelector(onChange) {
    const container = document.getElementById('timeframe-selector');

    container.innerHTML = `
    <label class="control-label">Timeframe</label>
    <select class="control-select" id="timeframe-select">
      ${TIMEFRAMES.map(tf =>
        `<option value="${tf.value}" ${tf.value === '1H' ? 'selected' : ''}>${tf.label}</option>`
    ).join('')}
    </select>
  `;

    const select = document.getElementById('timeframe-select');

    select.addEventListener('change', (e) => {
        onChange(e.target.value);
    });

    // Trigger initial callback
    onChange(select.value);
}
