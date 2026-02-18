# The One - 오늘의 단 한 종목

대한민국에서 가장 단호한 주식 가이드. 수많은 노이즈를 제거하고 오직 단 하나의 종목만 추천합니다.

## 🎯 프로젝트 개요

The One은 개인 투자자들이 겪는 '결정 장애'를 해결하기 위해 탄생한 주식 큐레이션 플랫폼입니다. 매일 수천 개의 종목을 분석하여 데이터가 가리키는 가장 확률 높은 **단 하나의 종목**만을 추천합니다.

### 핵심 가치
- **단일 종목 집중**: 여러 개를 나열하는 회피적 접근 대신, 단 하나의 종목에 모든 분석 자원을 집중
- **제로 프릭션**: 접속 즉시 종목을 확인할 수 있는 직관적인 UI/UX
- **투명한 복기**: 성공과 실패를 모두 기록하고 공개하여 신뢰 자산 구축
- **데이터 기반**: 변동성, 거래량, 테마 연관성을 종합한 알고리즘 기반 선정

## 🚀 주요 기능

### 1. 오늘의 단 한 종목
- 매일 오전 9시 이전에 당일의 추천 종목 발표
- 실시간 가격 정보 및 기술적 지표 제공
- 30일 차트 데이터 시각화

### 2. 종목 선정 알고리즘
- **변동성 분석 (30%)**: 주가 변동성을 통한 수익 기회 포착
- **거래량 증가율 (40%)**: 자금 유입 현황 분석
- **테마 연관도 (30%)**: 시장 트렌드와의 연관성 평가

### 3. 히스토리 추적
- 과거 추천 종목의 실제 수익률 기록
- 성공/실패 사례 투명하게 공개
- 누적 수익률 및 적중률 통계

### 4. 자동화된 복기 콘텐츠
- 손실 종목에 대한 자동 분석 리포트 생성
- 성공 종목의 핵심 성공 요인 분석
- 투자자 교육 콘텐츠 자동 생산

## 🛠️ 기술 스택

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: CSS Grid, Flexbox, Custom Properties
- **Charts**: Chart.js
- **Data**: LocalStorage (클라이언트 측 저장)
- **API**: 한국거래소 무료 API (향후 확장 예정)

## 📁 프로젝트 구조

```
the-one-stock/
├── index.html          # 메인 페이지
├── styles.css          # 스타일시트
├── script.js           # 핵심 로직 및 API 통신
├── README.md           # 프로젝트 문서
└── assets/             # 정적 리소스 (향후 추가)
```

## 🎨 디자인 컨셉

### 컬러 팔레트
- **Primary**: #0a0a0a (딥 블랙)
- **Accent**: #ff6b6b (코랄 레드)
- **Secondary**: #ffd93d (골드)
- **Text**: #ffffff (화이트)
- **Muted**: #888888 (그레이)

### 타이포그래피
- **Font**: Noto Sans KR
- **Headings**: 900 (Black Weight)
- **Body**: 400 (Regular)
- **Accent**: 700 (Bold)

## 🚦 실행 방법

1. 프로젝트 클론
```bash
git clone <repository-url>
cd the-one-stock
```

2. 로컬 서버 실행
```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve .

# 또는 VS Code Live Server 확장프로그램 사용
```

3. 브라우저에서 `http://localhost:8000` 접속

## 📊 향후 개발 계획

### Phase 1: MVP (현재)
- [x] 기본 UI/UX 구현
- [x] 종목 선정 알고리즘
- [x] 히스토리 추적 시스템
- [ ] 실시간 API 연동

### Phase 2: 수익화
- [ ] Google AdSense 통합
- [ ] 증권사 제휴 페이지
- [ ] 프리미엄 기능 유료화

### Phase 3: 확장
- [ ] 모바일 앱 개발
- [ ] AI 기반 예측 모델 고도화
- [ ] 커뮤니티 기능 추가

## 🔧 API 연동 (향후)

### 한국거래소(KRX) 무료 API
```javascript
// 예시 코드
async function fetchStockData(code) {
    const response = await fetch(`https://api.krx.co.kr/stock/${code}`);
    const data = await response.json();
    return data;
}
```

### Alpha Vantage (대안)
```javascript
// 무료 플랜: 일일 500회 호출 제한
const API_KEY = 'YOUR_API_KEY';
const BASE_URL = 'https://www.alphavantage.co/query';
```

## 📈 성과 지표

### 사용자 참여도
- **목표 DAU**: 1,000명 (3개월 내)
- **목표 체류시간**: 3분 이상
- **목표 재방문률**: 60% 이상

### 수익성
- **목표 광고 수익**: 월 100만원 (6개월 내)
- **목표 제휴 수익**: 월 50만원 (1년 내)

## 🤝 기여 방법

1. 이슈 생성 및 기능 제안
2. Pull Request 제출
3. 코드 리뷰 참여
4. 버그 리포트

## 📝 라이선스

MIT License - 자유로운 상업적 이용 가능

## ⚠️ 면책 조항

본 서비스는 참고용 정보만 제공하며, 모든 투자의 최종 결정과 책임은 투자자 본인에게 있습니다. 제공되는 정보는 과거 데이터를 기반으로 한 분석이며, 미래 수익을 보장하지 않습니다.

---

**The One - 오늘의 단 한 종목**  
*대한민국에서 가장 단호한 주식 가이드*
