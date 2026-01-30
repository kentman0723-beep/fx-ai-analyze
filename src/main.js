/**
 * FX AI Analysis Platform - Main Application
 * Initializes all components and handles global state
 */

import { initChartUploader } from './components/ChartUploader.js';
import { initCurrencySelector } from './components/CurrencySelector.js';
import { initTimeframeSelector } from './components/TimeframeSelector.js';
import { initAnalysisPanel } from './components/AnalysisPanel.js';
import { initPricingModal } from './components/PricingModal.js';
import { analyzeChart } from './services/aiAnalyzer.js';

// Application State
const appState = {
  selectedCurrency: 'USD/JPY',
  selectedTimeframe: '1H',
  chartImage: null,
  isAnalyzing: false,
  analysisResult: null
};

// DOM Elements
const analyzeBtn = document.getElementById('analyze-btn');
const loadingOverlay = document.getElementById('loading-overlay');
const chartCanvas = document.getElementById('chart-canvas');
const selectedPairEl = document.getElementById('selected-pair');
const selectedTimeframeEl = document.getElementById('selected-timeframe');

/**
 * Initialize the application
 */
function initApp() {
  // Initialize components
  initCurrencySelector((currency) => {
    appState.selectedCurrency = currency;
    selectedPairEl.textContent = currency;
    updateAnalyzeButton();
  });

  initTimeframeSelector((timeframe) => {
    appState.selectedTimeframe = timeframe;
    selectedTimeframeEl.textContent = timeframe;
    updateAnalyzeButton();
  });

  initChartUploader({
    onUpload: (imageData) => {
      appState.chartImage = imageData;
      displayChartPreview(imageData);
      updateAnalyzeButton();
    },
    onRemove: () => {
      appState.chartImage = null;
      clearChartPreview();
      updateAnalyzeButton();
    }
  });

  initAnalysisPanel();
  initPricingModal();

  // Set up analyze button
  analyzeBtn.addEventListener('click', handleAnalyze);

  // Initialize heatmap
  initHeatmap();

  console.log('FX AI Analysis Platform initialized');
}

/**
 * Update analyze button state
 */
function updateAnalyzeButton() {
  const canAnalyze = appState.chartImage && 
                     appState.selectedCurrency && 
                     appState.selectedTimeframe &&
                     !appState.isAnalyzing;
  analyzeBtn.disabled = !canAnalyze;
}

/**
 * Display chart preview in main area
 */
function displayChartPreview(imageData) {
  chartCanvas.innerHTML = `<img src="${imageData}" alt="Uploaded Chart" class="chart-image">`;
}

/**
 * Clear chart preview
 */
function clearChartPreview() {
  chartCanvas.innerHTML = `
    <div class="chart-placeholder">
      <p>チャート画像をアップロードしてください</p>
    </div>
  `;
}

/**
 * Initialize heatmap with placeholder data
 */
function initHeatmap() {
  const heatmapGrid = document.getElementById('heatmap-grid');
  const cells = 28; // 7x4 grid
  
  for (let i = 0; i < cells; i++) {
    const cell = document.createElement('div');
    cell.className = 'heatmap-cell';
    // Random initial colors (neutral)
    const hue = 200; // Blue-ish neutral
    const light = 15 + Math.random() * 10;
    cell.style.background = `hsl(${hue}, 20%, ${light}%)`;
    heatmapGrid.appendChild(cell);
  }
}

/**
 * Handle analyze button click
 */
async function handleAnalyze() {
  if (!appState.chartImage || appState.isAnalyzing) return;

  appState.isAnalyzing = true;
  updateAnalyzeButton();
  showLoading(true);

  try {
    const result = await analyzeChart({
      image: appState.chartImage,
      currency: appState.selectedCurrency,
      timeframe: appState.selectedTimeframe
    });

    appState.analysisResult = result;
    updateAnalysisDisplay(result);
  } catch (error) {
    console.error('Analysis error:', error);
    showError('分析中にエラーが発生しました。もう一度お試しください。');
  } finally {
    appState.isAnalyzing = false;
    updateAnalyzeButton();
    showLoading(false);
  }
}

/**
 * Show/hide loading overlay
 */
function showLoading(show) {
  loadingOverlay.style.display = show ? 'flex' : 'none';
}

/**
 * Update analysis display with results
 */
function updateAnalysisDisplay(result) {
  // Update probability gauge
  const bearProb = document.getElementById('bear-probability');
  const bullProb = document.getElementById('bull-probability');
  const bearGauge = document.querySelector('.gauge-fill.bearish');
  const bullGauge = document.querySelector('.gauge-fill.bullish');

  bearProb.textContent = `${result.bearishProbability}%`;
  bullProb.textContent = `${result.bullishProbability}%`;
  bearGauge.style.width = `${result.bearishProbability}%`;
  bullGauge.style.width = `${result.bullishProbability}%`;

  // Update heatmap
  updateHeatmap(result.heatmapData);

  // Update sentiment radar
  updateSentimentRadar(result.sentiment);

  // Update report
  updateReport(result);
}

/**
 * Update heatmap with analysis data
 */
function updateHeatmap(heatmapData) {
  const cells = document.querySelectorAll('.heatmap-cell');
  
  cells.forEach((cell, index) => {
    const value = heatmapData[index] || 0;
    let hue, saturation, lightness;

    if (value > 0) {
      // Bullish - Green
      hue = 142;
      saturation = 60 + (value * 20);
      lightness = 30 + (value * 20);
    } else if (value < 0) {
      // Bearish - Red
      hue = 0;
      saturation = 60 + (Math.abs(value) * 20);
      lightness = 30 + (Math.abs(value) * 20);
    } else {
      // Neutral
      hue = 200;
      saturation = 20;
      lightness = 20;
    }

    cell.style.background = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    cell.style.transition = `background ${0.3 + index * 0.05}s ease`;
  });
}

/**
 * Update sentiment radar with data
 */
function updateSentimentRadar(sentiment) {
  const radarEl = document.getElementById('sentiment-radar');
  
  radarEl.innerHTML = `
    <div class="radar-chart">
      <div class="sentiment-items">
        <div class="sentiment-item">
          <span class="sentiment-label">経済指標</span>
          <div class="sentiment-bar-container">
            <div class="sentiment-bar" style="width: ${sentiment.economic}%; background: ${getColorForValue(sentiment.economic)}"></div>
          </div>
          <span class="sentiment-value">${sentiment.economic}%</span>
        </div>
        <div class="sentiment-item">
          <span class="sentiment-label">市場心理</span>
          <div class="sentiment-bar-container">
            <div class="sentiment-bar" style="width: ${sentiment.market}%; background: ${getColorForValue(sentiment.market)}"></div>
          </div>
          <span class="sentiment-value">${sentiment.market}%</span>
        </div>
        <div class="sentiment-item">
          <span class="sentiment-label">テクニカル</span>
          <div class="sentiment-bar-container">
            <div class="sentiment-bar" style="width: ${sentiment.technical}%; background: ${getColorForValue(sentiment.technical)}"></div>
          </div>
          <span class="sentiment-value">${sentiment.technical}%</span>
        </div>
        <div class="sentiment-item">
          <span class="sentiment-label">ニュース</span>
          <div class="sentiment-bar-container">
            <div class="sentiment-bar" style="width: ${sentiment.news}%; background: ${getColorForValue(sentiment.news)}"></div>
          </div>
          <span class="sentiment-value">${sentiment.news}%</span>
        </div>
      </div>
    </div>
  `;
}

/**
 * Get color based on sentiment value
 */
function getColorForValue(value) {
  if (value >= 60) return 'var(--color-bullish)';
  if (value <= 40) return 'var(--color-bearish)';
  return 'var(--color-teal)';
}

/**
 * Update report section
 */
function updateReport(result) {
  const reportContent = document.getElementById('report-content');
  
  reportContent.innerHTML = `
    <div class="report-section">
      <div class="report-section-title">📊 テクニカル分析</div>
      <p class="report-text">${result.technicalAnalysis}</p>
    </div>
    <div class="report-section">
      <div class="report-section-title">📰 ファンダメンタル分析</div>
      <p class="report-text">${result.fundamentalAnalysis}</p>
    </div>
    <div class="report-section">
      <div class="report-section-title">🎯 推奨アクション</div>
      <p class="report-text">${result.recommendation}</p>
    </div>
    <div class="report-section">
      <div class="report-section-title">⚠️ リスク要因</div>
      <p class="report-text">${result.risks}</p>
    </div>
  `;
}

/**
 * Show error message
 */
function showError(message) {
  const reportContent = document.getElementById('report-content');
  reportContent.innerHTML = `
    <div class="report-error">
      <p style="color: var(--color-bearish);">${message}</p>
    </div>
  `;
}

// Add sentiment styles
const sentimentStyles = document.createElement('style');
sentimentStyles.textContent = `
  .sentiment-items {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    width: 100%;
    padding: var(--space-2);
  }
  
  .sentiment-item {
    display: grid;
    grid-template-columns: 80px 1fr 40px;
    align-items: center;
    gap: var(--space-3);
  }
  
  .sentiment-label {
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
  }
  
  .sentiment-bar-container {
    height: 8px;
    background: var(--color-bg-tertiary);
    border-radius: var(--radius-full);
    overflow: hidden;
  }
  
  .sentiment-bar {
    height: 100%;
    border-radius: var(--radius-full);
    transition: width 0.5s ease;
  }
  
  .sentiment-value {
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    text-align: right;
  }
`;
document.head.appendChild(sentimentStyles);

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);
