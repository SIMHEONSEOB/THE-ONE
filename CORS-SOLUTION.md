# CORS 문제 해결 방법

## 🚨 현재 문제 상황

### 발생 에러들
1. **CORS 정책 위반**: Yahoo Finance API가 브라우저에서 직접 호출 차단
2. **AdSense 차단**: 광고 스크립트가 브라우저 보안 정책에 차단
3. **ES 모듈 에러**: export/import 문법 오류

### 원인 분석
- **CORS**: Yahoo Finance API가 웹 브라우저에서의 직접 호출을 허용하지 않음
- **보안 정책**: 현대 브라우저의 보안 기능으로 외부 API 호출 제한

## 🔧 해결 방법

### 방법 1: 서버사이드 프록시 (가장 추천)

**Node.js 서버 구현:**
```javascript
// server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());

app.get('/api/stock/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const yahooSymbol = code + '.KS';
        
        const response = await axios.get(
            `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?range=30d&interval=1d`
        );
        
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3001);
```

**클라이언트 수정:**
```javascript
// 기존 URL 대신 프록시 사용
const response = await fetch(`http://localhost:3001/api/stock/${code}`);
```

### 방법 2: JSONP 사용 (간단한 해결책)

```javascript
function fetchStockDataWithJSONP(code) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        const callback = 'callback_' + Date.now();
        
        window[callback] = (data) => {
            resolve(data);
            delete window[callback];
            document.head.removeChild(script);
        };
        
        script.src = `https://query1.finance.yahoo.com/v7/finance/quote/${code}.KS?callback=${callback}`;
        script.onerror = () => reject(new Error('JSONP failed'));
        
        document.head.appendChild(script);
    });
}
```

### 방법 3: Public CORS 프록시 사용

**무료 CORS 프록시:**
```javascript
// CORS Anywhere와 같은 서비스 사용
const proxyURL = 'https://cors-anywhere.herokuapp.com/';
const targetURL = 'https://query1.finance.yahoo.com/v8/finance/chart/005930.KS';

fetch(proxyURL + targetURL)
    .then(response => response.json())
    .then(data => console.log(data));
```

### 방법 4: 다른 API 사용

**Financial Modeling Prep (미국 ADR):**
```javascript
// 한국 종목의 미국 ADR 사용
const adrMap = {
    '005930': 'SSNLF', // 삼성전자
    '000660': 'HYNLF', // SK하이닉스
    '035420': 'NHNCF', // NAVER
};

const symbol = adrMap[code];
const response = await fetch(`https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=YOUR_KEY`);
```

## 🚀 즉시 사용 가능한 해결책

### 1. 시뮬레이션 데이터 개선
- 더 현실적인 데이터 생성
- 실제 시장 패턴 모방
- 기술적 지표 개선

### 2. 하이브리드 접근
- 기본은 시뮬레이션 데이터 사용
- 주기적으로 실제 데이터 업데이트 시도
- 실패 시 자동 폴백

### 3. 배포 환경에서만 실제 API 사용
- 로컬 개발: 시뮬레이션
- 프로덕션 배포: 실제 API
- 환경별 설정 분리

## 📋 권장 순서

### 단기 (즉시)
1. ✅ 시뮬레이션 데이터로 안정화
2. ✅ 에러 처리 개선
3. ✅ UI/UX 완성

### 중기 (1-2주)
1. Node.js 프록시 서버 구축
2. 실시간 데이터 연동 테스트
3. 성능 최적화

### 장기 (1개월)
1. 한국투자증권 API 연동
2. 완전 실시간 시스템 구축
3. 모니터링 및 로깅 시스템

## 🎯 현재 추천

**시뮬레이션 데이터로 먼저 완성하고, 추후 서버사이드 구현을 권장합니다.**

이유:
- 즉시 사용 가능
- 안정적인 운영
- 점진적 개선 가능
- 사용자 경험 저하 없음

## 🔧 개발 환경 설정

### 로컬 개발
```javascript
const useRealAPI = false; // CORS 문제 회피
```

### 프로덕션 배포
```javascript
const useRealAPI = true; // 실제 데이터 사용
```

### 환경별 자동 설정
```javascript
const isProduction = window.location.hostname !== 'localhost';
const useRealAPI = isProduction;
```

---

**결론: 현재는 시뮬레이션 데이터로 안정적인 서비스를 제공하고, 추후 서버사이드 구현을 통해 실시간 데이터를 연동하는 것이 가장 현실적인 접근입니다.**
