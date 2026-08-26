import React, { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import { setStorageUserId, installWindowStorage } from "./lib/storage";
import App from "./App";

const wrap = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#FBF8F3",
  fontFamily: "'Pretendard', -apple-system, sans-serif",
  padding: 20,
};
const card = {
  background: "#fff",
  borderRadius: 20,
  padding: 28,
  maxWidth: 360,
  width: "100%",
  boxShadow: "0 2px 12px rgba(0,0,0,.06)",
  border: "1px solid #E7E2D6",
};
const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1.5px solid #E7E2D6",
  fontSize: 14,
  marginBottom: 10,
};
const primaryBtn = {
  width: "100%",
  padding: "11px 0",
  borderRadius: 10,
  border: "none",
  background: "#1B1F3B",
  color: "#fff",
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
};

// 아이디를 Supabase가 요구하는 이메일 형식으로 변환 (실제 이메일이 아니라 내부용 가짜 도메인)
const ID_DOMAIN = "@studymate.local";
const toInternalEmail = (id) => `${id.trim().toLowerCase()}${ID_DOMAIN}`;

function friendlyError(msg) {
  if (!msg) return "";
  if (msg.includes("Invalid login credentials")) return "아이디 또는 비밀번호가 올바르지 않아요.";
  if (msg.includes("already registered") || msg.includes("already exists")) return "이미 있는 아이디예요. 로그인을 눌러줘.";
  if (msg.includes("Password should be at least")) return "비밀번호는 6자 이상이어야 해요.";
  if (msg.includes("Unable to validate email")) return "아이디에 특수문자나 공백은 쓸 수 없어요. 영문/숫자로만 만들어줘.";
  return msg;
}

export default function AuthGate() {
  const [session, setSession] = useState(undefined); // undefined = 로딩중
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [signupDone, setSignupDone] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => setSession(sess));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      setStorageUserId(session.user.id);
      installWindowStorage();
    }
  }, [session]);

  const idValid = /^[a-zA-Z0-9_]{3,20}$/.test(userId.trim());

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!idValid) {
      setError("아이디는 영문/숫자/밑줄(_)로 3~20자로 만들어줘.");
      return;
    }
    if (password.length < 6) {
      setError("비밀번호는 6자 이상으로 만들어줘.");
      return;
    }
    if (mode === "signup" && password !== password2) {
      setError("비밀번호가 서로 달라. 다시 확인해줘.");
      return;
    }

    setLoading(true);
    const email = toInternalEmail(userId);

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      setLoading(false);
      if (error) setError(friendlyError(error.message));
      else setSignupDone(true);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) setError(friendlyError(error.message));
    }
  };

  const switchMode = (m) => {
    setMode(m);
    setError(null);
    setSignupDone(false);
    setPassword("");
    setPassword2("");
  };

  if (session === undefined) {
    return <div style={wrap}>불러오는 중...</div>;
  }

  if (!session) {
    return (
      <div style={wrap}>
        <div style={card}>
          <img src="/icon-512.png" alt="Younique Studymate" style={{ width: 56, height: 56, display: "block", marginBottom: 10 }} />
          <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 4 }}>Younique Studymate</div>
          <div style={{ color: "#767A85", fontSize: 13, marginBottom: 18 }}>
            아이디와 비밀번호로 로그인하면 내 학습 기록이 저장되고, 다른 기기에서도 같은 아이디로 로그인하면 이어서 볼 수 있어.
          </div>

          <div style={{ display: "flex", gap: 6, marginBottom: 16, background: "#F3F1EA", borderRadius: 10, padding: 4 }}>
            <button
              onClick={() => switchMode("login")}
              style={{
                flex: 1, padding: "8px 0", borderRadius: 8, border: "none", cursor: "pointer",
                background: mode === "login" ? "#fff" : "transparent",
                fontWeight: 600, fontSize: 13, color: mode === "login" ? "#1B1F3B" : "#9AA0AE",
                boxShadow: mode === "login" ? "0 1px 3px rgba(0,0,0,.08)" : "none",
              }}
            >
              로그인
            </button>
            <button
              onClick={() => switchMode("signup")}
              style={{
                flex: 1, padding: "8px 0", borderRadius: 8, border: "none", cursor: "pointer",
                background: mode === "signup" ? "#fff" : "transparent",
                fontWeight: 600, fontSize: 13, color: mode === "signup" ? "#1B1F3B" : "#9AA0AE",
                boxShadow: mode === "signup" ? "0 1px 3px rgba(0,0,0,.08)" : "none",
              }}
            >
              회원가입
            </button>
          </div>

          {signupDone ? (
            <div style={{ fontSize: 14, lineHeight: 1.6 }}>
              가입이 완료됐어! <b>{userId}</b> 아이디로 이제 로그인해줘.
              <button style={{ ...primaryBtn, marginTop: 14 }} onClick={() => switchMode("login")}>로그인하러 가기</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                required
                placeholder="아이디 (영문/숫자, 3~20자)"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                style={inputStyle}
                autoCapitalize="off"
                autoCorrect="off"
              />
              <input
                type="password"
                required
                placeholder="비밀번호 (6자 이상)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
              />
              {mode === "signup" && (
                <input
                  type="password"
                  required
                  placeholder="비밀번호 확인"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  style={inputStyle}
                />
              )}
              <button type="submit" disabled={loading} style={primaryBtn}>
                {loading ? "처리 중..." : mode === "signup" ? "가입하기" : "로그인"}
              </button>
              {error && <div style={{ color: "#E8615A", fontSize: 12, marginTop: 10 }}>{error}</div>}
            </form>
          )}

          {mode === "login" && !signupDone && (
            <div style={{ fontSize: 11, color: "#9AA0AE", marginTop: 14, lineHeight: 1.5 }}>
              비밀번호를 잊어버렸다면 선생님께 문의해줘.
            </div>
          )}
        </div>
      </div>
    );
  }

  return <App onLogout={() => supabase.auth.signOut()} />;
}
