# The One - 오늘의 단 한 종목

대한민국에서 가장 단호한 주식 가이드. 수많은 노이즈를 제거하고 오직 단 하나의 종목만 추천합니다.

## 🎯 프로젝트 개요

The One은 개인 투자자들이 겪는 '결정 장애'를 해결하기 위해 탄생한 주식 큐레이션 플랫폼입니다. 매일 수천 개의 종목을 분석하여 데이터가 가리키는 가장 확률 높은 **단 하나의 종목**만을 추천합니다.

### ✨ 핵심 가치
- **단일 종목 집중**: 여러 개를 나열하는 회피적 접근 대신, 단 하나의 종목에 모든 분석 자원을 집중
- **제로 프릭션**: 접속 즉시 종목을 확인할 수 있는 직관적인 UI/UX
- **투명한 복기**: 성공과 실패를 모두 기록하고 공개하여 신뢰 자산 구축
- **데이터 기반**: 변동성, 거래량, 테마 연관성을 종합한 알고리즘

## 🚀 주요 기능

### 📈 오늘의 단 한 종목
- **종가 기준 유지**: 오늘 하루 동안 같은 종목 추천 (새로고쳐도 변경 안됨)
- **자동 초기화**: 매일 자정에 새로운 종목 자동 생성
- **수동 변경**: 필요시 확인 후 새로운 종목으로 변경 가능

### 📊 실시간 데이터 분석
- **변동성 분석 (30%)**: 주가 변동성을 통한 수익 기회 포착
- **거래량 증가율 (40%)**: 자금 유입 현황 분석
- **테마 연관도 (20%)**: 시장 트렌드와의 연관성 평가
- **기술적 지표 (10%)**: RSI, MACD, 이동평균 등 종합 분석

### 📈 시각화
- **30일 차트**: 과거 30일 가격 데이터 시각화
- **실시간 가격**: 현재가, 등락률, 거래량 표시
- **기술적 지표**: 변동성, 거래량 증가율, 테마 점수 표시
- **핵심 분석**: AI 기반 자동 분석 리포트

### 📚 히스토리 추적
- **과거 추천 기록**: 모든 추천 종목의 실제 수익률 기록
- **성공/실패 시각화**: 직관적인 성과 표시
- **누적 통계**: 적중률, 평균 수익률 등 통계 제공

### 🔄 자동 복기 시스템
- **손실 분석**: 실패한 추천에 대한 자동 분석 생성
- **성공 요인**: 성공한 추천의 핵심 성공 요인 분석
- **교훈 추출**: 투자 교육용 콘텐츠 자동 생산

## 🛠️ 기술 스택

### Frontend
- **HTML5**: 시맨틱 마크업
- **CSS3**: Grid, Flexbox, Custom Properties
- **JavaScript (ES6+)**: 모던 자바스크립트 기능
- **Chart.js**: 인터랙티브 차트 라이브러리

### Design
- **Responsive**: 모바일 퍼스트 반응형 디자인
- **Dark Theme**: 전문적인 다크 테마
- **Modern UI**: Glassmorphism, Gradient 효과
- **Typography**: Noto Sans KR 폰트

### Data
- **LocalStorage**: 클라이언트 측 데이터 저장
- **Yahoo Finance API**: 실제 주식 데이터 연동 (준비 완료)
- **Simulation**: 안정적인 시뮬레이션 데이터
- **CORS Solution**: 다양한 API 연동 방법 제공

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

## � 라이브 데모

### 🌐 Online Demo
**URL**: https://the-one-5kl.pages.dev/

### 📱 주요 기능
1. **오늘의 추천**: 하루 동안 유지되는 단일 종목 추천
2. **실시간 차트**: 30일 가격 데이터 시각화
3. **히스토리**: 과거 추천 성과 추적
4. **자동 복기**: 성공/실패 분석 자동 생성
5. **반응형 디자인**: 모든 기기에서 최적화된 UI

## 📦 설치 방법

### 로컬 실행
```bash
# 1. 저장소 클론
git clone https://github.com/SIMHEONSEOB/THE-ONE.git

# 2. 디렉토리 이동
cd THE-ONE

# 3. 로컬 서버 시작
python -m http.server 8000
# 또는
npx serve .

# 4. 브라우저에서 접속
open http://localhost:8000
```

### 의존성
- 별도 설치 불필요
- 모던 브라우저 지원
- 인터넷 연결 (실시간 데이터의 경우)

## 🏗️ 프로젝트 구조

```
THE-ONE/
├── index.html              # 메인 페이지
├── styles.css              # 스타일시트
├── script.js               # 핵심 로직 및 API 연동
├── krx-api-integration.js   # 한국거래소 API 연동 모듈
├── review-generator.js      # 자동 복기 콘텐츠 생성기
├── API-SETUP.md          # API 설정 가이드
├── CORS-SOLUTION.md       # CORS 문제 해결 방법
├── TODAY-STOCK-FEATURE.md # 오늘의 종목 기능 상세 설명
└── README.md              # 프로젝트 문서
```

## 🎯 사용 방법

### 1. 기본 사용
1. 웹사이트 접속
2. 오늘의 추천 종목 확인
3. 차트 및 분석 정보 확인
4. 투자 결정 (참고용)

### 2. 고급 기능
- **히스토리**: 과거 추천 성과 확인
- **복기**: 자동 생성된 분석 리포트 확인
- **새로고침**: 새로운 종목으로 변경 (확인 필요)

### 3. 키보드 단축키
- **Esc**: 메인 화면으로 돌아가기
- **Ctrl+R**: 새로운 종목으로 변경

## 📊 성과 지표

### 사용자 참여도 목표
- **목표 DAU**: 1,000명 (3개월 내)
- **목표 체류시간**: 3분 이상
- **목표 재방문률**: 60% 이상

### 수익성 목표
- **목표 광고 수익**: 월 100만원 (6개월 내)
- **목표 제휴 수익**: 월 50만원 (1년 내)

## 🔧 개발 환경

### 로컬 개발
```bash
# 개발 서버 시작
python -m http.server 8000

# 또는 Node.js 사용
npx serve .

# 브라우저 개발자 도구
F12 → Console 탭에서 API 호출 확인
```

### API 설정
```javascript
// 실제 API 사용 여부
const useRealAPI = false; // 개발 중에는 false

// Yahoo Finance API (무료)
// 별도 설정 불필요

// 한국투자증권 API (유료)
// API-SETUP.md 참조
```

## 🚀 배포

### GitHub Pages (가장 간단)
1. 저장소에 코드 푸시
2. GitHub Settings → Pages
3. Source: "Deploy from a branch"
4. Branch: "main" / "(root)"
5. Save 후 몇 분 기다리면 자동 배포 완료

### Vercel (추천)
1. [vercel.com](https://vercel.com/) 가입
2. GitHub 연동
3. Import Project → THE-ONE 선택
4. Deploy 클릭 (자동 배포)

### Netlify
1. [netlify.com](https://netlify.com/) 가입
2. GitHub 연동
3. New site from Git → 저장소 선택
4. Build settings: 그대로 두고 Deploy site

## 📈 API 연동

### 현재 상태
- **시뮬레이션**: 안정적인 가짜 데이터 (현재 사용 중)
- **Yahoo Finance**: 무료 API 준비 완료 (CORS 해결 필요)
- **한국투자증권**: 유료 API 연동 코드 준비
- **프록시 서버**: Node.js 서버 준비 완료 (실행 필요)

### 실시간 데이터 사용
```javascript
// script.js에서 설정 변경
const useRealAPI = true; // false에서 true로 변경
```

### API 우선순위
1. **한국투자증권 KIS API** (가장 정확)
2. **Yahoo Finance API** (무료, 현재 설정 가능)
3. **Financial Modeling Prep** (미국 ADR 데이터)
4. **Alpha Vantage** (보조 데이터)

## 🔄 로드맵

### 완료 (✅)
- [x] 기본 UI/UX 구현
- [x] 단일 종목 추천 알고리즘
- [x] 오늘의 종목 유지 기능
- [x] 히스토리 추적 시스템
- [x] 자동 복기 콘텐츠 생성
- [x] 반응형 디자인
- [x] AdSense 통합 완료 (ca-pub-7396122483481566)
- [x] Google CMP 동의 관리 시스템 (GDPR 준수)
- [x] 법적 페이지 완료 (개인정보처리방침, 이용약관, 문의, 소개)
- [x] Pages.dev 도메인 배포 완료

### 진행 중 (🔄)
- [ ] 실시간 API 연동 (CORS 해결 필요)
- [ ] 사용자 알림 시스템
- [ ] 모바일 앱 개발
- [ ] 커뮤니티 기능

### 계획 (📋)
- [ ] 한국투자증권 API 연동
- [ ] AI 기반 예측 모델
- [ ] 프리미엄 기능 유료화
- [ ] 금융 제휴 시스템

## 🤝 기여 방법

### 버그 리포트
1. [Issues](https://github.com/SIMHEONSEOB/THE-ONE/issues) 탭 이동
2. "New issue" 클릭
3. 상세한 버그 정보 작성
4. 라벨 지정 (bug, enhancement 등)

### 기능 제안
1. 기능 아이디어 구체화
2. 구현 방법 제안
3. 디자인 개선안 첨부
4. Pull Request 생성

### 코드 기여
1. 저장소 포크
2. 기능 브랜치 생성
3. 코드 수정 및 테스트
4. Pull Request 제출

## 📝 라이선스

MIT License - 자유로운 상업적 이용 가능

### 조건
- 저작권 표기
- 라이선스 유지
- 보증 부제

## ⚠️ 면책 조항

본 서비스는 참고용 정보만 제공하며, 모든 투자의 최종 결정과 책임은 투자자 본인에게 있습니다.

### 투자 유의사항
- 제공되는 정보는 과거 데이터를 기반으로 한 분석입니다.
- 미래 수익을 보장하지 않습니다.
- 모든 투자에는 리스크가 따릅니다.
- 손실 가능성을 항상 고려해야 합니다.

## 📞 문의 및 연락

### 기술적 문의
- **GitHub Issues**: [https://github.com/SIMHEONSEOB/THE-ONE/issues](https://github.com/SIMHEONSEOB/THE-ONE/issues)
- **Pull Request**: 코드 개선 및 버그 수정

### 비즈니스 문의
- **이메일**: (추후 공개 예정)
- **문의**: 기능 제안, 제휴 문의 등

## 🙏 감사의 말

The One 프로젝트에 관심을 가져주셔서 감사합니다. 더 나은 주식 큐레이션 플랫폼을 만들기 위해 지속적으로 개선하고 있습니다.

### 기여자 명단
- [SIMHEONSEOB](https://github.com/SIMHEONSEOB) - 프로젝트 생성 및 핵심 개발

---

**The One - 오늘의 단 한 종목**  
*대한민국에서 가장 단호한 주식 가이드*

🚀 **[라이브 데모](https://the-one-5kl.pages.dev/)** | 📱 **모든 기기 지원** | 🎯 **단일 종목 전문**
