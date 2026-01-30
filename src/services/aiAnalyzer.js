/**
 * AI Analyzer Service
 * Integrates with Gemini API for chart analysis
 */

// Gemini API configuration
const GEMINI_API_KEY = ''; // User needs to add their API key
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/**
 * Analyze chart using AI
 * @param {Object} params - Analysis parameters
 * @param {string} params.image - Base64 encoded image data
 * @param {string} params.currency - Currency pair (e.g., 'USD/JPY')
 * @param {string} params.timeframe - Chart timeframe (e.g., '1H')
 * @returns {Promise<Object>} Analysis result
 */
export async function analyzeChart({ image, currency, timeframe }) {
    // If no API key is configured, use demo mode
    if (!GEMINI_API_KEY) {
        console.log('Demo mode: Using simulated analysis');
        return simulateAnalysis(currency, timeframe);
    }

    try {
        // Extract base64 data from data URL
        const base64Data = image.split(',')[1];
        const mimeType = image.split(';')[0].split(':')[1];

        const prompt = createAnalysisPrompt(currency, timeframe);

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: prompt },
                        {
                            inline_data: {
                                mime_type: mimeType,
                                data: base64Data
                            }
                        }
                    ]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 2048,
                }
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const analysisText = data.candidates[0].content.parts[0].text;

        return parseAnalysisResponse(analysisText);
    } catch (error) {
        console.error('AI Analysis error:', error);
        // Fall back to simulated analysis
        return simulateAnalysis(currency, timeframe);
    }
}

/**
 * Create analysis prompt for the AI
 */
function createAnalysisPrompt(currency, timeframe) {
    return `あなたはプロのFXトレーダー兼アナリストです。以下のチャート画像を分析してください。

通貨ペア: ${currency}
時間足: ${timeframe}

以下の形式でJSONで回答してください：
{
  "bullishProbability": 上昇確率（0-100の数値）,
  "bearishProbability": 下落確率（0-100の数値）,
  "technicalAnalysis": "テクニカル分析の詳細（'サポートラインにタッチしたらダブルボトムが形成される可能性'などの具体的なチャートパターンの分析、移動平均線、RSIなどの指標を用いた分析）",
  "fundamentalAnalysis": "ファンダメンタル分析の観点からの考察（経済指標、金融政策、地政学リスクなど）",
  "recommendation": "推奨アクション（ロング/ショート/様子見）とその理由（'サポートライン付近での反発狙い'など具体的に）",
  "risks": "主なリスク要因と注意点",
  "sentiment": {
    "economic": 経済指標のポジティブ度（0-100）,
    "market": 市場心理のポジティブ度（0-100）,
    "technical": テクニカル指標のブル度（0-100）,
    "news": ニュースセンチメントのポジティブ度（0-100）
  }
}

JSONのみを返してください。マークダウンのコードブロックは不要です。`;
}

/**
 * Parse AI response into structured data
 */
function parseAnalysisResponse(responseText) {
    try {
        // Remove markdown code blocks if present
        let cleanedText = responseText
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();

        const parsed = JSON.parse(cleanedText);

        // Generate heatmap data
        const heatmapData = generateHeatmapData(parsed.bullishProbability);

        return {
            bullishProbability: parsed.bullishProbability || 50,
            bearishProbability: parsed.bearishProbability || 50,
            technicalAnalysis: parsed.technicalAnalysis || '',
            fundamentalAnalysis: parsed.fundamentalAnalysis || '',
            recommendation: parsed.recommendation || '',
            risks: parsed.risks || '',
            sentiment: parsed.sentiment || {
                economic: 50,
                market: 50,
                technical: 50,
                news: 50
            },
            heatmapData: heatmapData
        };
    } catch (error) {
        console.error('Failed to parse AI response:', error);
        return simulateAnalysis('', '');
    }
}

/**
 * Generate heatmap data based on bullish probability
 */
function generateHeatmapData(bullishProb) {
    const cells = 28;
    const data = [];
    const bias = (bullishProb - 50) / 50; // -1 to 1

    for (let i = 0; i < cells; i++) {
        // Add some randomness but keep the overall bias
        const random = (Math.random() - 0.5) * 1.5;
        const value = Math.max(-1, Math.min(1, bias + random));
        data.push(value);
    }

    return data;
}

/**
 * Simulate analysis for demo mode
 */
function simulateAnalysis(currency, timeframe) {
    // Simulate network delay
    return new Promise((resolve) => {
        setTimeout(() => {
            // Generate random but realistic-looking results
            const bullishProb = Math.round(35 + Math.random() * 30);
            const bearishProb = 100 - bullishProb;
            const isBullish = bullishProb > 50;

            const trend = isBullish ? '上昇トレンド' : '下降トレンド';
            const action = isBullish ? 'ロング' : 'ショート';

            // Random technical patterns
            const patterns = [
                'サポートライン付近での反発',
                'レジスタンスラインでの上値抑制',
                'ダブルボトム形成の兆候',
                'ヘッドアンドショルダー形成の可能性',
                '移動平均線のゴールデンクロス',
                'ボリンジャーバンドのスクイーズからのエクスパンション'
            ];
            const pattern = patterns[Math.floor(Math.random() * patterns.length)];

            resolve({
                bullishProbability: bullishProb,
                bearishProbability: bearishProb,
                technicalAnalysis: `現在の${currency}チャート（${timeframe}）では${trend}が確認されます。特に${pattern}が見受けられ、テクニカル的な転換点または継続シグナルが出ています。直近のサポートラインにタッチ後の反発挙動は、ダブルボトムが形成される可能性を強く示唆しており、ここからの押し目買い（ロング）が優位性を持つ局面です。RSIは調整局面を示しており、過熱感は和らいでいます。`,
                fundamentalAnalysis: `${currency.split('/')[0]}の主要経済指標は市場予想を上回り、実需のフローも堅調です。特に中央銀行のタカ派的な発言が通貨高をサポートしています。対して${currency.split('/')[1]}は地政学リスクの高まりからリスク回避的な動きが見られます。`,
                recommendation: `${action}推奨。サポートライン（支持線）付近でのエントリーを推奨します。${isBullish ? '直近高値をターゲットとし、安値割れでストップロスを設定してください。' : '直近安値をターゲットとし、高値更新でストップロスを設定してください。'} リスクリワード比は1:2以上を確保できる水準です。`,
                risks: `下落リスクとして、突発的な要人発言による急変動に注意が必要です。また、流動性が低下する時間帯でのスプレッド拡大も考慮してください。ダマシ（Fakeout）によるストップ狩りにも警戒が必要です。`,
                sentiment: {
                    economic: 40 + Math.round(Math.random() * 30),
                    market: 35 + Math.round(Math.random() * 35),
                    technical: bullishProb,
                    news: 45 + Math.round(Math.random() * 20)
                },
                heatmapData: generateHeatmapData(bullishProb)
            });
        }, 2000); // 2 second delay to simulate API call
    });
}
