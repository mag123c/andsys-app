# 실시간 알림 설정

## 알림 철학

```
"대시보드는 보러 가는 것이 아니라, 문제가 나를 찾아오게 해야 한다."
```

- 매번 대시보드 접속 불필요
- 문제 발생 시에만 즉시 알림
- 알림 피로 방지 (중요한 것만)

---

## 알림 채널 선택

| 채널 | 장점 | 단점 | 추천 |
|------|------|------|------|
| **Slack** | 실시간, 스레드 | 앱 필요 | 팀 있을 때 |
| **Discord** | 무료, 웹훅 간단 | 개인용 느낌 | 1인 개발 |
| **Email** | 어디서나 | 느림, 묻힘 | 백업용 |
| **SMS** | 확실함 | 유료 | Critical만 |

### 추천 구성 (1인 개발)

```
Critical : Discord + Email
Warning  : Discord
Info     : 무시 (대시보드에서 확인)
```

---

## Sentry 알림 설정

### 1. 프로젝트 생성 후 알림 설정

```
Settings → Alerts → Create Alert Rule
```

### 2. 알림 규칙

#### Rule 1: 신규 에러 (Critical)

```yaml
When: A new issue is created
Filter: level:error OR level:fatal
Action:
  - Send Discord notification
  - Send email to team
Frequency: 매 발생 시
```

#### Rule 2: 에러 급증 (Critical)

```yaml
When: Number of events > 10 in 5 minutes
Filter: level:error
Action:
  - Send Discord notification
Frequency: 5분마다 최대 1회
```

#### Rule 3: 해결된 이슈 재발 (Critical)

```yaml
When: A resolved issue re-occurs
Action:
  - Send Discord notification
  - Send email
Frequency: 매 발생 시
```

### 3. Discord 웹훅 설정

```
1. Discord 서버 → 채널 설정 → 연동 → 웹훅 만들기
2. 웹훅 URL 복사
3. Sentry → Settings → Integrations → Discord
4. 웹훅 URL 붙여넣기
```

### 4. 알림 메시지 예시

```
🚨 [4ndSYS] New Error

Title: TypeError: Cannot read property 'id' of undefined
Level: error
URL: https://sentry.io/issues/12345
Environment: production
User: user@example.com
Browser: Chrome 120
```

---

## Vercel 알림 설정

### 배포 알림

```
Vercel Dashboard → Project → Settings → Notifications

✅ Deployment succeeded
✅ Deployment failed
✅ Domain configuration issues
```

### Slack/Discord 연동

```
Settings → Integrations → Slack 또는 Discord Webhook
```

---

## GA4 알림 (선택)

### Custom Insights 설정

```
GA4 → Admin → Custom Insights

알림 조건:
- 일일 사용자 50% 감소
- 이탈률 30% 증가
- 평균 세션 시간 50% 감소
```

---

## PostHog 알림 (Phase 2)

### Actions & Webhooks

```
PostHog → Data Management → Actions

알림 조건:
- sync_failed 이벤트 10회 이상/시간
- 전환율 급감
```

### 설정 방법

```
1. Action 생성 (트리거 이벤트 정의)
2. Webhook URL 설정 (Discord/Slack)
3. 조건 설정 (임계값)
```

---

## 알림 우선순위 매트릭스

| 심각도 | 조건 | 채널 | 대응 시간 |
|--------|------|------|-----------|
| **Critical** | 프로덕션 에러, 서비스 다운 | Discord + Email | 즉시 |
| **Warning** | 에러율 증가, 성능 저하 | Discord | 24시간 내 |
| **Info** | 신규 기능 사용, 마일스톤 | 무시 | 주간 리뷰 |

---

## 알림 피로 방지

### Do

```
✓ Critical만 즉시 알림
✓ 동일 이슈 묶기 (Sentry 기본 기능)
✓ 업무 시간만 알림 (선택)
✓ 주기적 알림 규칙 리뷰
```

### Don't

```
✗ 모든 이벤트 알림
✗ Info 레벨 알림
✗ 중복 알림
✗ 테스트 환경 알림
```

---

## 초기 설정 체크리스트

```
□ Discord 서버/채널 생성
□ Discord 웹훅 URL 발급
□ Sentry Alert Rule 3개 설정
  □ 신규 에러
  □ 에러 급증
  □ 재발 이슈
□ Vercel 배포 알림 활성화
□ 테스트 에러 발생시켜 알림 확인
```

---

## 알림 테스트

### Sentry 테스트

```typescript
// 개발 환경에서 테스트
import * as Sentry from '@sentry/nextjs';

// 의도적 에러 발생
Sentry.captureException(new Error('Test alert'));
```

### 확인 사항

```
1. Discord에 알림 도착 확인
2. 알림 내용 확인 (에러명, 스택 트레이스 링크)
3. 클릭 시 Sentry 대시보드로 이동 확인
```
