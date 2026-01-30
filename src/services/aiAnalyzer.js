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
  "technicalAnalysis": "テクニカル分析の詳細（トレンド、サポート/レジスタンス、移動平均線、RSI、MACDなどの分析）",
  "fundamentalAnalysis": "ファンダメンタル分析の観点からの考察（経済指標、金融政策、地政学リスクなど）",
  "recommendation": "推奨アクション（買い/売り/様子見）とその理由",
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

            const trends = ['上昇トレンド', '下降トレンド', 'レンジ相場'];
            const trend = trends[Math.floor(Math.random() * trends.length)];

            const actions = ['買い', '売り', '様子見'];
            const action = actions[Math.floor(Math.random() * actions.length)];

            resolve({
                bullishProbability: bullishProb,
                bearishProbability: bearishProb,
                technicalAnalysis: `現在の${currency}チャート（${timeframe}足）を分析した結果、${trend}の傾向が見られます。移動平均線（MA20, MA50）はゴールデンクロス/デッドクロスの可能性を示唆しており、RSIは${30 + Math.round(Math.random() * 40)}付近で推移しています。ボリンジャーバンドは${Math.random() > 0.5 ? '拡大' : '収束'}傾向にあり、ボラティリティの${Math.random() > 0.5 ? '上昇' : '低下'}が予想されます。`,
                fundamentalAnalysis: `${currency.split('/')[0]}の経済指標は堅調に推移しており、中央銀行の金融政策も現在のトレンドを支持しています。一方、${currency.split('/')[1]}側では、最近の経済データがやや弱含みとなっており、通貨安圧力がかかっています。地政学的リスクは限定的ですが、今後の主要経済イベントには注意が必要です。`,
                recommendation: `${action}を推奨します。${action === '買い' ? 'エントリーポイントは現在の水準から少し下での押し目買いが理想的です。' : action === '売り' ? '戻り売りを狙い、直近のレジスタンスライン付近でのエントリーを検討してください。' : '現在は明確なトレンドが形成されにくい状況です。次のブレイクアウトを待つことをお勧めします。'}`,
                risks: `主なリスクとして、1) 突発的なニュースによる急変動、2) 主要経済指標の発表（雇用統計、GDP、金利決定など）、3) 流動性の低い時間帯でのスプレッド拡大が挙げられます。ストップロスの設定を忘れずに、リスク管理を徹底してください。`,
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
