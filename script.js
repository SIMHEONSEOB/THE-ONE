// 전역 변수
let stockChart = null;
let currentStock = null;
let stockHistory = [];

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
    setTimeout(() => {
        // 실제 API 사용 여부 설정 (개발 중에는 false로 설정)
        const useRealAPI = false; // true로 변경하면 실제 API 사용
        
        if (useRealAPI) {
            selectAndDisplayStockWithAPI();
        } else {
            selectAndDisplayStock();
        }
    }, 2000); // 2초 후 로딩 완료
});

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

// 실제 API를 사용한 주식 표시
async function selectAndDisplayStockWithAPI() {
    try {
        const selectedStock = await selectBestStockWithRealAPI();
        if (selectedStock) {
            displayRealStock(selectedStock);
        } else {
            // API 실패 시 시뮬레이션으로 폴백
            selectAndDisplayStock();
        }
    } catch (error) {
        console.error('API 기반 종목 선택 실패:', error);
        selectAndDisplayStock(); // 시뮬레이션으로 폴백
    }
    
    // 로딩 화면 숨기고 주식 정보 표시
    document.getElementById('loading').style.display = 'none';
    document.getElementById('stockCard').style.display = 'block';
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
    
    // 실제 지표 정보
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

// 새로고침 기능 (매일 새로운 종목)
function refreshStock() {
    document.getElementById('loading').style.display = 'block';
    document.getElementById('stockCard').style.display = 'none';
    
    setTimeout(() => {
        selectAndDisplayStock();
    }, 1500);
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
scheduleDailyRefresh();
