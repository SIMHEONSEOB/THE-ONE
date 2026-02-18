// 한국거래소(KRX) 및 관련 API 연동 모듈
// 실제 한국 주식 데이터를 가져오기 위한 통합 솔루션

class KRXStockAPI {
    constructor() {
        // 한국투자증권 KIS API (개발자 계정 필요)
        this.kisBaseURL = 'https://openapi.koreainvestment.com:9443';
        this.kisAppKey = 'YOUR_KIS_APP_KEY'; // 한국투자증권에서 발급받은 키
        this.kisSecretKey = 'YOUR_KIS_SECRET_KEY';
        this.accessToken = null;
        this.tokenExpireTime = null;
        
        // Yahoo Finance API (무료 대안)
        this.yahooBaseURL = 'https://query1.finance.yahoo.com/v8/finance/chart';
        
        // Financial Modeling Prep API (무료 플랜: 일일 250회)
        this.fmpBaseURL = 'https://financialmodelingprep.com/api/v3';
        this.fmpApiKey = 'YOUR_FMP_API_KEY';
        
        // Alpha Vantage API (무료 플랜: 일일 500회)
        this.alphaVantageURL = 'https://www.alphavantage.co/query';
        this.alphaVantageKey = 'YOUR_ALPHA_VANTAGE_KEY';
    }

    // 한국투자증권 접근 토큰 발급
    async getKISAccessToken() {
        if (this.accessToken && this.tokenExpireTime > Date.now()) {
            return this.accessToken;
        }

        try {
            const response = await fetch(`${this.kisBaseURL}/oauth2/tokenP`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    grant_type: 'client_credentials',
                    appkey: this.kisAppKey,
                    secretkey: this.kisSecretKey
                })
            });

            const data = await response.json();
            this.accessToken = data.access_token;
            this.tokenExpireTime = Date.now() + (data.expires_in * 1000) - 60000; // 1분 여유
            
            return this.accessToken;
        } catch (error) {
            console.error('KIS 토큰 발급 실패:', error);
            return null;
        }
    }

    // 한국투자증권 API로 주식 현재가 정보 가져오기
    async fetchKISStockPrice(code) {
        const token = await this.getKISAccessToken();
        if (!token) return null;

        try {
            const response = await fetch(`${this.kisBaseURL}/uapi/domestic-stock/v1/quotations/inquire-price`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'appkey': this.kisAppKey,
                    'appsecret': this.kisSecretKey,
                    'tr_id': 'FHKST01010100'
                }
            });

            const data = await response.json();
            return this.formatKISPriceData(data);
        } catch (error) {
            console.error('KIS 주가 정보 조회 실패:', error);
            return null;
        }
    }

    // 한국투자증권 API로 일봉 데이터 가져오기
    async fetchKISDailyData(code, period = 30) {
        const token = await this.getKISAccessToken();
        if (!token) return null;

        try {
            const today = new Date();
            const startDate = new Date(today);
            startDate.setDate(startDate.getDate() - period);

            const response = await fetch(`${this.kisBaseURL}/uapi/domestic-stock/v1/quotations/inquire-daily-price`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'appkey': this.kisAppKey,
                    'appsecret': this.kisSecretKey,
                    'tr_id': 'FHKST03010100'
                }
            });

            const data = await response.json();
            return this.formatKISDailyData(data);
        } catch (error) {
            console.error('KIS 일봉 데이터 조회 실패:', error);
            return null;
        }
    }

    // Yahoo Finance API로 데이터 가져오기 (무료 대안)
    async fetchYahooFinanceData(code) {
        // 한국 종목 코드를 Yahoo Finance 형식으로 변환
        const yahooSymbol = code + '.KS'; // 예: 005930.KS (삼성전자)
        
        try {
            const response = await fetch(`${this.yahooBaseURL}/${yahooSymbol}?range=30d&interval=1d`);
            const data = await response.json();
            return this.formatYahooData(data, yahooSymbol);
        } catch (error) {
            console.error('Yahoo Finance 데이터 조회 실패:', error);
            return null;
        }
    }

    // Financial Modeling Prep API로 데이터 가져오기
    async fetchFMPData(code) {
        try {
            // 한국 주식은 미국 ADR로 변환하거나 다른 방식 필요
            const symbol = this.convertToUSADR(code);
            if (!symbol) return null;

            const [profileResponse, priceResponse] = await Promise.all([
                fetch(`${this.fmpBaseURL}/profile/${symbol}?apikey=${this.fmpApiKey}`),
                fetch(`${this.fmpBaseURL}/quote/${symbol}?apikey=${this.fmpApiKey}`)
            ]);

            const profile = await profileResponse.json();
            const price = await priceResponse.json();

            return this.formatFMPData(profile[0], price[0]);
        } catch (error) {
            console.error('FMP 데이터 조회 실패:', error);
            return null;
        }
    }

    // 한국 종목 코드를 미국 ADR 심볼로 변환
    convertToUSADR(koreanCode) {
        const adrMap = {
            '005930': 'SSNLF',    // 삼성전자
            '000660': 'HYNLF',    // SK하이닉스
            '035420': 'NHNCF',    // NAVER
            '051910': 'LGCLF',    // LG화학
            '005490': 'PKX',      // POSCO
            '068270': 'CELTF',    // 셀트리온
            '373220': 'LG Energy Solution', // LG에너지솔루션 (ADR 없음)
            '003550': 'LGEAF',    // LG
            '066570': 'LGEAF',    // LG전자 (LG와 동일)
            '017670': 'SKM',      // SK텔레콤
            '105560': 'KB',       // KB금융
            '055550': 'SHG',      // 신한지주
            '005935': 'SSNLF',    // 삼성생명 (삼성전자와 동일)
            '032830': 'SSNLF',    // 삼성화재 (삼성전자와 동일)
        };
        
        return adrMap[koreanCode] || null;
    }

    // KIS 가격 데이터 포맷팅
    formatKISPriceData(data) {
        if (!data.output) return null;
        
        const output = data.output;
        return {
            code: output.stck_shrn_iscd,
            name: output.stck_nm,
            currentPrice: parseInt(output.stck_prpr),
            changeAmount: parseInt(output.prdy_vrss),
            changePercent: parseFloat(output.prdy_ctrt),
            volume: parseInt(output.acml_vol),
            marketCap: parseInt(output.hts_avls),
            highPrice: parseInt(output.stck_hgpr),
            lowPrice: parseInt(output.stck_lwpr),
            openPrice: parseInt(output.stck_oprc),
            timestamp: new Date().toISOString()
        };
    }

    // KIS 일봉 데이터 포맷팅
    formatKISDailyData(data) {
        if (!data.output) return null;
        
        return data.output.map(item => ({
            date: item.stck_bsdt,
            open: parseInt(item.stck_oprc),
            high: parseInt(item.stck_hgpr),
            low: parseInt(item.stck_lwpr),
            close: parseInt(item.stck_clpr),
            volume: parseInt(item.acml_vol),
            changeAmount: parseInt(item.prdy_vrss),
            changePercent: parseFloat(item.prdy_ctrt)
        }));
    }

    // Yahoo Finance 데이터 포맷팅
    formatYahooData(data, symbol) {
        if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
            return null;
        }

        const result = data.chart.result[0];
        const timestamps = result.timestamp;
        const quotes = result.indicators.quote[0];
        const meta = result.meta;

        return {
            symbol: symbol,
            currency: meta.currency,
            currentPrice: meta.regularMarketPrice,
            previousClose: meta.chartPreviousClose,
            change: meta.regularMarketPrice - meta.chartPreviousClose,
            changePercent: ((meta.regularMarketPrice - meta.chartPreviousClose) / meta.chartPreviousClose) * 100,
            volume: meta.regularMarketVolume,
            historicalData: timestamps.map((timestamp, index) => ({
                date: new Date(timestamp * 1000).toISOString().split('T')[0],
                open: quotes.open[index],
                high: quotes.high[index],
                low: quotes.low[index],
                close: quotes.close[index],
                volume: quotes.volume[index]
            })).filter(item => item.open !== null)
        };
    }

    // FMP 데이터 포맷팅
    formatFMPData(profile, price) {
        return {
            symbol: profile.symbol,
            name: profile.companyName,
            sector: profile.sector,
            industry: profile.industry,
            currentPrice: price.price,
            change: price.change,
            changePercent: price.changesPercentage,
            volume: price.volume,
            marketCap: profile.mktCap,
            description: profile.description,
            website: profile.website,
            timestamp: new Date().toISOString()
        };
    }

    // 통합 주식 데이터 가져오기 (여러 API 시도)
    async fetchStockData(code) {
        // 1. 한국투자증권 API 시도 (가장 정확)
        let data = await this.fetchKISStockPrice(code);
        if (data) {
            const dailyData = await this.fetchKISDailyData(code);
            return { ...data, historicalData: dailyData };
        }

        // 2. Yahoo Finance API 시도 (무료)
        data = await this.fetchYahooFinanceData(code);
        if (data) {
            return data;
        }

        // 3. FMP API 시도 (ADR이 있는 경우)
        data = await this.fetchFMPData(code);
        if (data) {
            return data;
        }

        console.warn(`모든 API에서 ${code} 종목 데이터를 가져오지 못했습니다.`);
        return null;
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

    // 실시간 가격 업데이트
    async fetchRealTimePrice(code) {
        return await this.fetchStockData(code);
    }

    // 기술적 지표 계산 (실제 데이터 기반)
    calculateTechnicalIndicators(priceData) {
        if (!priceData || !priceData.historicalData || priceData.historicalData.length < 20) {
            return {
                sma20: null,
                sma60: null,
                rsi: null,
                macd: null,
                volumeRatio: null,
                volatility: null
            };
        }

        const prices = priceData.historicalData.map(d => d.close);
        const volumes = priceData.historicalData.map(d => d.volume);
        
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

// API 인스턴스 생성
const krxAPI = new KRXStockAPI();

// 실제 API를 사용한 주식 선택 함수
async function selectBestStockWithRealAPI() {
    try {
        console.log('실시간 API로 주식 데이터 가져오기 시작...');
        
        // 모든 종목 데이터 가져오기
        const stockData = await krxAPI.fetchMultipleStocks(koreanStocks.map(s => s.code));
        
        if (!stockData || stockData.length === 0) {
            console.warn('실제 API 데이터를 가져오지 못해 시뮬레이션 데이터를 사용합니다.');
            return selectBestStock(); // 기존 시뮬레이션 함수로 폴백
        }
        
        console.log(`${stockData.length}개 종목 데이터 가져오기 성공`);
        
        // 각 종목에 대한 기술적 지표 계산
        const stocksWithIndicators = stockData.map(stock => {
            const indicators = krxAPI.calculateTechnicalIndicators(stock);
            
            return {
                ...stock,
                code: stock.symbol || stock.code,
                name: stock.name || koreanStocks.find(s => s.code === stock.code)?.name || 'Unknown',
                volatility: indicators.volatility || 0,
                volumeIncrease: indicators.volumeRatio || 0,
                themeScore: Math.random() * 10 + 5, // 테마 점수는 별도 로직 필요
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
        console.error('실제 API 기반 종목 선택 실패:', error);
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

// 전역으로 함수 노출 (ES 모듈 문제 해결)
window.KRXStockAPI = KRXStockAPI;
window.krxAPI = krxAPI;
window.selectBestStockWithRealAPI = selectBestStockWithRealAPI;
