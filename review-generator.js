// 자동 복기 콘텐츠 생성기
// 실패한 추천 종목에 대한 솔직한 분석과 교훈을 자동으로 생성

class ReviewGenerator {
    constructor() {
        this.failureReasons = [
            '시장 상황의 급격한 변화',
            '예상치 못한 외부 악재',
            '테마의 일시적인 하락',
            '기술적 지표의 잘못된 신호',
            '과도한 낙관적 전망',
            '거래량의 일시적인 증가 후 하락',
            '연관 테마의 전반적인 약세',
            '시장 심리의 급격한 위축'
        ];
        
        this.successFactors = [
            '정확한 테마 포착',
            '기술적 지표의 정확한 신호',
            '거래량 급증의 정확한 예측',
            '시장 심리의 정확한 분석',
            '외부 호재의 적시 포착',
            '섹터 회복의 정확한 타이밍',
            '변동성 확대의 성공적인 활용',
            '수급 개선의 정확한 분석'
        ];
        
        this.lessons = [
            '변동성은 양날의 검입니다. 높은 변동성은 큰 수익을 가져다줄 수 있지만, 큰 손실의 가능성도 내포합니다.',
            '거래량 증가는 항상 긍정적 신호가 아닙니다. 일시적인 투기적 수요일 수 있습니다.',
            '테마 투자는 타이밍이 생명입니다. 테마의 인기가 정점에 달했을 때가 가장 위험한 시점일 수 있습니다.',
            '기술적 지표는 과거 데이터를 기반으로 합니다. 미래를 보장하지는 않습니다.',
            '시장은 항상 예측 가능하지 않습니다. 손실은 투자의 일부이며, 중요한 것은 손실을 최소화하고 교훈을 얻는 것입니다.',
            '단일 종목 집중 투자는 높은 리턴을 가져다줄 수 있지만, 리스크 관리가 필수적입니다.',
            '외부 요인(정책, 환율, 글로벌 시장)이 국내 주식에 미치는 영향을 항상 고려해야 합니다.',
            '성공한 투자는 재현 가능한 패턴을 찾는 것이 중요합니다. 실패에서 배우고 성공에서 원리를 찾아야 합니다.'
        ];
    }

    // 실패한 종목 복기 리포트 생성
    generateFailureReview(stockData, actualResult) {
        const stock = stockData.stock;
        const expectedChange = stockData.expectedChange || 0;
        const actualChange = actualResult.changePercent || 0;
        const failureDegree = Math.abs(actualChange - expectedChange);
        
        const mainReason = this.selectMainReason(stockData, actualResult);
        const detailedAnalysis = this.generateDetailedAnalysis(stockData, actualResult);
        const lesson = this.selectRelevantLesson(failureDegree);
        
        return {
            title: `${stock.name} 투자 복기: ${actualChange >= 0 ? '예상보다 낮은 수익' : '손실'}에 대한 솔직한 분석`,
            date: new Date().toLocaleDateString('ko-KR'),
            stock: stock,
            expectedChange: expectedChange,
            actualChange: actualChange,
            mainReason: mainReason,
            detailedAnalysis: detailedAnalysis,
            lesson: lesson,
            nextStrategy: this.generateNextStrategy(stockData, actualResult),
            transparencyNote: this.generateTransparencyNote(actualChange)
        };
    }

    // 성공한 종목 분석 리포트 생성
    generateSuccessReview(stockData, actualResult) {
        const stock = stockData.stock;
        const actualChange = actualResult.changePercent || 0;
        
        const mainFactor = this.selectMainSuccessFactor(stockData, actualResult);
        const detailedAnalysis = this.generateSuccessAnalysis(stockData, actualResult);
        const keyInsight = this.generateKeyInsight(stockData, actualResult);
        
        return {
            title: `${stock.name} 투자 성공 분석: ${actualChange.toFixed(2)}% 수익의 핵심 요인`,
            date: new Date().toLocaleDateString('ko-KR'),
            stock: stock,
            actualChange: actualChange,
            mainFactor: mainFactor,
            detailedAnalysis: detailedAnalysis,
            keyInsight: keyInsight,
            reproduciblePattern: this.identifyReproduciblePattern(stockData, actualResult),
            riskNote: this.generateRiskNote(actualChange)
        };
    }

    // 주요 실패 원인 선택
    selectMainReason(stockData, actualResult) {
        const reasons = [
            `${stockData.stock.name}은(는) ${this.failureReasons[Math.floor(Math.random() * this.failureReasons.length)]}로 인해 예상과 다른 움직임을 보였습니다.`,
            `기존의 기술적 분석이 ${this.failureReasons[Math.floor(Math.random() * this.failureReasons.length)]} 상황에서는 한계를 보였습니다.`,
            `${this.failureReasons[Math.floor(Math.random() * this.failureReasons.length)]}가(이) 주가 하락의 결정적 요인으로 작용했습니다.`
        ];
        
        return reasons[Math.floor(Math.random() * reasons.length)];
    }

    // 상세 분석 생성
    generateDetailedAnalysis(stockData, actualResult) {
        const volatility = stockData.volatility || 0;
        const volumeIncrease = stockData.volumeIncrease || 0;
        const themeScore = stockData.themeScore || 0;
        
        const analyses = [
            `선정 시점의 변동성 ${volatility}%는 실제로는 ${actualResult.changePercent < 0 ? '하방 변동성' : '예상보다 낮은 상방 변동성'}으로 이어졌습니다. 이는 변동성 지표가 방향성을 예측하는 데 한계가 있음을 보여줍니다.`,
            `거래량이 ${volumeIncrease}% 증가했지만, 이는 ${actualResult.changePercent < 0 ? '매도세가 우세한' : '수익 실현이 우세한'} 거래량이었던 것으로 분석됩니다. 거래량의 질적 분석이 필요했던 사례입니다.`,
            `테마 점수 ${themeScore}점에도 불구하고, 관련 테마 전체의 ${actualResult.changePercent < 0 ? '약세장' : '부진한 상승'}이 개별 종목에 영향을 미쳤습니다. 테마 내에서도 종목 선택의 중요성을 보여줍니다.`,
            `우리의 알고리즘이 포착한 신호가 시장의 실제 움직임과 ${Math.abs(actualResult.changePercent) > 5 ? '큰 차이' : '다소간의 차이'}를 보였습니다. 이는 모델 개선의 필요성을 시사합니다.`
        ];
        
        return analyses[Math.floor(Math.random() * analyses.length)];
    }

    // 관련 교훈 선택
    selectRelevantLesson(failureDegree) {
        if (failureDegree > 10) {
            return this.lessons[Math.floor(Math.random() * 4)]; // 더 심각한 교훈
        } else {
            return this.lessons[4 + Math.floor(Math.random() * 4)]; // 일반적인 교훈
        }
    }

    // 다음 전략 생성
    generateNextStrategy(stockData, actualResult) {
        const strategies = [
            '향후 유사한 시그널이 발생했을 때, 추가적인 확인 절차를 거치도록 알고리즘을 개선하겠습니다.',
            '변동성과 거래량 지표의 가중치를 재조정하여, 보다 안정적인 종목 선정을 목표로 합니다.',
            '테마 분석 시 개별 종목의 재무 건전성 지표를 추가적으로 고려하는 방안을 검토 중입니다.',
            '손실 한도 관리 시스템을 도입하여, 리스크를 보다 체계적으로 관리할 계획입니다.'
        ];
        
        return strategies[Math.floor(Math.random() * strategies.length)];
    }

    // 투명성 고지 생성
    generateTransparencyNote(actualChange) {
        if (actualChange < -5) {
            return `이번 ${stock.name} 투자는 ${actualChange.toFixed(2)}%의 손실로 끝났습니다. 이는 우리의 예상을 크게 벗어나는 결과입니다. The One은 성공한 사례만 공개하지 않고, 실패한 사례도 솔직하게 공개하여 사용자들의 신뢰를 얻고자 합니다. 모든 투자에는 리스크가 따르며, 이번 경험을 통해 더 나은 분석 모델을 만들어가겠습니다.`;
        } else if (actualChange < 0) {
            return `${stock.name}은(는) ${actualChange.toFixed(2)}%의 소폭 하락으로 마감했습니다. 예상했던 상승에는 미치지 못했지만, 시장 전체의 하락을 고려하면 상대적으로 양호한 성과였을 수 있습니다. 지속적인 모니터링과 분석 개선을 통해 더 정확한 예측을 제공하겠습니다.`;
        } else {
            return `예상보다는 낮은 ${actualChange.toFixed(2)}%의 상승에 그쳤지만, 손실을 피했다는 점에서 긍정적인 측면도 있습니다. 시장 상황을 고려할 때 합리적인 결과였다고 판단됩니다.`;
        }
    }

    // 주요 성공 요인 선택
    selectMainSuccessFactor(stockData, actualResult) {
        const factors = [
            `${this.successFactors[Math.floor(Math.random() * this.successFactors.length)]}이(가) 성공의 결정적 요인이었습니다.`,
            `정확한 ${this.successFactors[Math.floor(Math.random() * this.successFactors.length)]}가(이) 큰 수익으로 이어졌습니다.`,
            `${this.successFactors[Math.floor(Math.random() * this.successFactors.length)]}을(를) 성공적으로 활용한 사례입니다.`
        ];
        
        return factors[Math.floor(Math.random() * factors.length)];
    }

    // 성공 분석 생성
    generateSuccessAnalysis(stockData, actualResult) {
        const volatility = stockData.volatility || 0;
        const volumeIncrease = stockData.volumeIncrease || 0;
        const themeScore = stockData.themeScore || 0;
        
        const analyses = [
            `변동성 ${volatility}%와 거래량 증가 ${volumeIncrease}%의 조합이 완벽한 타이밍의 상승 신호였습니다. 특히 ${actualResult.changePercent > 5 ? '급격한' : '꾸준한'} 상승세에서 이 두 지표의 시너지가 극대화되었습니다.`,
            `테마 점수 ${themeScore}점이 실제 시장에서 ${actualResult.changePercent > 7 ? '폭발적인' : '안정적인'} 반응으로 이어졌습니다. 테마 투자의 타이밍을 정확하게 포착한 성공 사례입니다.`,
            `기술적 지표들이 일관된 상승 신호를 보내고 있었고, 실제 주가 움직임이 이를 ${actualResult.changePercent > 10 ? '뛰어넘는' : '정확히 따르는'} 모습을 보였습니다.`,
            `우리의 알고리즘이 포착한 복합 신호가 실제 시장에서 ${actualResult.changePercent > 8 ? '예상 이상의' : '정확한'} 결과로 나타났습니다. 모델의 정확성을 입증한 사례입니다.`
        ];
        
        return analyses[Math.floor(Math.random() * analyses.length)];
    }

    // 핵심 인사이트 생성
    generateKeyInsight(stockData, actualResult) {
        const insights = [
            '성공적인 투자는 단순히 좋은 종목을 고르는 것만이 아니라, 정확한 타이밍에 포지션을 잡는 것이 중요합니다.',
            '다양한 지표의 종합적인 분석이 개별 지표의 한계를 극복할 수 있음을 보여주는 사례입니다.',
            '시장의 심리적 흐름을 읽는 것이 숫자 분석만큼이나 중요하다는 것을 증명했습니다.',
            '리스크를 감수할 때와 보수적으로 접근할 때를 구분하는 판단력이 성공의 핵심이었습니다.'
        ];
        
        return insights[Math.floor(Math.random() * insights.length)];
    }

    // 재현 가능한 패턴 식별
    identifyReproduciblePattern(stockData, actualResult) {
        const patterns = [
            '높은 변동성 + 거래량 급증 + 테마 점수 10점 이상 = 상승 확률 높음',
            '섹터 회복기의 선도 종목 + 기술적 지표 개선 = 추가 상승 가능성',
            '외부 호재 발생 직후의 관련 종목 = 단기 수익 기회',
            '저가 영역에서의 거래량 급증 = 바닥 확인 신호'
        ];
        
        return patterns[Math.floor(Math.random() * patterns.length)];
    }

    // 리스크 고지 생성
    generateRiskNote(actualChange) {
        return `이번 ${actualChange.toFixed(2)}%의 성공은 과거의 성과이며, 미래의 수익을 보장하지 않습니다. 투자는 본인의 판단과 책임하에 이루어져야 하며, 항상 손실 가능성을 고려해야 합니다. The One은 참고용 정보만 제공합니다.`;
    }

    // 자동 복기 콘텐츠 HTML 생성
    generateReviewHTML(review, isFailure = true) {
        const type = isFailure ? 'failure' : 'success';
        const typeClass = isFailure ? 'review-failure' : 'review-success';
        
        return `
            <div class="review-item ${typeClass}">
                <h3 class="review-title">${review.title}</h3>
                <div class="review-meta">
                    <span class="review-date">${review.date}</span>
                    <span class="review-stock">${review.stock.name} (${review.stock.code})</span>
                    <span class="review-result ${isFailure && review.actualChange < 0 ? 'negative' : 'positive'}">
                        ${isFailure ? `예상: ${review.expectedChange.toFixed(2)}% → 실제: ${review.actualChange.toFixed(2)}%` : `수익률: ${review.actualChange.toFixed(2)}%`}
                    </span>
                </div>
                
                <div class="review-content">
                    <div class="review-section">
                        <h4>${isFailure ? '주요 원인' : '성공 요인'}</h4>
                        <p>${isFailure ? review.mainReason : review.mainFactor}</p>
                    </div>
                    
                    <div class="review-section">
                        <h4>상세 분석</h4>
                        <p>${isFailure ? review.detailedAnalysis : review.detailedAnalysis}</p>
                    </div>
                    
                    ${isFailure ? `
                        <div class="review-section">
                            <h4>교훈</h4>
                            <p>${review.lesson}</p>
                        </div>
                        
                        <div class="review-section">
                            <h4>향후 전략</h4>
                            <p>${review.nextStrategy}</p>
                        </div>
                    ` : `
                        <div class="review-section">
                            <h4>핵심 인사이트</h4>
                            <p>${review.keyInsight}</p>
                        </div>
                        
                        <div class="review-section">
                            <h4>재현 가능한 패턴</h4>
                            <p>${review.reproduciblePattern}</p>
                        </div>
                    `}
                    
                    <div class="review-section">
                        <h4>${isFailure ? '투명성 고지' : '리스크 고지'}</h4>
                        <p>${isFailure ? review.transparencyNote : review.riskNote}</p>
                    </div>
                </div>
            </div>
        `;
    }
}

// 복기 생성기 인스턴스 생성
const reviewGenerator = new ReviewGenerator();

// 자동 복기 실행 함수
function generateAndSaveReview(stockData, actualResult) {
    const review = actualResult.changePercent < 2 
        ? reviewGenerator.generateFailureReview(stockData, actualResult)
        : reviewGenerator.generateSuccessReview(stockData, actualResult);
    
    // 로컬 스토리지에 저장
    const reviews = JSON.parse(localStorage.getItem('stockReviews') || '[]');
    reviews.unshift(review);
    
    // 최대 100개만 유지
    if (reviews.length > 100) {
        reviews.splice(100);
    }
    
    localStorage.setItem('stockReviews', JSON.stringify(reviews));
    
    return review;
}

// 복기 콘텐츠 표시 함수
function displayReviews() {
    const reviews = JSON.parse(localStorage.getItem('stockReviews') || '[]');
    const reviewsContainer = document.getElementById('reviewsContainer');
    
    if (!reviewsContainer) return;
    
    reviewsContainer.innerHTML = '';
    
    reviews.forEach(review => {
        const isFailure = review.actualChange < 2;
        const reviewHTML = reviewGenerator.generateReviewHTML(review, isFailure);
        reviewsContainer.innerHTML += reviewHTML;
    });
}

// 주기적인 복기 생성 (매일 장 마감 후)
function scheduleReviewGeneration() {
    const now = new Date();
    const marketClose = new Date(now);
    marketClose.setHours(15, 30, 0, 0); // 한국 시장 마감 시간
    
    if (now > marketClose) {
        marketClose.setDate(marketClose.getDate() + 1);
    }
    
    const msUntilClose = marketClose - now;
    
    setTimeout(() => {
        generateDailyReviews();
        scheduleReviewGeneration(); // 다음 날을 위해 다시 스케줄
    }, msUntilClose);
}

// 일일 복기 생성
function generateDailyReviews() {
    const history = JSON.parse(localStorage.getItem('stockHistory') || '[]');
    
    if (history.length === 0) return;
    
    const yesterday = history[0]; // 가장 최근의 추천 종목
    
    // 실제 결과를 가져와서 복기 생성 (여기서는 시뮬레이션)
    const actualResult = {
        changePercent: (Math.random() - 0.5) * 15, // -7.5% ~ +7.5%
        timestamp: new Date().toISOString()
    };
    
    const review = generateAndSaveReview(yesterday, actualResult);
    console.log('일일 복기 생성 완료:', review.title);
}

export { ReviewGenerator, reviewGenerator, generateAndSaveReview, displayReviews, scheduleReviewGeneration };
