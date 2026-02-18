# 한국거래소 API 연동 가이드

## 🚀 실시간 주식 데이터를 위한 API 설정 방법

The One 플랫폼에서 실제 한국 주식 데이터를 사용하기 위한 API 연동 가이드입니다.

## 📋 API 옵션

### 1. 한국투자증권 KIS API (가장 정확) ✅ 추천

**장점:**
- 실시간 한국 주식 데이터 제공
- 가장 정확하고 신뢰성 높음
- 일봉, 분봉, 실시간 데이터 모두 가능

**단점:**
- 개발자 계정 필요
- 유료 (월 3,300원~)
- 인증 절차 복잡

**설정 방법:**
1. [한국투자증권 Open API](https://developer.koreainvestment.com/) 가입
2. 앱키(App Key)와 시크릿키(Secret Key) 발급
3. `krx-api-integration.js` 파일에서 키 설정:
```javascript
this.kisAppKey = '발급받은_앱키';
this.kisSecretKey = '발급받은_시크릿키';
```

### 2. Yahoo Finance API (무료) 🆓

**장점:**
- 완전 무료
- 한국 주식 데이터 제공 (.KS 접미사)
- 사용 간단

**단점:**
- 공식 API가 아님 (스크래핑 기반)
- 안정성 보장 안됨
- 데이터 지연 가능성

**설정 방법:**
- 별도 설정 필요 없음
- 자동으로 Yahoo Finance API 사용

### 3. Financial Modeling Prep API (무료 플랜)

**장점:**
- 공식 API
- 무료 플랜 제공 (일일 250회)
- 미국 ADR 데이터 제공

**단점:**
- 한국 주식은 ADR로만 제공
- 일부 종목만 지원
- 호출 제한 있음

**설정 방법:**
1. [FMP](https://financialmodelingprep.com/) 가입
2. API 키 발급
3. `krx-api-integration.js` 파일에서 키 설정:
```javascript
this.fmpApiKey = '발급받은_FMP_API_키';
```

### 4. Alpha Vantage API (무료 플랜)

**장점:**
- 공식 API
- 무료 플랜 제공 (일일 500회)
- 다양한 기술적 지표

**단점:**
- 한국 주식 직접 지원 안됨
- 미국 주식만 가능
- 호출 제한 있음

## 🔧 API 활성화 방법

### 1. 실제 API 사용 설정

`script.js` 파일에서 API 사용 여부 설정:

```javascript
// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    loadStockHistory();
    setTimeout(() => {
        // 실제 API 사용 여부 설정
        const useRealAPI = true; // false에서 true로 변경
        
        if (useRealAPI) {
            selectAndDisplayStockWithAPI();
        } else {
            selectAndDisplayStock();
        }
    }, 2000);
});
```

### 2. API 키 설정

`krx-api-integration.js` 파일에서 사용할 API 키 설정:

```javascript
class KRXStockAPI {
    constructor() {
        // 한국투자증권 KIS API
        this.kisAppKey = 'YOUR_KIS_APP_KEY'; // 여기에 실제 키 입력
        this.kisSecretKey = 'YOUR_KIS_SECRET_KEY'; // 여기에 실제 키 입력
        
        // 다른 API 키들...
        this.fmpApiKey = 'YOUR_FMP_API_KEY';
        this.alphaVantageKey = 'YOUR_ALPHA_VANTAGE_KEY';
    }
}
```

## 🎯 추천 설정

### 개발/테스트 단계
```javascript
const useRealAPI = false; // 시뮬레이션 데이터 사용
```

### 프로덕션 단계
```javascript
const useRealAPI = true; // 실제 API 사용
```

### API 우선순위
1. **한국투자증권 KIS API** (가장 정확)
2. **Yahoo Finance API** (무료 대안)
3. **FMP API** (ADR 데이터)
4. **Alpha Vantage API** (보조)

## 📊 데이터 흐름

```
사용자 요청 → API 호출 시도 → 데이터 수신 → 기술적 분석 → 종목 선정 → UI 표시
     ↓              ↓              ↓           ↓          ↓         ↓
  웹페이지      KIS/Yahoo/FMP   실시간 데이터   RSI/MACD   점수 계산   차트/분석
```

## 🚨 주의사항

1. **API 호출 제한**: 각 API의 일일 호출 제한 확인
2. **실시간 데이터**: 실제 투자 결정용이 아닌 참고용으로만 사용
3. **오류 처리**: API 실패 시 자동으로 시뮬레이션 데이터로 폴백
4. **보안**: API 키는 클라이언트 측에 노출되지 않도록 주의

## 🔍 테스트 방법

1. 개발자 도구 콘솔 확인
2. 네트워크 탭에서 API 호출 확인
3. 실제 데이터가 표시되는지 확인
4. 오류 발생 시 폴백 동작 확인

## 📈 기대 효과

- **신뢰성**: 실제 시장 데이터 기반 분석
- **정확성**: 실시간 가격 및 거래량 반영
- **전문성**: 기술적 지표 기반 종목 선정
- **사용자 만족도**: 실제 데이터로 신뢰도 향상

---

## 🛠️ 문제 해결

### API 키 관련 문제
- 키가 올바르게 입력되었는지 확인
- API 키 유효기간 확인
- 호출 제한 초과 여부 확인

### 데이터 수신 문제
- 네트워크 연결 상태 확인
- CORS 정책 문제 확인
- API 서버 상태 확인

### 인증 문제
- 토큰 발급 여부 확인
- 인증 헤더 설정 확인
- API 권한 범위 확인

궁금한 점이 있으면 언제든지 문의해주세요!
