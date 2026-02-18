// 실제 API 연동을 위한 모듈
// 현재는 시뮬레이션 데이터를 사용하지만, 향후 실제 API로 교체 예정

class StockAPI {
    constructor() {
        this.baseURL = 'https://api.krx.co.kr';
        this.alphaVantageURL = 'https://www.alphavantage.co/query';
        this.alphaVantageKey = 'YOUR_ALPHA_VANTAGE_API_KEY'; // 실제 키로 교체 필요
    }

    // 한국거래소 API로 주식 데이터 가져오기
    async fetchKRXStockData(code) {
        try {
            const response = await fetch(`${this.baseURL}/stock/${code}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer YOUR_ACCESS_TOKEN' // 필요시
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return this.formatKRXData(data);
        } catch (error) {
            console.error('KRX API Error:', error);
            return null;
        }
    }

    // Alpha Vantage API로 주식 데이터 가져오기 (대안)
    async fetchAlphaVantageData(symbol) {
        try {
            const response = await fetch(`${this.alphaVantageURL}?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${this.alphaVantageKey}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return this.formatAlphaVantageData(data);
        } catch (error) {
            console.error('Alpha Vantage API Error:', error);
            return null;
        }
    }

    // KRX 데이터 포맷팅
    formatKRXData(data) {
        return {
            code: data.stock_code,
            name: data.stock_name,
            currentPrice: data.current_price,
            changeAmount: data.change_amount,
            changePercent: data.change_percent,
            volume: data.volume,
            marketCap: data.market_cap,
            sector: data.sector,
            timestamp: data.timestamp
        };
    }

    // Alpha Vantage 데이터 포맷팅
    formatAlphaVantageData(data) {
        const timeSeries = data['Time Series (Daily)'];
        const latestDate = Object.keys(timeSeries)[0];
        const latestData = timeSeries[latestDate];
        
        return {
            date: latestDate,
            open: parseFloat(latestData['1. open']),
            high: parseFloat(latestData['2. high']),
            low: parseFloat(latestData['3. low']),
            close: parseFloat(latestData['4. close']),
            volume: parseInt(latestData['5. volume'])
        };
    }

    // 여러 종목 데이터 한번에 가져오기
    async fetchMultipleStocks(codes) {
        const promises = codes.map(code => this.fetchKRXStockData(code));
        const results = await Promise.allSettled(promises);
        
        return results.map(result => {
            if (result.status === 'fulfilled') {
                return result.value;
            } else {
                console.error(`Failed to fetch stock data:`, result.reason);
                return null;
            }
        }).filter(data => data !== null);
    }

    // 거래량 데이터 가져오기
    async fetchVolumeData(code, period = 30) {
        try {
            const response = await fetch(`${this.baseURL}/volume/${code}?period=${period}`);
            const data = await response.json();
            return data.volume_history;
        } catch (error) {
            console.error('Volume data fetch error:', error);
            return null;
        }
    }

    // 테마/섹터 데이터 가져오기
    async fetchThemeData(theme) {
        try {
            const response = await fetch(`${this.baseURL}/theme/${theme}`);
            const data = await response.json();
            return data.stocks;
        } catch (error) {
            console.error('Theme data fetch error:', error);
            return null;
        }
    }

    // 실시간 가격 업데이트
    async fetchRealTimePrice(code) {
        try {
            const response = await fetch(`${this.baseURL}/realtime/${code}`);
            const data = await response.json();
            return {
                price: data.price,
                change: data.change,
                changePercent: data.change_percent,
                volume: data.volume,
                timestamp: data.timestamp
            };
        } catch (error) {
            console.error('Real-time price fetch error:', error);
            return null;
        }
    }

    // 기술적 지표 계산
    calculateTechnicalIndicators(priceData) {
        const prices = priceData.map(d => d.close);
        const volumes = priceData.map(d => d.volume);
        
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
            signal: 0, // Signal line would need historical MACD values
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
        
        return (recentVolume / avgVolume) * 100;
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

// API 인스턴스 생성
const stockAPI = new StockAPI();

// 실제 API 연동으로 업그레이드된 주식 선택 함수
async function selectBestStockWithAPI() {
    try {
        // 모든 종목 데이터 가져오기
        const stockData = await stockAPI.fetchMultipleStocks(koreanStocks.map(s => s.code));
        
        if (!stockData || stockData.length === 0) {
            console.warn('API 데이터를 가져오지 못해 시뮬레이션 데이터를 사용합니다.');
            return selectBestStock(); // 기존 시뮬레이션 함수로 폴백
        }
        
        // 각 종목에 대한 기술적 지표 계산
        const stocksWithIndicators = await Promise.all(
            stockData.map(async (stock) => {
                const priceHistory = await stockAPI.fetchVolumeData(stock.code, 30);
                const indicators = stockAPI.calculateTechnicalIndicators(priceHistory || []);
                
                return {
                    ...stock,
                    volatility: indicators.volatility || 0,
                    volumeIncrease: indicators.volumeRatio || 0,
                    themeScore: Math.random() * 10 + 5, // 테마 점수는 별도 API 필요
                    technicalScore: calculateTechnicalScore(indicators)
                };
            })
        );
        
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
        return scoredStocks[0];
        
    } catch (error) {
        console.error('API 기반 종목 선택 실패:', error);
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
    if (indicators.macd) {
        if (indicators.macd.macd > indicators.macd.signal) score += 2;
        else score += 1;
    }
    
    // 이동평균 관계 점수
    if (indicators.sma20 && indicators.sma60) {
        if (indicators.sma20 > indicators.sma60) score += 2;
        else score += 1;
    }
    
    return Math.min(score, 5); // 최대 5점
}

// 실시간 가격 업데이트 함수
async function updateRealTimePrice(stockCode) {
    const realTimeData = await stockAPI.fetchRealTimePrice(stockCode);
    
    if (realTimeData) {
        document.getElementById('currentPrice').textContent = formatPrice(realTimeData.price);
        
        const changeElement = document.getElementById('priceChange');
        changeElement.textContent = `${realTimeData.changePercent >= 0 ? '+' : ''}${realTimeData.changePercent.toFixed(2)}% (${realTimeData.change >= 0 ? '+' : ''}${formatPrice(realTimeData.change)})`;
        changeElement.className = `price-change ${realTimeData.changePercent >= 0 ? 'positive' : 'negative'}`;
    }
}

// 주기적인 실시간 업데이트 (1분마다)
setInterval(() => {
    if (currentStock) {
        updateRealTimePrice(currentStock.code);
    }
}, 60000); // 1분

export { StockAPI, stockAPI, selectBestStockWithAPI, updateRealTimePrice };
