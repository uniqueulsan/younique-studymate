// Vercel 서버리스 함수. 프론트엔드는 절대 Anthropic API 키를 갖지 않고,
// 이 함수가 서버에서만 보관된 키(ANTHROPIC_API_KEY 환경변수)로 대신 호출해준다.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "POST만 지원해요" });
    return;
  }
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // 키가 없으면 실패로 응답 -> 프론트엔드(App.jsx)의 askClaude가 null을 반환하고
    // 내장된 폴백 콘텐츠(피드백/이야기/추천)로 자동 대체된다. 앱 전체가 멈추지 않는다.
    res.status(500).json({ error: "ANTHROPIC_API_KEY가 서버에 설정되지 않았어요." });
    return;
  }
  try {
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(req.body),
    });
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
