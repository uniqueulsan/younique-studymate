// 관리자 전용: 학생 아이디로 비밀번호를 강제로 재설정하는 함수.
// SUPABASE_SERVICE_ROLE_KEY는 절대 프론트엔드(VITE_ 변수)에 넣지 말고,
// 이 함수 전용 서버 환경변수로만 등록해야 안전하다 (Cloudflare Pages 환경변수).

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json" } });
}

const ID_DOMAIN = "@studymate.local";

export async function onRequestPost(context) {
  const { request, env } = context;
  const SUPABASE_URL = env.VITE_SUPABASE_URL;
  const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
  const ADMIN_SECRET = env.ADMIN_SECRET;

  if (!SUPABASE_URL || !SERVICE_KEY || !ADMIN_SECRET) {
    return json({ error: "서버 환경변수(SUPABASE_SERVICE_ROLE_KEY 또는 ADMIN_SECRET)가 설정되지 않았어요." }, 500);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "요청 형식이 올바르지 않아요." }, 400);
  }
  const { adminSecret, studentId, newPassword } = body || {};

  if (adminSecret !== ADMIN_SECRET) {
    return json({ error: "관리자 비밀번호가 틀렸어요." }, 401);
  }
  if (!studentId || !/^[a-zA-Z0-9_]{3,20}$/.test(studentId.trim())) {
    return json({ error: "학생 아이디 형식이 올바르지 않아요 (영문/숫자/밑줄, 3~20자)." }, 400);
  }
  if (!newPassword || newPassword.length < 6) {
    return json({ error: "새 비밀번호는 6자 이상이어야 해요." }, 400);
  }

  const email = `${studentId.trim().toLowerCase()}${ID_DOMAIN}`;

  // 1) 아이디(가짜 이메일)로 실제 사용자 찾기
  let foundUser = null;
  let page = 1;
  while (!foundUser) {
    const listRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=${page}&per_page=1000`, {
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
    });
    const listData = await listRes.json();
    if (!listRes.ok) return json({ error: listData?.message || "사용자 목록을 불러오지 못했어요." }, 500);
    const users = listData.users || [];
    foundUser = users.find((u) => (u.email || "").toLowerCase() === email);
    if (foundUser || users.length < 1000) break;
    page++;
  }

  if (!foundUser) {
    return json({ error: `'${studentId}' 아이디로 가입된 학생을 찾지 못했어요. 아이디 철자를 다시 확인해줘.` }, 404);
  }

  // 2) 비밀번호 강제 변경
  const updateRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${foundUser.id}`, {
    method: "PUT",
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password: newPassword }),
  });
  const updateData = await updateRes.json();
  if (!updateRes.ok) {
    return json({ error: updateData?.message || "비밀번호 변경에 실패했어요." }, 500);
  }

  return json({ success: true, studentId: studentId.trim() });
}

export async function onRequestGet() {
  return json({ error: "POST만 지원해요" }, 405);
}
