// CORS 우회 방식 Yahoo Finance API - 백엔드 없이 실시간 데이터 가져오기

class CorsBypassAPI {
    constructor() {
        this.baseURL = 'https://query1.finance.yahoo.com/v8/finance/chart';
        this.quoteURL = 'https://query1.finance.yahoo.com/v7/finance/quote';
        // 여러 CORS 우회 프록시 (하나 실패 시 다른 것 사용)
        this.proxies = [
            'https://cors-anywhere.herokuapp.com/',
            'https://api.allorigins.win/raw?url=',
            'https://corsproxy.io/?'
        ];
    }

    // 한국 종목 코드를 Yahoo Finance 형식으로 변환
    convertToYahooSymbol(koreanCode) {
        return koreanCode + '.KS';
    }

    // 여러 프록시 시도하여 API 호출
    async fetchWithMultipleProxies(url) {
        for (let i = 0; i < this.proxies.length; i++) {
            try {
                const proxyUrl = this.proxies[i] + encodeURIComponent(url);
                console.log(`프록시 ${i + 1} 시도:`, this.proxies[i]);
                
                const response = await fetch(proxyUrl, {
                    method: 'GET',
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                
                const data = await response.json();
                console.log(`프록시 ${i + 1} 성공`);
                return data;
                
            } catch (error) {
                console.warn(`프록시 ${i + 1} 실패:`, error.message);
                if (i === this.proxies.length - 1) {
                    throw new Error('모든 프록시 실패');
                }
            }
        }
    }

    // JSONP 방식으로 CORS 우회 (최후의 수단)
    async fetchWithJSONP(url) {
        return new Promise((resolve, reject) => {
            const callbackName = 'jsonp_callback_' + Date.now() + '_' + Math.random();
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
            }, 15000);
        });
    }

    // 주식 데이터 가져오기
    async fetchStockData(code) {
        const yahooSymbol = this.convertToYahooSymbol(code);
        
        try {
            console.log(`종목 데이터 가져오기: ${code} (${yahooSymbol})`);
            
            // 차트 데이터 가져오기
            const chartUrl = `${this.baseURL}/${yahooSymbol}?range=30d&interval=1d&includePrePost=true`;
            const chartData = await this.fetchWithMultipleProxies(chartUrl);
            
            // 실시간 가격 데이터 가져오기
            const quoteUrl = `${this.quoteURL}?symbols=${yahooSymbol}&fields=regularMarketPrice,regularMarketChange,regularMarketChangePercent,regularMarketVolume`;
            const quoteData = await this.fetchWithMultipleProxies(quoteUrl);
            
            return this.formatYahooData(chartData, quoteData, yahooSymbol);
            
        } catch (error) {
            console.error(`종목 ${code} 데이터 가져오기 실패:`, error);
            
            // 최후의 수단으로 JSONP 시도
            try {
                console.log('JSONP 방식으로 재시도...');
                const chartUrl = `${this.baseURL}/${yahooSymbol}?range=30d&interval=1d&includePrePost=true`;
                const chartData = await this.fetchWithJSONP(chartUrl);
                return this.formatYahooData(chartData, null, yahooSymbol);
            } catch (jsonpError) {
                console.error(`종목 ${code} JSONP도 실패:`, jsonpError);
                return null;
            }
        }
    }

    // Yahoo Finance 데이터 포맷팅
    formatYahooData(chartData, quoteData, symbol) {
        try {
            const chart = chartData.chart;
            const quote = quoteData && quoteData.quoteResponse && quoteData.quoteResponse.result ? 
                         quoteData.quoteResponse.result[0] : null;
            
            if (!chart || !chart.result || chart.result.length === 0) {
                throw new Error('차트 데이터 없음');
            }
            
            const result = chart.result[0];
            const timestamps = result.timestamp || [];
            const quotes = result.indicators.quote[0] || {};
            const meta = result.meta || {};
            
            // 차트 데이터 생성
            const chartDataPoints = timestamps.map((timestamp, index) => ({
                x: new Date(timestamp * 1000),
                y: quotes.close[index] || 0,
                volume: quotes.volume[index] || 0
            })).filter(point => point.y > 0);
            
            // 현재 가격 정보
            let currentPrice = meta.regularMarketPrice || 0;
            let change = meta.regularMarketChange || 0;
            let changePercent = meta.regularMarketChangePercent || 0;
            let volume = meta.regularMarketVolume || 0;
            
            // quote 데이터가 있으면 더 정확한 정보 사용
            if (quote) {
                currentPrice = quote.regularMarketPrice || currentPrice;
                change = quote.regularMarketChange || change;
                changePercent = quote.regularMarketChangePercent || changePercent;
                volume = quote.regularMarketVolume || volume;
            }
            
            return {
                symbol: symbol,
                name: quote?.longName || quote?.shortName || symbol.replace('.KS', ''),
                currentPrice: currentPrice,
                change: change,
                changePercent: changePercent,
                volume: volume,
                chartData: chartDataPoints,
                lastUpdate: new Date(),
                actualData: true
            };
            
        } catch (error) {
            console.error('데이터 포맷팅 실패:', error);
            return null;
        }
    }

    // 여러 종목 데이터 한번에 가져오기
    async fetchMultipleStocks(codes) {
        console.log(`${codes.length}개 종목 데이터 동시 요청 시작...`);
        
        const promises = codes.map(code => this.fetchStockData(code));
        const results = await Promise.allSettled(promises);
        
        const successfulResults = results.map(result => {
            if (result.status === 'fulfilled') {
                return result.value;
            } else {
                console.error(`종목 데이터 가져오기 실패:`, result.reason);
                return null;
            }
        }).filter(data => data !== null);
        
        console.log(`${successfulResults.length}/${codes.length}개 종목 데이터 성공`);
        return successfulResults;
    }
}

// 전역 인스턴스
const corsBypassAPI = new CorsBypassAPI();

// CORS 우회 방식으로 최고 종목 선택
async function selectBestStockWithCORSBypass() {
    try {
        console.log('CORS 우회 방식으로 주식 데이터 가져오기 시작...');
        
        // 한국 주식 목록 (대형주 우선)
        const koreanStocks = [
            { code: '005930', name: '삼성전자' },
            { code: '000660', name: 'SK하이닉스' },
            { code: '373220', name: 'LG에너지솔루션' },
            { code: '207940', name: '삼성바이오로직스' },
            { code: '247540', name: '에코프로비엠' },
            { code: '051910', name: 'LG화학' },
            { code: '005490', name: 'POSCO홀딩스' },
            { code: '035420', name: 'NAVER' }
        ];
        
        // 여러 종목 데이터 동시에 가져오기
        const stockData = await corsBypassAPI.fetchMultipleStocks(koreanStocks.map(s => s.code));
        
        if (!stockData || stockData.length === 0) {
            console.warn('실시간 데이터를 가져오지 못해 시뮬레이션 데이터를 사용합니다.');
            return null;
        }
        
        console.log(`${stockData.length}개 종목 실시간 데이터 가져오기 성공`);
        
        // 각 종목에 대한 기술적 지표 계산
        const stocksWithIndicators = stockData.map(stock => {
            const indicators = calculateTechnicalIndicators(stock);
            
            return {
                ...stock,
                code: stock.symbol.replace('.KS', ''),
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
        
        console.log('✅ CORS 우회 성공! 선택된 최고 종목:', bestStock.name, '점수:', bestStock.totalScore.toFixed(2));
        return bestStock;
        
    } catch (error) {
        console.error('❌ CORS 우회 방식 종목 선택 실패:', error);
        console.log('시뮬레이션 데이터로 폴백합니다.');
        return null;
    }
}
