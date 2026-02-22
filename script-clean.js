// 전역 변수
let stockChart = null;
let currentStock = null;
let stockHistory = [];

// 한국 주식 데이터
const koreanStocks = [
    { code: '005930', name: '삼성전자', sector: '전자' },
    { code: '000660', name: 'SK하이닉스', sector: '전자' },
    { code: '373220', name: 'LG에너지솔루션', sector: '전자' },
    { code: '207940', name: '삼성바이오로직스', sector: '바이오' },
    { code: '247540', name: '에코프로비엠', sector: '전지' },
    { code: '051910', name: 'LG화학', sector: '화학' },
    { code: '005490', name: 'POSCO홀딩스', sector: '철강' },
    { code: '035420', name: 'NAVER', sector: 'IT' },
    { code: '068270', name: '셀트리온', sector: '바이오' },
    { code: '000270', name: '기아', sector: '자동차' }
];

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    loadStockHistory();
    loadTodayStock();
    setTimeout(() => {
        // CORS 우회 방식으로 실시간 API 사용
        selectAndDisplayStockWithCORSBypass();
    }, 2000);
});

// 오늘의 추천 종목 로드
function loadTodayStock() {
    const today = new Date().toDateString();
    const saved = localStorage.getItem('todayStock');
    
    if (saved) {
        try {
            const data = JSON.parse(saved);
            if (data.date === today) {
                console.log('오늘의 추천 종목 로드됨:', data.stock?.name);
                if (data.stock) {
                    displayStock(data.stock);
                    return;
                }
            }
        } catch (error) {
            console.error('저장된 데이터 파싱 실패:', error);
        }
    }
    
    console.log('오늘의 추천 종목 없음, 새로 생성');
    selectAndDisplayTodayStock();
}

// CORS 우회 방식으로 주식 표시
async function selectAndDisplayStockWithCORSBypass() {
    try {
        console.log('CORS 우회 방식으로 주식 데이터 가져오기 시작...');
        
        const selectedStock = await selectBestStockWithCORSBypass();
        if (selectedStock) {
            displayRealStock(selectedStock);
            if (typeof notifyNewStock === 'function') {
                notifyNewStock(selectedStock);
            }
        } else {
            console.log('실시간 데이터 실패, 시뮬레이션으로 폴백');
            selectAndDisplayTodayStock();
        }
    } catch (error) {
        console.error('CORS 우회 API 실패:', error);
        selectAndDisplayTodayStock();
    }
    
    // 로딩 화면 숨기고 주식 정보 표시
    document.getElementById('loading').style.display = 'none';
    document.getElementById('stockCard').style.display = 'block';
}

// CORS 우회 방식으로 최고 종목 선택
async function selectBestStockWithCORSBypass() {
    try {
        // cors-bypass-api.js의 함수 사용
        if (typeof selectBestStockWithCORSBypass === 'function') {
            return await window.selectBestStockWithCORSBypass();
        } else {
            console.warn('CORS 우회 API를 찾을 수 없음');
            return null;
        }
    } catch (error) {
        console.error('CORS 우회 종목 선택 실패:', error);
        return null;
    }
}

// 시뮬레이션 데이터로 종목 선택
function selectAndDisplayTodayStock() {
    const selectedStock = generateTodayStock();
    displayStock(selectedStock);
    saveTodayStock(selectedStock);
}

// 오늘의 추천 종목 생성
function generateTodayStock() {
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const randomIndex = seed % koreanStocks.length;
    
    const selectedStock = koreanStocks[randomIndex];
    
    // 기술적 지표 계산
    const volatility = Math.random() * 5 + 1;
    const volumeIncrease = Math.random() * 50 + 10;
    const themeScore = Math.random() * 10 + 5;
    const technicalScore = Math.random() * 10 + 5;
    
    const totalScore = (volatility * 0.3) + (volumeIncrease * 0.4) + (themeScore * 0.2) + (technicalScore * 0.1);
    
    return {
        code: selectedStock.code,
        name: selectedStock.name,
        sector: selectedStock.sector,
        currentPrice: Math.floor(Math.random() * 100000) + 10000,
        change: (Math.random() - 0.5) * 10000,
        changePercent: (Math.random() - 0.5) * 10,
        volume: Math.floor(Math.random() * 10000000) + 1000000,
        volatility: volatility,
        volumeIncrease: volumeIncrease,
        themeScore: themeScore,
        technicalScore: technicalScore,
        totalScore: totalScore,
        actualData: false,
        lastUpdate: new Date()
    };
}

// 주식 정보 표시
function displayStock(stock) {
    currentStock = stock;
    
    // 기본 정보 설정
    const stockNameElement = document.getElementById('stockName');
    const stockCodeElement = document.getElementById('stockCode');
    const stockDateElement = document.getElementById('stockDate');
    
    if (stockNameElement) stockNameElement.textContent = stock.name;
    if (stockCodeElement) stockCodeElement.textContent = stock.code;
    if (stockDateElement) stockDateElement.textContent = new Date().toLocaleDateString('ko-KR');
    
    // 가격 정보
    const currentPrice = stock.currentPrice || 0;
    const changePercent = stock.changePercent || 0;
    const changeAmount = stock.change || 0;
    
    const currentPriceElement = document.getElementById('currentPrice');
    const changeElement = document.getElementById('priceChange');
    
    if (currentPriceElement) currentPriceElement.textContent = formatPrice(currentPrice);
    
    if (changeElement) {
        changeElement.textContent = `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}% (${changeAmount >= 0 ? '+' : ''}${formatPrice(changeAmount)})`;
        changeElement.className = `price-change ${changePercent >= 0 ? 'positive' : 'negative'}`;
    }
    
    // 거래량
    const volumeElement = document.getElementById('volume');
    if (volumeElement) volumeElement.textContent = formatVolume(stock.volume);
    
    // 기술적 지표
    const volatilityElement = document.getElementById('volatility');
    const volumeIncreaseElement = document.getElementById('volumeIncrease');
    const themeScoreElement = document.getElementById('themeScore');
    const technicalScoreElement = document.getElementById('technicalScore');
    
    if (volatilityElement) volatilityElement.textContent = `${stock.volatility?.toFixed(2) || 0}%`;
    if (volumeIncreaseElement) volumeIncreaseElement.textContent = `${stock.volumeIncrease?.toFixed(1) || 0}%`;
    if (themeScoreElement) themeScoreElement.textContent = stock.themeScore?.toFixed(1) || 0;
    if (technicalScoreElement) technicalScoreElement.textContent = stock.technicalScore?.toFixed(1) || 0;
    
    // 차트 생성
    createChart(stock);
    
    // 분석 리포트 생성
    generateAnalysis(stock);
    
    console.log('새로운 추천 종목 생성:', stock.name);
}

// 실시간 주식 정보 표시
function displayRealStock(stock) {
    displayStock(stock);
    saveTodayStock(stock);
}

// 오늘의 추천 종목 저장
function saveTodayStock(stock) {
    const today = new Date().toDateString();
    const data = {
        date: today,
        stock: stock
    };
    localStorage.setItem('todayStock', JSON.stringify(data));
    console.log('오늘의 추천 종목 저장됨:', stock.name);
}

// 주식 기록 로드
function loadStockHistory() {
    const saved = localStorage.getItem('stockHistory');
    if (saved) {
        try {
            stockHistory = JSON.parse(saved);
        } catch (error) {
            console.error('기록 파싱 실패:', error);
            stockHistory = [];
        }
    }
}

// 가격 포맷팅
function formatPrice(price) {
    if (price >= 1000000) {
        return (price / 1000000).toFixed(2) + '백만';
    } else if (price >= 10000) {
        return (price / 10000).toFixed(1) + '만';
    }
    return Math.floor(price).toLocaleString();
}

// 거래량 포맷팅
function formatVolume(volume) {
    if (volume >= 100000000) {
        return (volume / 100000000).toFixed(1) + '억';
    } else if (volume >= 10000) {
        return (volume / 10000).toFixed(0) + '만';
    }
    return Math.floor(volume).toLocaleString();
}

// 차트 생성
function createChart(stock) {
    const ctx = document.getElementById('stockChart');
    if (!ctx) {
        console.warn('stockChart 요소를 찾을 수 없음');
        return;
    }
    
    const chartCtx = ctx.getContext('2d');
    
    if (stockChart) {
        stockChart.destroy();
    }
    
    // 시뮬레이션 차트 데이터
    const labels = [];
    const data = [];
    const days = 30;
    
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }));
        
        const basePrice = stock.currentPrice || 50000;
        const variation = (Math.random() - 0.5) * basePrice * 0.1;
        data.push(basePrice + variation);
    }
    
    // 마지막 데이터는 현재 가격
    data[data.length - 1] = stock.currentPrice || 50000;
    
    stockChart = new Chart(chartCtx, {
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
                pointHoverRadius: 5
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
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#ff6b6b',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    display: true,
                    grid: {
                        display: false
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

// 기술적 지표 계산
function calculateTechnicalIndicators(stock) {
    return {
        volatility: stock.volatility || Math.random() * 5 + 1,
        volumeRatio: stock.volumeIncrease || Math.random() * 50 + 10,
        rsi: Math.random() * 100,
        macd: (Math.random() - 0.5) * 2
    };
}

// 기술적 점수 계산
function calculateTechnicalScore(indicators) {
    let score = 0;
    
    // RSI 기반 점수
    if (indicators.rsi < 30) score += 3; // 과매도
    else if (indicators.rsi > 70) score += 1; // 과매수
    else score += 2; // 중립
    
    // MACD 기반 점수
    if (indicators.macd > 0) score += 2;
    else score += 1;
    
    return score;
}

// 분석 리포트 생성
function generateAnalysis(stock) {
    const indicators = calculateTechnicalIndicators(stock);
    const analysisElement = document.getElementById('analysisText');
    
    if (!analysisElement) {
        console.warn('analysisText 요소를 찾을 수 없음');
        return;
    }
    
    let report = `<h3>📊 ${stock.name} 기술적 분석</h3>`;
    
    // 변동성 분석
    if (indicators.volatility > 3) {
        report += `<p>🔺 <strong>높은 변동성:</strong> 단기 변동성이 크며, 이는 큰 수익 기회와 함께 리스크도 의미합니다.</p>`;
    } else {
        report += `<p>🔸 <strong>안정적인 변동성:</strong> 비교적 안정적인 움직임을 보이며, 안정적인 투자를 선호하는 투자자에게 적합합니다.</p>`;
    }
    
    // 거래량 분석
    if (indicators.volumeRatio > 30) {
        report += `<p>📈 <strong>거래량 급증:</strong> 최근 거래량이 크게 증가했으며, 시장의 관심이 높아짐을 의미합니다.</p>`;
    } else {
        report += `<p>📊 <strong>평균 거래량:</strong> 거래량이 평균 수준을 유지하며, 시장의 관심이 안정적입니다.</p>`;
    }
    
    // RSI 분석
    if (indicators.rsi < 30) {
        report += `<p>⚠️ <strong>과매도 구간:</strong> RSI가 ${indicators.rsi.toFixed(1)}로 과매도 구간에 진입했으며, 반등 가능성이 있습니다.</p>`;
    } else if (indicators.rsi > 70) {
        report += `<p>⚠️ <strong>과매수 구간:</strong> RSI가 ${indicators.rsi.toFixed(1)}로 과매수 구간에 진입했으며, 조정 가능성이 있습니다.</p>`;
    } else {
        report += `<p>✅ <strong>중립 구간:</strong> RSI가 ${indicators.rsi.toFixed(1)}로 중립 구간에 위치하며, 현재 추세 유지가 가능합니다.</p>`;
    }
    
    // 종합 의견
    const score = stock.totalScore || 5;
    if (score > 7) {
        report += `<p><strong>🎯 투자 의견:</strong> 기술적 지표가 긍정적이며, 상승 가능성이 높습니다. 단기 매수 고려.</p>`;
    } else if (score > 5) {
        report += `<p><strong>🎯 투자 의견:</strong> 기술적 지표가 중립적이며, 현 추세 관찰 필요. 신중한 접근 권장.</p>`;
    } else {
        report += `<p><strong>🎯 투자 의견:</strong> 기술적 지표가 부정적이며, 하락 리스크가 있습니다. 매도 보유 권장.</p>`;
    }
    
    // 데이터 출처
    const dataSource = stock.actualData ? '실시간 Yahoo Finance API' : '시뮬레이션 데이터';
    report += `<p class="data-source">📡 데이터 출처: ${dataSource} | 업데이트: ${new Date().toLocaleString('ko-KR')}</p>`;
    
    analysisElement.innerHTML = report;
}

// 기타 유틸리티 함수들
function showHistory() {
    // 히스토리 표시 로직
    console.log('히스토리 표시');
}

function showReviews() {
    // 복기 표시 로직
    console.log('복기 표시');
}

function showAbout() {
    // 소개 표시 로직
    console.log('소개 표시');
}

// 키보드 이벤트
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        // ESC 키 처리
        console.log('ESC 키 눌림');
    }
});
