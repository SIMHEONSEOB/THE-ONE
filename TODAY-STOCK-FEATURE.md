# 오늘의 단 한 종목 기능

## 🎯 기능 개요

The One 플랫폼의 핵심 가치인 **"하루 동안 같은 종목 추천"** 기능입니다.

### 주요 특징
- **종가 기준**: 오늘 장 마감 후 다음 날 0시까지 같은 종목 유지
- **자동 초기화**: 매일 자정에 자동으로 새로운 종목 추천
- **수동 초기화**: 사용자가 원할 때 새로운 종목으로 변경 가능

## 🔧 동작 방식

### 1. 오늘의 종목 로드
```javascript
function loadTodayStock() {
    const today = new Date().toDateString(); // 날짜만 비교 (시간 제외)
    const saved = localStorage.getItem('todayStock');
    
    if (saved) {
        const todayStock = JSON.parse(saved);
        const savedDate = new Date(todayStock.date).toDateString();
        
        // 오늘 날짜이면 저장된 종목 사용
        if (savedDate === today) {
            return todayStock;
        }
    }
    
    // 없으면 새로 생성
    return null;
}
```

### 2. 오늘의 종목 저장
```javascript
function saveTodayStock(stock) {
    const todayStock = {
        date: new Date().toISOString(),
        stock: stock
    };
    localStorage.setItem('todayStock', JSON.stringify(todayStock));
}
```

### 3. 자동 초기화 스케줄
```javascript
function scheduleDailyReset() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const msUntilMidnight = tomorrow - now;
    
    setTimeout(() => {
        localStorage.removeItem('todayStock');
        scheduleDailyReset(); // 다음 날을 위해 다시 스케줄
    }, msUntilMidnight);
}
```

## 📱 사용자 경험

### 새로고침 시
- **확인창**: "오늘의 추천 종목을 초기화하고 새로운 종목을 추천하시겠습니까?"
- **선택 시**: 새로운 종목 즉시 생성 및 표시
- **취소 시**: 기존 종목 유지

### 자동 동작
- **매일 자정**: 이전 날의 추천 종목 자동 삭제
- **새로운 접속**: 해당 날의 첫 접속 시 새로운 종목 생성

## 🎯 비즈니스적 가치

### 1. 브랜드 일관성
- **신뢰도**: 하루 동안 일관된 추천
- **전문성**: "오늘의 단 한 종목" 컨셉 유지
- **사용자 신뢰**: 예측 가능성 증가

### 2. 사용자 습관
- **아침 확인**: 매일 아침 "오늘의 종목이 뭘까?" 기대감
- **하루 유지**: 새로고침해도 같은 종목으로 안정감
- **다음 날 기대**: 다음 날 새로운 종목에 대한 기대감

### 3. 기술적 안정성
- **로컬 저장**: localStorage로 데이터 영속성
- **자동 관리**: 스케줄링으로 수동 관리 불필요
- **오류 처리**: 날짜 계산 오류 방지

## 🔄 시나리오 예시

### 시나리오 1: 정상적인 하루
```
09:00 - 사용자 접속 → "삼성전자" 추천 (새로 생성)
10:00 - 새로고침 → "삼성전자" 유지됨
15:00 - 장 마감 후 → "삼성전자" 그대로 유지
20:00 - 저녁 확인 → "삼성전자" 동일
00:00 - 자정 → 자동 초기화
```

### 시나리오 2: 수동 변경
```
09:00 - "삼성전자" 추천
11:00 - 사용자 새로고침 → 확인창 → "예" 선택
11:01 - "SK하이닉스" 새로 추천
15:00 - 장 마감 → "SK하이닉스" 유지
00:00 - 자정 → 자동 초기화
```

## 🎨 UI/UX 개선 사항

### 1. 시각적 표시
- **"오늘의 추천"** 배지 추가
- **생성 시간** 표시
- **"같은 종목 유지 중"** 메시지

### 2. 사용자 피드백
- **토스트 알림**: 종목 변경 시 알림
- **확인창 개선**: 더 명확한 메시지
- **히스토리 연동**: 오늘의 종목 변경 기록

### 3. 고급 기능
- **예약 기능**: 특정 시간에 종목 변경 예약
- **알림 설정**: 매일 아침 추천 알림
- **통계 분석**: 일자별 추천 패턴 분석

## 📊 기술적 구현

### 데이터 구조
```javascript
{
    date: "2024-02-19T00:00:00.000Z",
    stock: {
        name: "삼성전자",
        code: "005930",
        volatility: 8.5,
        volumeIncrease: 120.3,
        themeScore: 7.2,
        totalScore: 85.6
    }
}
```

### 날짜 비교 로직
```javascript
// 시간 제외 날짜 비교
const today = new Date().toDateString();
const savedDate = new Date(savedStock.date).toDateString();

if (savedDate === today) {
    // 같은 날이면 저장된 종목 사용
}
```

## 🚀 향후 개선 방향

### 단기 (1주)
1. **UI 개선**: 오늘의 종목 표시 강화
2. **알림 시스템**: 푸시 알림 기능
3. **통계 추가**: 추천 종목 변경 횟수 추적

### 중기 (1개월)
1. **예약 기능**: 특정 시간 종목 변경 예약
2. **분석 개선**: 더 정교한 종목 선정 알고리즘
3. **모바일 최적화**: PWA 지원

### 장기 (3개월)
1. **AI 기반**: 머신러닝 종목 추천
2. **실시간 연동**: 실제 주식 시장 데이터 연동
3. **커뮤니티**: 사용자 참여 기능 추가

---

## 🎯 결론

**"오늘의 단 한 종목"** 기능은 The One 플랫폼의 핵심 정체성입니다.

- **사용자**: 하루 동안 안정적인 추천을 얻음
- **플랫폼**: 브랜드 일관성과 신뢰도 확보
- **비즈니스**: 재방문율과 사용자 만족도 향상

이 기능으로 The One은 "대한민국에서 가장 단호한 주식 가이드"라는 비전을 실현할 수 있습니다.
