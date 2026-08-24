# Younique Studymate — 독립 웹앱 배포 가이드

이 폴더는 Claude 계정 없이 누구나 폰/태블릿 브라우저로 접속해서 쓸 수 있는 **진짜 웹사이트**로 만들기 위한 프로젝트예요.
사람마다 이메일로 로그인하면 각자의 기록이 따로 저장되고, 같은 이메일로 다른 기기에서 로그인하면 이어서 볼 수 있어요.

개발 경험이 없어도 따라 할 수 있게 순서대로 적어뒀어요. 전부 **무료 요금제**로 충분합니다.

---

## 무엇이 필요한가요?

1. **Supabase** 계정 (무료) — 로그인 + 각자의 기록 저장용 데이터베이스
2. **Cloudflare** 계정 (무료) — 실제로 사이트가 열리는 곳 (Cloudflare Pages 호스팅)
3. **(선택) Anthropic API 키** — AI가 자동으로 만들어주는 하루 코멘트/이야기/추천 기능을 살리고 싶다면 필요. 안 넣어도 앱은 정상 작동하고, 그 부분만 미리 준비된 문구로 대체돼요.

---

## 1단계. Supabase 설정 (로그인 + 데이터 저장)

1. https://supabase.com 에서 무료 회원가입 후 **New Project** 생성 (이름은 아무거나, 리전은 Seoul 추천)
2. 프로젝트가 만들어지면 왼쪽 메뉴 **SQL Editor** 클릭 → 이 프로젝트 폴더의 `supabase-schema.sql` 파일 내용을 그대로 붙여넣고 **Run** 실행
   - 이건 "각자의 기록을 각자만 볼 수 있게" 하는 테이블과 보안 규칙을 만드는 작업이에요.
3. 왼쪽 메뉴 **Authentication → Providers → Email** 에서 "Confirm email"을 꺼두면(off) 테스트가 더 편해요 (선택사항).
4. 왼쪽 메뉴 **Settings → API** 로 가서 아래 두 값을 복사해두세요:
   - `Project URL` → 나중에 `VITE_SUPABASE_URL`
   - `anon public` key → 나중에 `VITE_SUPABASE_ANON_KEY`

### 카카오 로그인 켜기 (선택이지만 추천)

학생들이 이메일보다 훨씬 편하게 로그인할 수 있어요. 앱 코드에는 이미 카카오 로그인 버튼이 들어가 있어서, Supabase와 카카오 개발자 사이트 설정만 하면 바로 동작해요.

1. **카카오 개발자 앱 만들기**
   - https://developers.kakao.com 접속 → 로그인 → **내 애플리케이션 → 애플리케이션 추가하기**
   - 앱 이름: `Younique Studymate` (아무 이름이나 가능) → 저장
2. **REST API 키 확인**
   - 방금 만든 앱 → **앱 설정 → 앱 키**에서 `REST API 키` 복사해두기
3. **Client Secret 만들기**
   - **앱 설정 → 카카오 로그인 → 보안**에서 **Client Secret 생성** → 값 복사해두기 → 상태를 **사용함**으로 변경
4. **카카오 로그인 활성화 + Redirect URI 등록**
   - **제품 설정 → 카카오 로그인**에서 활성화 ON
   - **Redirect URI**에 아래 형태로 등록 (Supabase 프로젝트의 **Authentication → Providers → Kakao** 화면에 있는 "Callback URL"을 그대로 복사해서 붙여넣기):
     `https://your-project.supabase.co/auth/v1/callback`
5. **동의항목 설정**
   - **제품 설정 → 카카오 로그인 → 동의항목**에서 `닉네임`은 기본 제공, 이메일이 필요하면 비즈 앱 전환 후 이메일 항목을 켤 수 있어요 (선택사항 — 지금 앱은 이메일 없이도 로그인만 되면 충분해요).
6. **Supabase에 카카오 정보 입력**
   - Supabase 대시보드 → **Authentication → Providers → Kakao** → 활성화 ON
   - `Client ID`에 2번의 REST API 키, `Client Secret`에 3번에서 만든 값 입력 → **Save**

이제 배포된 사이트에서 "카카오로 3초만에 시작하기" 버튼을 누르면 카카오 로그인 창이 뜨고, 로그인 후 자동으로 앱으로 돌아와요.

---

## 2단계. (선택) Anthropic API 키 발급

AI가 매일 자동으로 새로운 코멘트/이야기를 생성해주는 기능을 쓰고 싶다면:

1. https://console.anthropic.com 가입 후 **API Keys** 메뉴에서 키 생성
2. 결제 정보 등록 (사용한 만큼만 과금, 이 앱 정도 사용량이면 한 달에 매우 저렴한 수준이에요)
3. 이 키는 **절대 프론트엔드 코드에 넣지 않고**, 다음 단계에서 Vercel의 서버 환경변수에만 등록합니다 (그래야 안전해요).

이 단계를 건너뛰어도 앱은 완전히 동작해요. AI 생성 코멘트 대신 미리 준비된 격려 문구/이야기가 나올 뿐이에요.

---

## 3단계. Cloudflare Pages에 배포하기

이 프로젝트는 Cloudflare Pages 전용 서버리스 함수(`functions/api/claude.js`)가 이미 포함돼 있어서, 별도 설정 없이 폴더째로 올리기만 하면 API 프록시까지 자동으로 같이 배포돼요.

### 방법 A — GitHub 연동 (가장 편함, 이후 코드 수정해도 자동 재배포)
1. 이 폴더 전체를 GitHub 저장소로 올리기 (비공개 저장소로 해도 무방)
2. https://dash.cloudflare.com 접속 → 왼쪽 메뉴 **Workers & Pages** → **Create application** → **Pages** 탭 → **Connect to Git**
3. 방금 올린 저장소 선택 → 아래 값 입력:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. **Environment variables (Production)**에 아래 값 추가 (Preview 환경에도 똑같이 추가해주면 좋아요):
   - `VITE_SUPABASE_URL` = (1단계에서 복사한 값)
   - `VITE_SUPABASE_ANON_KEY` = (1단계에서 복사한 값)
   - `ANTHROPIC_API_KEY` = (2단계에서 만든 키, 선택사항 — 이건 서버 함수에서만 쓰여서 안전해요)
5. **Save and Deploy** 클릭 → 1~2분 후 `https://프로젝트이름.pages.dev` 링크 완성

> ⚠️ `VITE_`로 시작하는 값은 빌드할 때 코드에 새겨지는 값이라, 나중에 값을 바꾸면 **재배포(Retry deployment)**를 한 번 눌러줘야 반영돼요.

### 방법 B — GitHub 없이 컴퓨터에서 바로 (Wrangler CLI)
```bash
npm install -g wrangler
cd younique-studymate-app
npm install
npm run build
wrangler login

# 최초 1회: 프로젝트 생성 및 배포
wrangler pages deploy dist --project-name=younique-studymate

# 환경변수 등록 (Production 환경 기준)
wrangler pages secret put ANTHROPIC_API_KEY --project-name=younique-studymate
```
`VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`는 빌드 시점에 필요한 값이라, CLI로 할 땐 로컬에 `.env` 파일을 만들어 채운 뒤(`.env.example` 참고) `npm run build`를 실행하면 돼요. (아래 "로컬에서 미리 확인해보고 싶다면" 참고)

배포가 끝나면 나오는 링크(`https://프로젝트이름.pages.dev`)를 다른 사람들에게 공유하면, 각자 폰/태블릿 브라우저에서 접속해서 이메일로 로그인하고 바로 쓸 수 있어요.

### (참고) Vercel을 쓰고 싶다면
프로젝트 루트의 `api/claude.js`가 Vercel용으로 이미 준비돼 있어요. Vercel 대시보드에서 이 저장소를 Import하고 같은 환경변수 3개(`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `ANTHROPIC_API_KEY`)만 등록하면 동일하게 동작해요.

---

## 로컬에서 미리 확인해보고 싶다면

```bash
npm install
cp .env.example .env
# .env 파일을 열어서 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 채우기
npm run dev
```
브라우저에서 `http://localhost:5173` 로 접속하면 됩니다. (이 방식에서는 `/api/claude`가 동작하지 않아 AI 기능은 폴백 문구로 대체돼요.)

AI 기능까지 로컬에서 테스트하고 싶다면 Wrangler로 실행하세요:
```bash
npm run build
echo "ANTHROPIC_API_KEY=여기에_키" > .dev.vars
npx wrangler pages dev dist
```

---

## 자주 묻는 것들

**Q. 친구가 저장한 데이터를 내가 볼 수 있나요?**
아니요. Supabase 보안 규칙(RLS)으로 각자 자기 계정의 데이터만 보이게 막아뒀어요.

**Q. 나중에 학생 수가 많아지면 요금이 나오나요?**
Supabase, Vercel 둘 다 무료 요금제로 개인/소규모 그룹이 쓰기엔 충분해요. Anthropic API만 사용한 만큼 과금돼요 (안 넣어도 무방).

**Q. 카카오로 로그인했다가 나중에 이메일로 로그인하면 다른 계정이 되나요?**
네, 둘은 서로 다른 계정으로 취급돼요 (카카오 계정 하나, 이메일 계정 하나). 학생마다 로그인 방법을 하나로 통일해서 안내해주는 게 헷갈리지 않아요. 예: "카카오로만 로그인하기"로 통일.

**Q. 이메일 로그인 대신 그냥 이름만 입력하게 하고 싶어요.**
가능은 하지만, 기기가 바뀌어도 데이터가 이어지려면 어떤 형태로든 "계정 식별자"가 필요해요. 지금은 이메일 매직링크(비밀번호 없이 메일의 링크만 누르면 로그인)라 가장 간단하고 안전한 방식으로 골랐어요.

**Q. 코드를 더 예쁜 도메인(예: study.mysite.com)으로 연결하고 싶어요.**
Cloudflare Pages 프로젝트의 **Custom domains** 메뉴에서 원하는 도메인을 연결할 수 있어요. 도메인 자체를 Cloudflare에서 이미 관리 중이라면 몇 분 안에 자동으로 연결돼요 (다른 곳에서 산 도메인이면 네임서버 안내를 따라주면 돼요).
