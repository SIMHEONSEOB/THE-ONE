// Yahoo Finance API - 완전 무료 한국 주식 데이터
// 별도 API 키 없이 바로 사용 가능

class YahooFinanceAPI {
    constructor() {
        this.baseURL = 'https://query1.finance.yahoo.com/v8/finance/chart';
        this.quoteURL = 'https://query1.finance.yahoo.com/v7/finance/quote';
    }

    // 한국 종목 코드를 Yahoo Finance 형식으로 변환
    convertToYahooSymbol(koreanCode) {
        // 한국 종목은 .KS 접미사 추가
        return koreanCode + '.KS';
    }

    // 주식 데이터 가져오기
    async fetchStockData(code) {
        const yahooSymbol = this.convertToYahooSymbol(code);
        
        try {
            // 차트 데이터 가져오기 (30일 일봉)
            const chartResponse = await fetch(`${this.baseURL}/${yahooSymbol}?range=30d&interval=1d&includePrePost=true`);
            const chartData = await chartResponse.json();
            
            // 실시간 가격 정보 가져오기
            const quoteResponse = await fetch(`${this.quoteURL}?symbols=${yahooSymbol}&fields=regularMarketPrice,regularMarketChange,regularMarketChangePercent,regularMarketVolume`);
            const quoteData = await quoteResponse.json();
            
            return this.formatYahooData(chartData, quoteData, yahooSymbol);
        } catch (error) {
            console.error('Yahoo Finance API Error:', error);
            return null;
        }
    }

    // 여러 종목 데이터 한번에 가져오기
    async fetchMultipleStocks(codes) {
        const promises = codes.map(code => this.fetchStockData(code));
        const results = await Promise.allSettled(promises);
        
        return results.map(result => {
            if (result.status === 'fulfilled') {
                return result.value;
            } else {
                console.error(`종목 데이터 가져오기 실패:`, result.reason);
                return null;
            }
        }).filter(data => data !== null);
    }

    // Yahoo Finance 데이터 포맷팅
    formatYahooData(chartData, quoteData, symbol) {
        try {
            // 차트 데이터 처리
            const chart = chartData.chart;
            if (!chart || !chart.result || chart.result.length === 0) {
                return null;
            }
            
            const result = chart.result[0];
            const timestamps = result.timestamp;
            const quotes = result.indicators.quote[0];
            const meta = result.meta;
            
            // 실시간 가격 정보 처리
            let currentPrice = meta.regularMarketPrice || 0;
            let change = meta.regularMarketChange || 0;
            let changePercent = meta.regularMarketChangePercent || 0;
            let volume = meta.regularMarketVolume || 0;
            
            // quote 데이터가 더 최신이면 업데이트
            if (quoteData && quoteData.quoteResponse && quoteData.quoteResponse.result.length > 0) {
                const quote = quoteData.quoteResponse.result[0];
                currentPrice = quote.regularMarketPrice || currentPrice;
                change = quote.regularMarketChange || change;
                changePercent = quote.regularMarketChangePercent || changePercent;
                volume = quote.regularMarketVolume || volume;
            }
            
            // 히스토리 데이터 생성
            const historicalData = timestamps.map((timestamp, index) => {
                const date = new Date(timestamp * 1000);
                return {
                    date: date.toISOString().split('T')[0],
                    open: quotes.open[index] || 0,
                    high: quotes.high[index] || 0,
                    low: quotes.low[index] || 0,
                    close: quotes.close[index] || 0,
                    volume: quotes.volume[index] || 0
                };
            }).filter(item => item.close > 0); // 유효한 데이터만 필터링
            
            // 종목명 추출 (symbol에서 .KS 제거)
            const stockCode = symbol.replace('.KS', '');
            const stockName = this.getStockName(stockCode);
            
            return {
                code: stockCode,
                name: stockName,
                symbol: symbol,
                currentPrice: currentPrice,
                change: change,
                changePercent: changePercent,
                volume: volume,
                marketCap: meta.marketCap || 0,
                highPrice: meta.regularMarketDayHigh || 0,
                lowPrice: meta.regularMarketDayLow || 0,
                openPrice: meta.regularMarketOpen || 0,
                previousClose: meta.chartPreviousClose || 0,
                currency: meta.currency || 'KRW',
                historicalData: historicalData,
                actualData: true,
                source: 'Yahoo Finance'
            };
        } catch (error) {
            console.error('Yahoo Finance 데이터 포맷팅 실패:', error);
            return null;
        }
    }

    // 종목 코드로 종목명 가져오기
    getStockName(code) {
        const stockMap = {
            '005930': '삼성전자',
            '000660': 'SK하이닉스',
            '035420': 'NAVER',
            '051910': 'LG화학',
            '005490': 'POSCO홀딩스',
            '068270': '셀트리온',
            '028260': '삼성물산',
            '373220': 'LG에너지솔루션',
            '247540': '에코프로비엠',
            '086520': '에코프로',
            '003550': 'LG',
            '066570': 'LG전자',
            '017670': 'SK텔레콤',
            '302440': 'SK스퀘어',
            '105560': 'KB금융',
            '055550': '신한지주',
            '005935': '삼성생명',
            '032830': '삼성화재',
            '078020': '금호석유',
            '009540': '현대제철'
        };
        
        return stockMap[code] || `종목 ${code}`;
    }

    // 기술적 지표 계산
    calculateTechnicalIndicators(stockData) {
        if (!stockData || !stockData.historicalData || stockData.historicalData.length < 20) {
            return {
                sma20: null,
                sma60: null,
                rsi: null,
                macd: null,
                volumeRatio: null,
                volatility: null
            };
        }

        const prices = stockData.historicalData.map(d => d.close);
        const volumes = stockData.historicalData.map(d => d.volume);
        
        return {
            sma20: this.calculateSMA(prices, 20),
            sma60: this.calculateSMA(prices, 60),
            rsi: this.calculateRSI(prices, 14),
            macd: this.calculateMACD(prices),
            volumeRatio: this.calculateVolumeRatio(volumes),
            volatility: this.calculateVolatility(prices)
        };
    }

    // 단순 이동평균 (SMA)
    calculateSMA(prices, period) {
        if (prices.length < period) return null;
        
        const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
        return sum / period;
    }

    // 상대강도지수 (RSI)
    calculateRSI(prices, period = 14) {
        if (prices.length < period + 1) return null;
        
        const gains = [];
        const losses = [];
        
        for (let i = 1; i < prices.length; i++) {
            const change = prices[i] - prices[i - 1];
            gains.push(change > 0 ? change : 0);
            losses.push(change < 0 ? Math.abs(change) : 0);
        }
        
        const avgGain = gains.slice(-period).reduce((a, b) => a + b, 0) / period;
        const avgLoss = losses.slice(-period).reduce((a, b) => a + b, 0) / period;
        
        if (avgLoss === 0) return 100;
        
        const rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
    }

    // MACD
    calculateMACD(prices) {
        const ema12 = this.calculateEMA(prices, 12);
        const ema26 = this.calculateEMA(prices, 26);
        
        if (!ema12 || !ema26) return null;
        
        const macdLine = ema12 - ema26;
        return {
            macd: macdLine,
            signal: 0,
            histogram: 0
        };
    }

    // 지수이동평균 (EMA)
    calculateEMA(prices, period) {
        if (prices.length < period) return null;
        
        const multiplier = 2 / (period + 1);
        let ema = prices[0];
        
        for (let i = 1; i < prices.length; i++) {
            ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
        }
        
        return ema;
    }

    // 거래량 비율 계산
    calculateVolumeRatio(volumes) {
        if (volumes.length < 2) return null;
        
        const recentVolume = volumes[volumes.length - 1];
        const avgVolume = volumes.slice(-20).reduce((a, b) => a + b, 0) / Math.min(20, volumes.length);
        
        return avgVolume > 0 ? (recentVolume / avgVolume) * 100 : 0;
    }

    // 변동성 계산
    calculateVolatility(prices, period = 20) {
        if (prices.length < period + 1) return null;
        
        const returns = [];
        for (let i = 1; i < prices.length; i++) {
            returns.push(Math.log(prices[i] / prices[i - 1]));
        }
        
        const recentReturns = returns.slice(-period);
        const mean = recentReturns.reduce((a, b) => a + b, 0) / recentReturns.length;
        const variance = recentReturns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / recentReturns.length;
        
        return Math.sqrt(variance) * Math.sqrt(252) * 100; // 연간 변동성 (%)
    }
}

// Yahoo Finance API 인스턴스 생성
const yahooAPI = new YahooFinanceAPI();

// Yahoo Finance API를 사용한 주식 선택 함수
async function selectBestStockWithYahooAPI() {
    try {
        console.log('Yahoo Finance API로 주식 데이터 가져오기 시작...');
        
        // 모든 종목 데이터 가져오기
        const stockData = await yahooAPI.fetchMultipleStocks(koreanStocks.map(s => s.code));
        
        if (!stockData || stockData.length === 0) {
            console.warn('Yahoo Finance 데이터를 가져오지 못해 시뮬레이션 데이터를 사용합니다.');
            return selectBestStock(); // 기존 시뮬레이션 함수로 폴백
        }
        
        console.log(`${stockData.length}개 종목 데이터 가져오기 성공`);
        
        // 각 종목에 대한 기술적 지표 계산
        const stocksWithIndicators = stockData.map(stock => {
            const indicators = yahooAPI.calculateTechnicalIndicators(stock);
            
            return {
                ...stock,
                volatility: indicators.volatility || 0,
                volumeIncrease: indicators.volumeRatio || 0,
                themeScore: Math.random() * 10 + 5, // 테마 점수는 랜덤
                technicalScore: calculateTechnicalScore(indicators),
                actualData: true
            };
        });
        
        // 종합 점수 계산
        const scoredStocks = stocksWithIndicators.map(stock => ({
            ...stock,
            totalScore: (stock.volatility * 0.3) + 
                       (stock.volumeIncrease * 0.4) + 
                       (stock.themeScore * 0.2) +
                       (stock.technicalScore * 0.1)
        }));
        
        // 최고 점수의 주식 선택
        scoredStocks.sort((a, b) => b.totalScore - a.totalScore);
        const bestStock = scoredStocks[0];
        
        console.log('선택된 최고 종목:', bestStock.name, '점수:', bestStock.totalScore);
        return bestStock;
        
    } catch (error) {
        console.error('Yahoo Finance API 기반 종목 선택 실패:', error);
        return selectBestStock(); // 시뮬레이션으로 폴백
    }
}

// 기술적 분석 점수 계산
function calculateTechnicalScore(indicators) {
    let score = 0;
    
    // RSI 과매도/과매수 상태 점수
    if (indicators.rsi) {
        if (indicators.rsi < 30) score += 3; // 과매도 (매수 기회)
        else if (indicators.rsi > 70) score += 1; // 과매수 (주의)
        else score += 2; // 중립
    }
    
    // MACD 신호 점수
    if (indicators.macd && indicators.macd.macd > 0) {
        score += 2;
    }
    
    // 이동평균 관계 점수
    if (indicators.sma20 && indicators.sma60) {
        if (indicators.sma20 > indicators.sma60) score += 2;
        else score += 1;
    }
    
    // 거래량 점수
    if (indicators.volumeRatio) {
        if (indicators.volumeRatio > 150) score += 2; // 거래량 급증
        else if (indicators.volumeRatio > 100) score += 1; // 거래량 증가
    }
    
    return Math.min(score, 10); // 최대 10점
}

export { YahooFinanceAPI, yahooAPI, selectBestStockWithYahooAPI };
