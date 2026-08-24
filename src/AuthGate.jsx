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

export default function AuthGate() {
  const [session, setSession] = useState(undefined); // undefined = 로딩중
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);

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

  const sendMagicLink = async (e) => {
    e.preventDefault();
    setError(null);
    setSending(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    setSending(false);
    if (error) setError(error.message);
    else setSent(true);
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
          <div style={{ color: "#767A85", fontSize: 13, marginBottom: 20 }}>
            이메일로 로그인하면 내 학습 기록이 이 계정에 저장되고, 다른 기기에서도 같은 이메일로 로그인하면 이어서 볼 수 있어.
          </div>
          {sent ? (
            <div style={{ fontSize: 14, lineHeight: 1.6 }}>
              <b>{email}</b>로 로그인 링크를 보냈어요. 메일함(스팸함도 확인!)에서 링크를 눌러줘.
            </div>
          ) : (
            <form onSubmit={sendMagicLink}>
              <input
                type="email"
                required
                placeholder="이메일 주소"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1.5px solid #E7E2D6",
                  fontSize: 14,
                  marginBottom: 10,
                }}
              />
              <button
                type="submit"
                disabled={sending}
                style={{
                  width: "100%",
                  padding: "11px 0",
                  borderRadius: 10,
                  border: "none",
                  background: "#1B1F3B",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                {sending ? "보내는 중..." : "로그인 링크 받기"}
              </button>
              {error && <div style={{ color: "#E8615A", fontSize: 12, marginTop: 8 }}>{error}</div>}
            </form>
          )}
        </div>
      </div>
    );
  }

  return <App />;
}
