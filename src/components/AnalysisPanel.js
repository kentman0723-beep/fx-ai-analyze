/**
 * Analysis Panel Component
 * Displays AI analysis results
 */

export function initAnalysisPanel() {
    // Panel is initialized in HTML
    // This component handles dynamic updates
    console.log('Analysis Panel initialized');
}

/**
 * Format analysis result for display
 */
export function formatAnalysisResult(result) {
    return {
        bullishProbability: result.bullishProbability || 50,
        bearishProbability: result.bearishProbability || 50,
        technicalAnalysis: result.technicalAnalysis || 'N/A',
        fundamentalAnalysis: result.fundamentalAnalysis || 'N/A',
        recommendation: result.recommendation || 'N/A',
        risks: result.risks || 'N/A',
        heatmapData: result.heatmapData || [],
        sentiment: result.sentiment || {
            economic: 50,
            market: 50,
            technical: 50,
            news: 50
        }
    };
}
