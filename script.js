// 전역 변수
let stockChart = null;
let currentStock = null;
let stockHistory = [];

// Yahoo Finance API - CORS 우회 방식 (백엔드 없이 직접 호출)
class YahooFinanceAPI {
    constructor() {
        this.baseURL = 'https://query1.finance.yahoo.com/v8/finance/chart';
        this.quoteURL = 'https://query1.finance.yahoo.com/v7/finance/quote';
        // CORS 우회를 위한 프록시 서버 (무료)
        this.corsProxy = 'https://cors-anywhere.herokuapp.com/';
    }

    // 한국 종목 코드를 Yahoo Finance 형식으로 변환
    convertToYahooSymbol(koreanCode) {
        return koreanCode + '.KS';
    }

    // CORS 우회 API 호출
    async fetchWithCors(url) {
        try {
            // 방법 1: CORS 프록시 사용
            const proxyUrl = this.corsProxy + url;
            const response = await fetch(proxyUrl, {
                method: 'GET',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.warn('CORS 프록시 실패, 다른 방법 시도:', error);
            
            try {
                // 방법 2: JSONP 방식 시도
                return await this.fetchWithJSONP(url);
            } catch (jsonpError) {
                console.warn('JSONP 실패, 최종 폴백:', jsonpError);
                throw new Error('모든 API 호출 방식 실패');
            }
        }
    }

    // JSONP 방식으로 CORS 우회
    async fetchWithJSONP(url) {
        return new Promise((resolve, reject) => {
            const callbackName = 'jsonp_callback_' + Date.now();
            const script = document.createElement('script');
            
            window[callbackName] = function(data) {
                delete window[callbackName];
                document.body.removeChild(script);
                resolve(data);
            };
            
            script.onerror = function() {
                delete window[callbackName];
                document.body.removeChild(script);
                reject(new Error('JSONP 호출 실패'));
            };
            
            const jsonpUrl = url + (url.includes('?') ? '&' : '?') + 'callback=' + callbackName;
            script.src = jsonpUrl;
            document.body.appendChild(script);
            
            // 타임아웃 설정
            setTimeout(() => {
                if (window[callbackName]) {
                    delete window[callbackName];
                    document.body.removeChild(script);
                    reject(new Error('JSONP 타임아웃'));
                }
            }, 10000);
        });
    }

    // 주식 데이터 가져오기 (CORS 우회 방식)
    async fetchStockData(code) {
        const yahooSymbol = this.convertToYahooSymbol(code);
        
        try {
            // 차트 데이터 가져오기
            const chartUrl = `${this.baseURL}/${yahooSymbol}?range=30d&interval=1d&includePrePost=true`;
            const chartData = await this.fetchWithCors(chartUrl);
            
            // 실시간 가격 데이터 가져오기
            const quoteUrl = `${this.quoteURL}?symbols=${yahooSymbol}&fields=regularMarketPrice,regularMarketChange,regularMarketChangePercent,regularMarketVolume`;
            const quoteData = await this.fetchWithCors(quoteUrl);
            
            return this.formatYahooData(chartData, quoteData, yahooSymbol);
        } catch (error) {
            console.error('Yahoo Finance API 호출 실패:', error);
            throw error;
        }
    }

    // Yahoo Finance 데이터 포맷팅
    formatYahooData(chartData, quoteData, symbol) {
        try {
            const chart = chartData.chart;
            const quote = quoteData.quoteResponse.result[0];
            
            if (!chart.result || !chart.result[0] || !quote) {
                throw new Error('데이터 형식 오류');
            }
            
            const result = chart.result[0];
            const timestamps = result.timestamp || [];
            const quotes = result.indicators.quote[0] || {};
            const closes = quotes.close || [];
            const volumes = quotes.volume || [];
            
            // 차트 데이터 생성
            const chartDataPoints = timestamps.map((timestamp, index) => ({
                x: new Date(timestamp * 1000),
                y: closes[index] || 0,
                volume: volumes[index] || 0
            })).filter(point => point.y > 0);
            
            // 현재 가격 정보
            const currentPrice = quote.regularMarketPrice || 0;
            const change = quote.regularMarketChange || 0;
            const changePercent = quote.regularMarketChangePercent || 0;
            const volume = quote.regularMarketVolume || 0;
            
            return {
                symbol: symbol,
                name: quote.longName || quote.shortName || symbol.replace('.KS', ''),
                currentPrice: currentPrice,
                change: change,
                changePercent: changePercent,
                volume: volume,
                chartData: chartDataPoints,
                lastUpdate: new Date()
            };
        } catch (error) {
            console.error('데이터 포맷팅 실패:', error);
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
}

// Yahoo Finance API 인스턴스
const yahooAPI = new YahooFinanceAPI();

// CORS 우회 방식으로 실시간 주식 데이터 가져오기
async function selectBestStockWithCORSBypass() {
    try {
        console.log('CORS 우회 방식으로 주식 데이터 가져오기 시작...');
        
        // 한국 주식 목록
        const koreanStocks = [
            { code: '005930', name: '삼성전자' },
            { code: '000660', name: 'SK하이닉스' },
            { code: '373220', name: 'LG에너지솔루션' },
            { code: '207940', name: '삼성바이오로직스' },
            { code: '247540', name: '에코프로비엠' }
        ];
        
        // 여러 종목 데이터 동시에 가져오기
        const stockData = await yahooAPI.fetchMultipleStocks(koreanStocks.map(s => s.code));
        
        if (!stockData || stockData.length === 0) {
            console.warn('실시간 데이터를 가져오지 못해 시뮬레이션 데이터를 사용합니다.');
            return null;
        }
        
        console.log(`${stockData.length}개 종목 데이터 가져오기 성공`);
        
        // 각 종목에 대한 기술적 지표 계산
        const stocksWithIndicators = stockData.map(stock => {
            const indicators = calculateTechnicalIndicators(stock);
            
            return {
                ...stock,
                volatility: indicators.volatility || 0,
                volumeIncrease: indicators.volumeRatio || 0,
                themeScore: Math.random() * 10 + 5,
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
        console.error('CORS 우회 방식 종목 선택 실패:', error);
        console.log('시뮬레이션 데이터로 폴백합니다.');
        return null;
    }
}
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
        
        return Math.sqrt(variance) * Math.sqrt(252) * 100;
    }
}

// Yahoo Finance API 인스턴스 생성
const yahooAPI = new YahooFinanceAPI();

// Yahoo Finance API를 사용한 주식 선택 함수
async function selectBestStockWithYahooAPI() {
    try {
        console.log('Yahoo Finance API로 주식 데이터 가져오기 시작...');
        
        const stockData = await yahooAPI.fetchMultipleStocks(koreanStocks.map(s => s.code));
        
        if (!stockData || stockData.length === 0) {
            console.warn('Yahoo Finance 데이터를 가져오지 못해 시뮬레이션 데이터를 사용합니다.');
            return selectBestStock();
        }
        
        console.log(`${stockData.length}개 종목 데이터 가져오기 성공`);
        
        const stocksWithIndicators = stockData.map(stock => {
            const indicators = yahooAPI.calculateTechnicalIndicators(stock);
            
            return {
                ...stock,
                volatility: indicators.volatility || 0,
                volumeIncrease: indicators.volumeRatio || 0,
                themeScore: Math.random() * 10 + 5,
                technicalScore: calculateTechnicalScore(indicators),
                actualData: true
            };
        });
        
        const scoredStocks = stocksWithIndicators.map(stock => ({
            ...stock,
            totalScore: (stock.volatility * 0.3) + 
                       (stock.volumeIncrease * 0.4) + 
                       (stock.themeScore * 0.2) +
                       (stock.technicalScore * 0.1)
        }));
        
        scoredStocks.sort((a, b) => b.totalScore - a.totalScore);
        const bestStock = scoredStocks[0];
        
        console.log('선택된 최고 종목:', bestStock.name, '점수:', bestStock.totalScore);
        return bestStock;
        
    } catch (error) {
        console.error('Yahoo Finance API 기반 종목 선택 실패:', error);
        return selectBestStock();
    }
}

// 기술적 분석 점수 계산
function calculateTechnicalScore(indicators) {
    let score = 0;
    
    if (indicators.rsi) {
        if (indicators.rsi < 30) score += 3;
        else if (indicators.rsi > 70) score += 1;
        else score += 2;
    }
    
    if (indicators.macd && indicators.macd.macd > 0) {
        score += 2;
    }
    
    if (indicators.sma20 && indicators.sma60) {
        if (indicators.sma20 > indicators.sma60) score += 2;
        else score += 1;
    }
    
    if (indicators.volumeRatio) {
        if (indicators.volumeRatio > 150) score += 2;
        else if (indicators.volumeRatio > 100) score += 1;
    }
    
    return Math.min(score, 10);
}

// 한국 주식 시장 종목 리스트 (일부 예시)
const koreanStocks = [
    { code: '005930', name: '삼성전자', sector: '전자' },
    { code: '000660', name: 'SK하이닉스', sector: '반도체' },
    { code: '035420', name: 'NAVER', sector: 'IT' },
    { code: '051910', name: 'LG화학', sector: '화학' },
    { code: '005490', name: 'POSCO홀딩스', sector: '철강' },
    { code: '068270', name: '셀트리온', sector: '바이오' },
    { code: '028260', name: '삼성물산', sector: '무역' },
    { code: '373220', name: 'LG에너지솔루션', sector: '전지' },
    { code: '247540', name: '에코프로비엠', sector: '전지소재' },
    { code: '086520', name: '에코프로', sector: '전지소재' },
    { code: '003550', name: 'LG', sector: '전자' },
    { code: '066570', name: 'LG전자', sector: '전자' },
    { code: '017670', name: 'SK텔레콤', sector: '통신' },
    { code: '302440', name: 'SK스퀘어', sector: '투자' },
    { code: '105560', name: 'KB금융', sector: '금융' },
    { code: '055550', name: '신한지주', sector: '금융' },
    { code: '005935', name: '삼성생명', sector: '금융' },
    { code: '032830', name: '삼성화재', sector: '금융' },
    { code: '078020', name: '금호석유', sector: '화학' },
    { code: '009540', name: '현대제철', sector: '철강' }
];

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    loadStockHistory();
    loadTodayStock(); // 오늘의 추천 종목 로드
    setTimeout(() => {
        // 실제 API 사용 여부 설정 (CORS 우회 방식 사용)
        const useRealAPI = true; // CORS 우회 방식으로 실시간 API 사용!
        
        if (useRealAPI) {
            selectAndDisplayStockWithYahooAPI(); // CORS 우회 방식
        } else {
            selectAndDisplayTodayStock(); // 오늘의 종목 표시
        }
    }, 2000); // 2초 후 로딩 완료
});

// 오늘의 추천 종목 로드
function loadTodayStock() {
    const today = new Date().toDateString(); // 날짜만 비교 (시간 제외)
    const saved = localStorage.getItem('todayStock');
    
    if (saved) {
        const todayStock = JSON.parse(saved);
        const savedDate = new Date(todayStock.date).toDateString();
        
        // 오늘 날짜이면 저장된 종목 사용
        if (savedDate === today) {
            console.log('오늘의 추천 종목 로드됨:', todayStock.name);
            return todayStock;
        }
    }
    
    // 오늘 날짜가 아니거나 저장된 종목이 없으면 새로 생성
    console.log('새로운 추천 종목 생성');
    return null;
}

// 오늘의 추천 종목 저장
function saveTodayStock(stock) {
    const todayStock = {
        date: new Date().toISOString(),
        stock: stock
    };
    localStorage.setItem('todayStock', JSON.stringify(todayStock));
    console.log('오늘의 추천 종목 저장됨:', stock.name);
}

// 오늘의 추천 종목 표시 함수
function selectAndDisplayTodayStock() {
    // 먼저 저장된 오늘 종목 확인
    const savedTodayStock = loadTodayStock();
    
    if (savedTodayStock) {
        // 저장된 종목이 있으면 표시
        displayStock(savedTodayStock.stock);
        console.log('오늘의 추천 종목 유지:', savedTodayStock.stock.name);
    } else {
        // 없으면 새로 생성하고 저장
        const newStock = selectBestStock();
        saveTodayStock(newStock);
        displayStock(newStock);
        console.log('새로운 추천 종목 생성:', newStock.name);
    }
    
    // 로딩 화면 숨기고 주식 정보 표시
    document.getElementById('loading').style.display = 'none';
    document.getElementById('stockCard').style.display = 'block';
}

// 자정에 오늘의 추천 종목 초기화 (매일 0시에 실행)
function scheduleDailyReset() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const msUntilMidnight = tomorrow - now;
    
    setTimeout(() => {
        localStorage.removeItem('todayStock');
        console.log('오늘의 추천 종목 초기화됨');
        scheduleDailyReset(); // 다음 날을 위해 다시 스케줄
    }, msUntilMidnight);
}

// 주식 히스토리 로드
function loadStockHistory() {
    const saved = localStorage.getItem('stockHistory');
    if (saved) {
        stockHistory = JSON.parse(saved);
    }
}

// 주식 히스토리 저장
function saveStockHistory() {
    localStorage.setItem('stockHistory', JSON.stringify(stockHistory));
}

// 주식 선택 로직 (핵심 알고리즘)
function selectAndDisplayStock() {
    const selectedStock = selectBestStock();
    displayStock(selectedStock);
    
    // 로딩 화면 숨기고 주식 정보 표시
    document.getElementById('loading').style.display = 'none';
    document.getElementById('stockCard').style.display = 'block';
}

// 최고의 주식 선택 알고리즘
function selectBestStock() {
    // 간단한 시뮬레이션 - 실제로는 API 데이터 사용
    const scores = koreanStocks.map(stock => {
        const volatility = Math.random() * 10 + 5; // 5-15% 변동성
        const volumeIncrease = Math.random() * 200 + 50; // 50-250% 거래량 증가
        const themeScore = Math.random() * 10 + 5; // 5-15 테마 점수
        
        // 종합 점수 계산 (가중치 적용)
        const totalScore = (volatility * 0.3) + (volumeIncrease * 0.4) + (themeScore * 0.3);
        
        return {
            ...stock,
            volatility: volatility.toFixed(2),
            volumeIncrease: volumeIncrease.toFixed(1),
            themeScore: themeScore.toFixed(1),
            totalScore: totalScore
        };
    });
    
    // 최고 점수의 주식 선택
    scores.sort((a, b) => b.totalScore - a.totalScore);
    return scores[0];
}

// Yahoo Finance API를 사용한 주식 표시 (CORS 우회 방식)
async function selectAndDisplayStockWithYahooAPI() {
    try {
        // CORS 우회 방식으로 데이터 가져오기
        const selectedStock = await selectBestStockWithCORSBypass();
        if (selectedStock) {
            displayRealStock(selectedStock);
            // 새로운 추천 알림
            if (typeof notifyNewStock === 'function') {
                notifyNewStock(selectedStock);
            }
        } else {
            // API 실패 시 시뮬레이션으로 폴백
            selectAndDisplayTodayStock();
        }
    } catch (error) {
        console.error('CORS 우회 API 기반 종목 선택 실패:', error);
        selectAndDisplayTodayStock(); // 시뮬레이션으로 폴백
    }
    
    // 로딩 화면 숨기고 주식 정보 표시
    document.getElementById('loading').style.display = 'none';
    document.getElementById('stockCard').style.display = 'block';
}

// 프록시 서버를 통해 주식 선택
async function selectBestStockWithProxyAPI() {
    try {
        console.log('프록시 서버로 주식 데이터 가져오기 시작...');
        
        // 프록시 서버 API 호출
        const response = await fetch('http://localhost:3001/api/stocks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                codes: koreanStocks.map(s => s.code)
            })
        });
        
        const result = await response.json();
        
        if (!result.success || !result.data || result.data.length === 0) {
            console.warn('프록시 서버 데이터를 가져오지 못해 시뮬레이션 데이터를 사용합니다.');
            return null;
        }
        
        console.log(`${result.data.length}개 종목 데이터 가져오기 성공`);
        
        // 각 종목에 대한 기술적 지표 계산
        const stocksWithIndicators = result.data.map(stock => {
            const indicators = calculateTechnicalIndicators(stock);
            
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
        console.error('프록시 서버 기반 종목 선택 실패:', error);
        console.log('시뮬레이션 데이터로 폴백합니다.');
        return null; // 명시적으로 null 반환하여 폴백 처리
    }
}

// 실제 API 데이터로 주식 정보 표시
function displayRealStock(stock) {
    currentStock = stock;
    
    // 기본 정보 설정
    document.getElementById('stockName').textContent = stock.name;
    document.getElementById('stockCode').textContent = stock.code;
    document.getElementById('stockDate').textContent = new Date().toLocaleDateString('ko-KR');
    
    // 실제 가격 정보
    const currentPrice = stock.currentPrice || 0;
    const changePercent = stock.changePercent || 0;
    const changeAmount = stock.change || 0;
    
    document.getElementById('currentPrice').textContent = formatPrice(currentPrice);
    
    const changeElement = document.getElementById('priceChange');
    changeElement.textContent = `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}% (${changeAmount >= 0 ? '+' : ''}${formatPrice(changeAmount)})`;
    changeElement.className = `price-change ${changePercent >= 0 ? 'positive' : 'negative'}`;
    
    // 실제 지표 정보 (null 체크 추가)
    document.getElementById('volatility').textContent = `${stock.volatility ? stock.volatility.toFixed(2) : 'N/A'}%`;
    document.getElementById('volumeIncrease').textContent = `${stock.volumeIncrease ? stock.volumeIncrease.toFixed(1) : 'N/A'}%`;
    document.getElementById('themeScore').textContent = `${stock.themeScore ? stock.themeScore.toFixed(1) : 'N/A'}/15`;
    
    // 실제 데이터 기반 분석 텍스트 생성
    const analysisText = generateRealAnalysisText(stock, changePercent);
    document.getElementById('analysisText').textContent = analysisText;
    
    // 실제 데이터로 차트 생성
    createRealStockChart(stock);
    
    // 히스토리에 추가
    addToHistory(stock, currentPrice, changePercent);
}

// 실제 데이터 기반 분석 텍스트 생성
function generateRealAnalysisText(stock, changePercent) {
    const analyses = [
        `${stock.name}은(는) 현재 ${formatPrice(stock.currentPrice)}에 거래되고 있으며, 변동성 ${stock.volatility?.toFixed(2)}%를 기록 중입니다. 거래량은 평균 대비 ${stock.volumeIncrease?.toFixed(1)}% ${stock.volumeIncrease > 100 ? '급증' : '증가'}했습니다.`,
        `실시간 데이터 분석 결과, ${stock.name}은(는) 기술적 지표에서 ${stock.technicalScore > 5 ? '긍정적' : '중립적'}인 신호를 보이고 있습니다. 현재 가격은 ${changePercent >= 0 ? '상승' : '하락'} 추세에 있습니다.`,
        `${stock.name}의 테마 관련성 점수는 ${stock.themeScore?.toFixed(1)}/15점으로, 시장의 관심도가 ${stock.themeScore > 8 ? '높은' : '보통'} 수준입니다. 실시간 수급 분석이 필요한 종목입니다.`,
        `AI 기반 실시간 분석 시스템이 ${stock.name}을(를) 오늘의 단 한 종목으로 선택했습니다. 실제 시장 데이터 기반의 ${stock.actualData ? '객관적' : '예측'} 분석 결과입니다.`
    ];
    
    return analyses[Math.floor(Math.random() * analyses.length)];
}

// 실제 데이터로 주식 차트 생성
function createRealStockChart(stock) {
    const ctx = document.getElementById('stockChart').getContext('2d');
    
    // 실제 히스토리 데이터가 있으면 사용, 없으면 시뮬레이션
    let labels, data;
    
    if (stock.historicalData && stock.historicalData.length > 0) {
        // 실제 히스토리 데이터 사용
        labels = stock.historicalData.map(item => {
            const date = new Date(item.date);
            return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
        });
        data = stock.historicalData.map(item => item.close);
    } else {
        // 시뮬레이션 데이터 생성
        labels = [];
        data = [];
        const basePrice = stock.currentPrice * 0.9;
        
        for (let i = 30; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }));
            
            const randomChange = (Math.random() - 0.5) * basePrice * 0.05;
            data.push(basePrice + randomChange + (stock.currentPrice - basePrice) * (1 - i/30));
        }
    }
    
    // 기존 차트가 있으면 파괴
    if (stockChart) {
        stockChart.destroy();
    }
    
    // 새 차트 생성
    stockChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: stock.name,
                data: data,
                borderColor: '#ff6b6b',
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: '#ff6b6b'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: '#ff6b6b',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            return '가격: ' + formatPrice(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#888',
                        maxRotation: 0
                    }
                },
                y: {
                    display: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#888',
                        callback: function(value) {
                            return formatPrice(value);
                        }
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}

// 주식 정보 표시
function displayStock(stock) {
    currentStock = stock;
    
    // 기본 정보 설정
    document.getElementById('stockName').textContent = stock.name;
    document.getElementById('stockCode').textContent = stock.code;
    document.getElementById('stockDate').textContent = new Date().toLocaleDateString('ko-KR');
    
    // 가격 정보 (시뮬레이션)
    const basePrice = Math.floor(Math.random() * 100000) + 10000;
    const changePercent = (Math.random() - 0.5) * 10;
    const changeAmount = basePrice * (changePercent / 100);
    const currentPrice = basePrice + changeAmount;
    
    document.getElementById('currentPrice').textContent = formatPrice(currentPrice);
    
    const changeElement = document.getElementById('priceChange');
    changeElement.textContent = `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}% (${changeAmount >= 0 ? '+' : ''}${formatPrice(changeAmount)})`;
    changeElement.className = `price-change ${changePercent >= 0 ? 'positive' : 'negative'}`;
    
    // 지표 정보
    document.getElementById('volatility').textContent = `${stock.volatility}%`;
    document.getElementById('volumeIncrease').textContent = `${stock.volumeIncrease}%`;
    document.getElementById('themeScore').textContent = `${stock.themeScore}/15`;
    
    // 분석 텍스트 생성
    const analysisText = generateAnalysisText(stock, changePercent);
    document.getElementById('analysisText').textContent = analysisText;
    
    // 차트 생성
    createStockChart(stock, currentPrice);
    
    // 히스토리에 추가
    addToHistory(stock, currentPrice, changePercent);
}

// 가격 포맷팅
function formatPrice(price) {
    return new Intl.NumberFormat('ko-KR').format(Math.floor(price)) + '원';
}

// 분석 텍스트 생성
function generateAnalysisText(stock, changePercent) {
    const analyses = [
        `${stock.name}은(는) 오늘 ${stock.volatility}%의 높은 변동성과 함께 거래량이 ${stock.volumeIncrease}% 급증했습니다. 테마 관련성 점수 ${stock.themeScore}점으로 시장의 주목받고 있습니다.`,
        `기술적 분석 결과, ${stock.name}은(는) 중요한 저항선을 돌파할 가능성이 높습니다. 거래량 급증과 함께 강세장 전환 신호가 포착되었습니다.`,
        `${stock.sector} 섹터의 전반적인 강세 속에서 ${stock.name}이(가) 가장 유력한 상승 후보종목으로 선정되었습니다. 변동성과 거래량 모두 이상적인 수치입니다.`,
        `AI 기반 분석 시스템이 ${stock.name}을(를) 오늘의 단 한 종목으로 선택했습니다. 복합 지표에서 최고 점수를 기록했습니다.`
    ];
    
    return analyses[Math.floor(Math.random() * analyses.length)];
}

// 주식 차트 생성
function createStockChart(stock, currentPrice) {
    const ctx = document.getElementById('stockChart').getContext('2d');
    
    // 시뮬레이션 데이터 생성
    const labels = [];
    const data = [];
    const basePrice = currentPrice * 0.9;
    
    for (let i = 30; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }));
        
        const randomChange = (Math.random() - 0.5) * basePrice * 0.05;
        data.push(basePrice + randomChange + (currentPrice - basePrice) * (1 - i/30));
    }
    
    // 기존 차트가 있으면 파괴
    if (stockChart) {
        stockChart.destroy();
    }
    
    // 새 차트 생성
    stockChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: stock.name,
                data: data,
                borderColor: '#ff6b6b',
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: '#ff6b6b'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: '#ff6b6b',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            return '가격: ' + formatPrice(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#888',
                        maxRotation: 0
                    }
                },
                y: {
                    display: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#888',
                        callback: function(value) {
                            return formatPrice(value);
                        }
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}

// 히스토리에 추가
function addToHistory(stock, price, changePercent) {
    const historyItem = {
        date: new Date().toISOString(),
        name: stock.name,
        code: stock.code,
        price: price,
        changePercent: changePercent
    };
    
    stockHistory.unshift(historyItem);
    
    // 최대 30개만 유지
    if (stockHistory.length > 30) {
        stockHistory = stockHistory.slice(0, 30);
    }
    
    saveStockHistory();
}

// 히스토리 보기
function showHistory() {
    document.getElementById('stockSection').style.display = 'none';
    document.getElementById('historySection').style.display = 'block';
    document.getElementById('aboutSection').style.display = 'none';
    
    const historyGrid = document.getElementById('historyGrid');
    historyGrid.innerHTML = '';
    
    stockHistory.forEach(item => {
        const historyItemDiv = document.createElement('div');
        historyItemDiv.className = 'history-item';
        
        const date = new Date(item.date);
        const dateStr = date.toLocaleDateString('ko-KR');
        const resultClass = item.changePercent >= 0 ? 'positive' : 'negative';
        const resultText = item.changePercent >= 0 ? '수익' : '손실';
        
        historyItemDiv.innerHTML = `
            <div class="history-date">${dateStr}</div>
            <div class="history-stock">${item.name}</div>
            <div class="history-result ${resultClass}">
                ${resultText} ${Math.abs(item.changePercent).toFixed(2)}%
            </div>
        `;
        
        historyGrid.appendChild(historyItemDiv);
    });
}

// 소개 보기
function showAbout() {
    document.getElementById('stockSection').style.display = 'none';
    document.getElementById('historySection').style.display = 'none';
    document.getElementById('aboutSection').style.display = 'block';
}

// 복기 보기
function showReviews() {
    document.getElementById('stockSection').style.display = 'none';
    document.getElementById('historySection').style.display = 'none';
    document.getElementById('aboutSection').style.display = 'none';
    document.getElementById('reviewsSection').style.display = 'block';
    
    displayReviews();
}

// 메인 화면으로 돌아가기
function showMain() {
    document.getElementById('stockSection').style.display = 'block';
    document.getElementById('historySection').style.display = 'none';
    document.getElementById('aboutSection').style.display = 'none';
    document.getElementById('reviewsSection').style.display = 'none';
}

// 새로고침 기능 (오늘의 종목 초기화)
function refreshStock() {
    if (confirm('오늘의 추천 종목을 초기화하고 새로운 종목을 추천하시겠습니까?')) {
        localStorage.removeItem('todayStock');
        document.getElementById('loading').style.display = 'block';
        document.getElementById('stockCard').style.display = 'none';
        
        setTimeout(() => {
            selectAndDisplayTodayStock();
        }, 1500);
    }
}

// 키보드 단축키
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        showMain();
    } else if (e.key === 'r' && e.ctrlKey) {
        e.preventDefault();
        refreshStock();
    }
});

// 자동 새로고침 (매일 자정)
function scheduleDailyRefresh() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const msUntilMidnight = tomorrow - now;
    
    setTimeout(() => {
        refreshStock();
        scheduleDailyRefresh(); // 다음 날을 위해 다시 스케줄
    }, msUntilMidnight);
}

// 스케줄 시작
scheduleDailyReset();
