// Cloudflare Pages Functions. 이 파일이 functions/api/claude.js에 있으면
// 자동으로 /api/claude 경로의 요청을 처리한다 (별도 라우팅 설정 불필요).
// API 키는 Cloudflare Pages 프로젝트의 환경변수(ANTHROPIC_API_KEY)로만 저장되고
// 브라우저(프론트엔드)에는 절대 노출되지 않는다.

export async function onRequestPost(context) {
  const { request, env } = context;
  const apiKey = env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    // 키가 없으면 실패 응답 -> App.jsx의 askClaude()가 null을 반환하고
    // 내장된 폴백 콘텐츠(피드백/이야기/추천)로 자동 대체된다. 앱은 계속 정상 동작한다.
    return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY가 Cloudflare Pages 환경변수에 설정되지 않았어요." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await request.text();
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body,
    });
    const data = await upstream.text();
    return new Response(data, {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// 다른 메서드로 오는 요청(GET 등)은 막아둔다.
export async function onRequestGet() {
  return new Response(JSON.stringify({ error: "POST만 지원해요" }), {
    status: 405,
    headers: { "Content-Type": "application/json" },
  });
}
