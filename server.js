// CORS 문제 해결을 위한 Node.js 프록시 서버
// Yahoo Finance API에 대한 CORS 우회 및 실시간 데이터 제공

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// 미들웨어 설정
app.use(cors({
    origin: ['http://localhost:8000', 'http://127.0.0.1:8000', 'http://localhost:52589'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// API 캐싱 (성능 향상)
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5분 캐시

// 한국 주식 데이터 캐싱 키 생성
function getCacheKey(code) {
    const now = new Date();
    const dateKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
    return `stock_${code}_${dateKey}`;
}

// Yahoo Finance API로 주식 데이터 가져오기
async function fetchStockData(code) {
    const cacheKey = getCacheKey(code);
    
    // 캐시 확인
    if (cache.has(cacheKey)) {
        const cached = cache.get(cacheKey);
        if (Date.now() - cached.timestamp < CACHE_DURATION) {
            console.log(`Cache hit for ${code}`);
            return cached.data;
        }
    }
    
    try {
        const yahooSymbol = code + '.KS';
        
        // Yahoo Finance Chart API
        const chartResponse = await axios.get(
            `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?range=30d&interval=1d&includePrePost=true`,
            {
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            }
        );
        
        // Yahoo Finance Quote API
        const quoteResponse = await axios.get(
            `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${yahooSymbol}&fields=regularMarketPrice,regularMarketChange,regularMarketChangePercent,regularMarketVolume,marketCap,regularMarketDayHigh,regularMarketDayLow,regularMarketOpen,chartPreviousClose`,
            {
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            }
        );
        
        const data = formatYahooData(chartResponse.data, quoteResponse.data, yahooSymbol);
        
        // 캐시 저장
        cache.set(cacheKey, {
            data: data,
            timestamp: Date.now()
        });
        
        console.log(`Fetched fresh data for ${code}`);
        return data;
        
    } catch (error) {
        console.error(`Error fetching data for ${code}:`, error.message);
        return null;
    }
}

// Yahoo Finance 데이터 포맷팅
function formatYahooData(chartData, quoteData, symbol) {
    try {
        const chart = chartData.chart;
        if (!chart || !chart.result || chart.result.length === 0) {
            return null;
        }
        
        const result = chart.result[0];
        const timestamps = result.timestamp;
        const quotes = result.indicators.quote[0];
        const meta = result.meta;
        
        let currentPrice = meta.regularMarketPrice || 0;
        let change = meta.regularMarketChange || 0;
        let changePercent = meta.regularMarketChangePercent || 0;
        let volume = meta.regularMarketVolume || 0;
        let marketCap = meta.marketCap || 0;
        let highPrice = meta.regularMarketDayHigh || 0;
        let lowPrice = meta.regularMarketDayLow || 0;
        let openPrice = meta.regularMarketOpen || 0;
        let previousClose = meta.chartPreviousClose || 0;
        
        // Quote 데이터가 더 최신이면 업데이트
        if (quoteData && quoteData.quoteResponse && quoteData.quoteResponse.result.length > 0) {
            const quote = quoteData.quoteResponse.result[0];
            currentPrice = quote.regularMarketPrice || currentPrice;
            change = quote.regularMarketChange || change;
            changePercent = quote.regularMarketChangePercent || changePercent;
            volume = quote.regularMarketVolume || volume;
            marketCap = quote.marketCap || marketCap;
            highPrice = quote.regularMarketDayHigh || highPrice;
            lowPrice = quote.regularMarketDayLow || lowPrice;
            openPrice = quote.regularMarketOpen || openPrice;
            previousClose = quote.chartPreviousClose || previousClose;
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
        }).filter(item => item.close > 0);
        
        // 종목명 매핑
        const stockNameMap = {
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
        
        const stockCode = symbol.replace('.KS', '');
        const stockName = stockNameMap[stockCode] || `종목 ${stockCode}`;
        
        return {
            code: stockCode,
            name: stockName,
            symbol: symbol,
            currentPrice: currentPrice,
            change: change,
            changePercent: changePercent,
            volume: volume,
            marketCap: marketCap,
            highPrice: highPrice,
            lowPrice: lowPrice,
            openPrice: openPrice,
            previousClose: previousClose,
            currency: meta.currency || 'KRW',
            historicalData: historicalData,
            actualData: true,
            source: 'Yahoo Finance API',
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('Yahoo Finance 데이터 포맷팅 실패:', error);
        return null;
    }
}

// API 엔드포인트들

// 단일 종목 데이터 가져오기
app.get('/api/stock/:code', async (req, res) => {
    try {
        const { code } = req.params;
        console.log(`Fetching stock data for: ${code}`);
        
        const data = await fetchStockData(code);
        
        if (data) {
            res.json({
                success: true,
                data: data,
                timestamp: new Date().toISOString()
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'Stock data not found',
                code: code
            });
        }
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

// 여러 종목 데이터 한번에 가져오기
app.post('/api/stocks', async (req, res) => {
    try {
        const { codes } = req.body;
        
        if (!codes || !Array.isArray(codes)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid codes array'
            });
        }
        
        console.log(`Fetching multiple stocks: ${codes.join(', ')}`);
        
        const promises = codes.map(code => fetchStockData(code));
        const results = await Promise.allSettled(promises);
        
        const successfulData = results
            .filter(result => result.status === 'fulfilled' && result.value !== null)
            .map(result => result.value);
        
        const failedCodes = results
            .filter(result => result.status === 'rejected' || result.value === null)
            .map((result, index) => codes[index]);
        
        res.json({
            success: true,
            data: successfulData,
            failed: failedCodes,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

// 캐시 상태 확인
app.get('/api/cache/status', (req, res) => {
    const cacheStats = {
        totalEntries: cache.size,
        entries: Array.from(cache.entries()).map(([key, value]) => ({
            key,
            timestamp: value.timestamp,
            age: Date.now() - value.timestamp
        }))
    };
    
    res.json({
        success: true,
        cache: cacheStats
    });
});

// 캐시 초기화
app.delete('/api/cache/clear', (req, res) => {
    cache.clear();
    console.log('Cache cleared');
    res.json({
        success: true,
        message: 'Cache cleared successfully'
    });
});

// 서버 상태 확인
app.get('/api/status', (req, res) => {
    res.json({
        success: true,
        server: 'The One API Proxy Server',
        version: '1.0.0',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        cache: {
            size: cache.size,
            duration: CACHE_DURATION / 1000
        }
    });
});

// 정적 파일 제공 (클라이언트)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 에러 핸들링 미들웨어
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message
    });
});

// 404 핸들링
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.path
    });
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`🚀 The One API Server is running on port ${PORT}`);
    console.log(`📡 Frontend should be available at: http://localhost:8000`);
    console.log(`🔗 API endpoints available at: http://localhost:${PORT}/api`);
    console.log(`📊 Server status: http://localhost:${PORT}/api/status`);
    console.log(`💾 Cache status: http://localhost:${PORT}/api/cache/status`);
});

// 정적 종료 시 캐시 저장
process.on('SIGINT', () => {
    console.log('\n🔄 Saving cache before shutdown...');
    // 여기서 캐시를 파일로 저장할 수 있음
    process.exit(0);
});

module.exports = app;
