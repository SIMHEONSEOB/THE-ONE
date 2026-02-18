# 기여 가이드 (Contributing Guide)

## 🎯 The One에 기여해주셔서 감사합니다!

The One 플랫폼은 개인 투자자들이 겪는 '결정 장애'를 해결하기 위해 탄생한 주식 큐레이션 플랫폼입니다. 여러분의 기여와 협력을 통해 더 나은 프로젝트로 성장하고자 합니다.

## 🤝 기여 방법

### 🚀 시작하기 전에
1. **이슈 확인**: [Issues](https://github.com/SIMHEONSEOB/THE-ONE/issues)에서 이미 보고된 이슈 확인
2. **코드 분석**: 프로젝트 구조와 코드를 충분히 이해
3. **로컬 개발**: 로컬에서 개발 환경 설정
4. **질문 사전**: 명확하지 않은 부분은 이슈로 먼저 질문

### 📋 이슈 종류
- **🐛 버그 리포트**: 프로그램 오류, 기능 문제, 개선 제안
- **✨ 기능 제안**: 새로운 기능 아이디어, 개선 방안
- **📝 문서 개선**: README, 코드 주석, 가이드라인 개선
- **🔧 코드 리팩토**: 코드 품질 향상, 성능 최적화
- **🌐 배포 관련**: 배포 문제, CI/CDN, 환경 설정

### 🛠️ 코드 기여 가이드

#### 📝 코드 컨벤션
```bash
# 1. 저장소 클론
git clone https://github.com/SIMHEONSEOB/THE-ONE.git

# 2. 개발 브랜치 설정
cd THE-ONE
code . # VS Code
# 또는
npm install

# 3. 브랜치 실행
npm run dev # 개발 서버와 클라이언트 동시 실행
npm start # 클라이언트만 실행
```

#### 🔧 개발 워크플로우
```
THE-ONE/
├── index.html              # 메인 페이지
├── styles.css              # 스타일시트
├── script.js               # 핵심 로직
├── server.js               # API 프록시 서버
├── notification-system.js   # 알림 시스템
├── krx-api-integration.js  # API 연동 모듈
├── review-generator.js      # 자동 복기 생성기
├── package.json            # 의존성 관리
├── README.md               # 프로젝트 문서
└── docs/                  # 추가 문서 폴더
    ├── API-SETUP.md          # API 설정 가이드
    ├── CORS-SOLUTION.md       # CORS 해결 방법
    ├── ADSENSE-OPTIMIZATION.md # AdSense 최적화 가이드
    └── TODAY-STOCK-FEATURE.md # 기능 상세 설명
```

#### 📝 코딩 컨벤션
- **ES6+**: 모던 자바스크립트 기능 사용
- **의미있는 변수명**: 명확한 변수명 사용
- **함수 분리**: 작은 단일 기능 단위로 분리
- **에러 처리**: 적절한 에러 처리와 사용자 친화적 메시지
- **주석**: 복잡한 로직에 상세한 주석 추가

#### 🎨 스타일 가이드
```css
/* 컴포넌트 기반 클래스 사용 */
.container {
    max-width: 1200px;
    margin: 0 auto;
}

/* 변수명 규칙 */
:root {
    --primary-color: #ff6b6b;
    --secondary-color: #ffd93d;
    --background-color: #0a0a0a;
    --text-color: #ffffff;
    --border-radius: 10px;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
    .container {
        padding: 0 1rem;
    }
}
```

## 🚀 풀 리퀘스트 요청

### 📋 풀 리퀘스트 전략
1. **브랜치**: `feature/새로운-기능` 브랜치 생성
2. **개발**: `develop` 브랜치에서 개발
3. **병합**: `main` 브랜치로 병합
4. **배포**: `release` 브랜치로 배포

### 🔄 풀 리퀘스트 프로세스
```bash
# 1. 새로운 기능 브랜치 생성 및 개발
git checkout -b feature/새로운-기능
git checkout -b develop
# 개발 작업
# ... 코드 수정 ...
git add .
git commit -m "Add new feature: 새로운 기능"
git push origin feature/새로운-기능

# 2. develop 브랜치로 병합
git checkout develop
git merge feature/새로운-기능
git push origin develop

# 3. main 브랜치로 병합
git checkout main
git merge develop
git push origin main
```

## 📝 코드 리뷰 프로세스

### 🔍 코드 리뷰 가이드라인
1. **자동화**: 가능한 모든 부분 자동화
2. **단순 테스트**: 각 기능에 대한 단위 테스트 코드 작성
3. **문서화**: README와 코드 주석 항상 유지
4. **성능**: 불필요한 코드 제거 및 최적화

## 🌐 배포 가이드

### 📋 GitHub Actions CI/CD
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./
```

### 🚀 Vercel 배포
```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel --prod
```

## 📊 이슈 템플릿

### 🐛 버그 리포트
```markdown
## 버그 제목

**버그 설명**: 간단하고 명확한 버그 설명
**재현 단계**: 버그를 재현하는 구체적인 단계
**기대 동작**: 어떻게 동작해야 하는지
**실제 동작**: 실제로 어떻게 동작하는지
**환경 정보**: OS, 브라우저, 버전 등
**스크린샷**: 문제가 발생하는 화면의 스크린샷

**재현 코드**:
```javascript
// 버그를 재현하는 코드 조각
```

**해결 방안**: 버그를 해결하기 위한 제안

### ✨ 기능 제안
```markdown
## 새로운 기능 제안

**기능 이름**: 간단한 기능 이름
**문제점**: 현재 기능의 한계나 개선점
**제안 내용**: 새로운 기능에 대한 상세한 제안
**기대 효과**: 이 기능이 어떻게 도움이 될지
**구현 방법**: 기능을 구현하기 위한 구체적인 방법
```

## 📝 문서 개선

### 📖 README 개선 가이드라인
- [ ] 프로젝트 목적과 설명이 명확한가?
- [ ] 설치 및 실행 방법이 상세한가?
- [ ] API 설정 및 사용 방법이 충분한가?
- [ ] 기능 목록이 완전한가?
- [ ] 코드 구조와 컨벤션이 잘 설명되어 있는가?

## 🤝 커뮤니케이션

### 📧 Slack/Discord 연동 (선택적)
- **채널**: 개발 논의 및 토론 공간
- **규칙**: 코드 리뷰, 질문, 존중 중립
- **알림**: 중요 업데이트 및 릴리스 자동 알림

## 🎯 기여자 인정

### 🏆 기여자 등급
- **🥉 뉴비**: 처음 기여한 사용자
- **🥈 활동 기여자**: 지속적으로 기여하는 사용자
- **🏅 핵심 기여자**: 프로젝트에 큰 기여를 하는 사용자

### 📋 기여자 혜택
- **GitHub Contributors**: 프로젝트 Contributors 목록에 자동으로 표시
- **기여자 프로필**: 개인 프로필 페이지 (향후 구현)
- **기여자 스포라이트**: 주요 기여자에게 스포라이트 부여

## 🚀 기여 시작하기

### 📋 첫 단계
1. **이슈 확인**: [Issues](https://github.com/SIMHEONSEOB/THE-ONE/issues)에서 간단한 이슈 선택
2. **로컬 개발**: `npm install && npm run dev`로 개발 환경 설정
3. **코드 탐색**: `Ctrl+F`로 관련 코드 탐색
4. **작은 PR**: 작은 기능부터 시작하여 Pull Request 제출

### 📝 기여자 가이드
- **작은 단위**: 처음에는 작은 버그 수정이나 문서 개선부터 시작
- **질문은 환영**: 명확하지 않은 부분은 언제나 이슈로 질문
- **코드 품질**: 깔끔하고 읽기 쉬운 코드를 제출해주세요
- **테스트 필수**: PR 제출 전에 반드시 로컬에서 테스트

## 🎯 기여자 인정 방식

### 📋 인정 기준
1. **의미 있는 기여**: 의미 있는 코드 기여
2. **코드 품질**: 잘 작성되고 이해하기 쉬운 코드
3. **테스트 완료**: 기여한 기능에 대한 테스트 코드 포함
4. **문서화**: README 업데이트와 코드 주석

### 🏅 인정 프로세스
1. **코드 리뷰**: 모든 PR은 최소 1명의 리뷰을 거침
2. **병합 충돌**: 충돌 없는 경우 자동으로 병합
3. **테스트 통과**: 모든 테스트가 통과되어야 병합

---

## 🎯 The One 커뮤니티

### 📧 연락 정보
- **GitHub**: https://github.com/SIMHEONSEOB/THE-ONE
- **Issues**: https://github.com/SIMHEONSEOB/THE-ONE/issues
- **Discord**: (향후 개설)
- **Email**: (개인 문의)

### 🎉 기여 문화
- **개방형**: 자유롭게 기여를 환영
- **협업적**: 전문적인 개발 문화
- **상호 존중**: 서로를 안정적으로 운영하기 위한 노력

---

**The One에 기여해주셔서 다시 한번 감사합니다!** 🙏

**여러분의 기여와 협력을 통해 The One을 더 나은 프로젝트로 만들어가길 바랍니다.** 🚀
