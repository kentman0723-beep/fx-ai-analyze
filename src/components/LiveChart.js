/**
 * Live Chart Component
 * Wrapper for TradingView Widget
 */

let widget = null;

export function initLiveChart(containerId, initialCurrency) {
    updateChart(initialCurrency);
}

export function updateChart(currencyPair) {
    if (!window.TradingView) return;

    // Convert "USD/JPY" -> "FX:USDJPY"
    const symbol = "FX:" + currencyPair.replace('/', '');

    const container = document.getElementById('tradingview-widget-container');
    if (!container) return;

    // Clear previous generic content if needed, but widget replaces content.
    // TradingView.widget creates an iframe.

    widget = new TradingView.widget({
        "autosize": true,
        "symbol": symbol,
        "interval": "60", // Default 1H
        "timezone": "Asia/Tokyo",
        "theme": "dark",
        "style": "1",
        "locale": "ja",
        "toolbar_bg": "#f1f3f6",
        "enable_publishing": false,
        "hide_top_toolbar": false,
        "hide_legend": true,
        "save_image": false,
        "container_id": "tradingview-widget-container",
        "backgroundColor": "rgba(13, 15, 18, 1)", // Match app background
        "gridColor": "rgba(255, 255, 255, 0.05)",
        "allow_symbol_change": false // Controlled by our app
    });
}
