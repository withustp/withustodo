# WithUs Todo (위더스 투두)

**WithUs Todo**는 개인 생산성 및 작업 관리를 위한 올인원 프리미엄 생산성 웹 애플리케이션입니다.

---

## 🌟 주요 기능 (Key Features)

- **다중 뷰 할 일 관리**: 목록(List), 칸반 보드(Kanban), 스프레드시트 테이블(Table) 3개 뷰 실시간 전환
- **카카오톡 & 인앱 리마인더**: 나에게 보내기 API 연동 및 맞춤형 반복 알림
- **뽀모도로 포커스 타이머**: 25분 집중 / 5분 휴식 사이클 및 실제 태스크 연동 시간 측정
- **대시보드 & 통계 분석**: 실시간 진행률, 마감 임박 태스크, 카테고리별 비중 분석 차트
- **다국어 및 다크 모드**: 한국어/영어 즉시 전환 및 글래스모피즘(Glassmorphism) 기반 다크/라이트 테마
- **휴지통 & 안전 복원**: 소프트 삭제된 작업 복원 및 일괄 영구 삭제

---

## 🚀 빠른 시작 (Getting Started)

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
`.env.example`을 복사하여 `.env.local`을 생성하고 키를 입력합니다:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

NEXT_PUBLIC_KAKAO_REST_API_KEY=your-kakao-key
NEXT_PUBLIC_KAKAO_REDIRECT_URI=http://localhost:3000/api/auth/callback
KAKAO_ADMIN_KEY=your-admin-key
```

### 3. 로컬 실행
```bash
npm run dev
```
브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속합니다.
