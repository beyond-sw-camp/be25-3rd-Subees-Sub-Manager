# Merge Notes

## Base
- 기준 브랜치: `feature_auth-rec`

## Auth/AI preserved as-is
- 사용자 인증 관련 공통 UI
- AI 추천 페이지 및 관련 라우트
- 사이드바의 AI 추천 메뉴/흐름
- `auth-rec` 기준 공통 레이아웃 및 스타일

## Applied merges from other branches

### From `feature_consumption`
- `PaymentCalendarPage.vue`
  - 우측 패널에 `월별 / 카테고리` 전환 UI 반영
  - 카테고리별 소비 요약 패널 반영

### From `feature_community`
- `CommunityBoardPage.vue`
  - 게시판을 단일 컬럼 중심 레이아웃으로 정리
  - 최근 게시글/운영 팁 사이드 영역 제거
  - 정렬 툴바를 간소화
- `CommunityPostCard.vue`
  - 카드 배지/미리보기/스크랩 수 노출 축소
- `CommunityPostDetailPage.vue`
  - 상단 액션 버튼 배치 변경
  - 태그/우측 보조 패널 숨김
  - 하단 액션 버튼 재배치
- `CommunityPostFormPage.vue`
  - 태그 입력 영역 숨김
- `CommunityScrapPage.vue`
  - 보조 설명 문구 축소
- `SubscriptionCreatePage.vue`
  - 등록 완료 후 `/subscriptions` 로 이동

## Additional integration fixes
- 비밀번호 재설정 라우트 유지
  - `/password/reset/request`
  - `/password/reset/change`
- 로그인 화면의 `비밀번호 찾기` 링크 유지
- `CommunityToolbar` 단순화에 맞춰 `CommunityBoardPage` props 연결도 같이 정리
- `CommunityStats.vue` 는 현재 화면에서 사용하지 않도록 빈 컴포넌트로 정리

## Not merged intentionally
- `feature_consumption`, `feature_community` 에서 공통 레이아웃/AppSidebar/router 를 통째로 덮어쓰는 변경 중
  `auth-rec` 의 사용자/AI 흐름을 깨는 부분은 제외
- `api/http.js`, `stores/community.js` 의 실질 기능 변화 없는 변경은 제외

## Validation
- 수정된 `.vue` 파일들은 Vue SFC 파서 기준으로 구문 검증 완료
- 전체 빌드는 로컬 의존성 재설치가 필요함

## Packaging
- 업로드된 `node_modules` 는 Windows용 바이너리가 섞여 있어 제외함
- 로컬에서 `npm install` 후 실행/빌드 권장
