import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  BookOpen, Calendar, CheckCircle2, Circle, TrendingUp, AlertTriangle,
  Sparkles, Coffee, User, Settings2, ChevronRight, ChevronLeft, Plus,
  Trash2, RefreshCw, Star, Trophy, Clock, X, Loader2, Flame, Target,
  BarChart3, BookMarked, Sunrise
} from "lucide-react";

/* ============================== 상수 & 데이터 ============================== */

const DIM_LABEL = {
  visual: "시각형", auditory: "청각형", kinesthetic: "실전형", readwrite: "읽기·쓰기형",
};

const QUESTIONS = [
  {
    id: "style", text: "새로운 내용을 배울 때, 나에게 가장 잘 맞는 방법은?",
    options: [
      { label: "그림·도표·색깔로 정리하면 머리에 쏙 들어온다", val: "visual" },
      { label: "소리내어 읽거나 설명을 들을 때 이해가 잘 된다", val: "auditory" },
      { label: "직접 문제를 풀어보며 몸으로 익혀야 남는다", val: "kinesthetic" },
      { label: "손으로 써가며 노트에 정리해야 정리가 된다", val: "readwrite" },
    ],
  },
  {
    id: "focusSpan", text: "한 번 앉으면 흐트러지지 않고 집중할 수 있는 시간은?",
    options: [
      { label: "15~20분 정도, 그 이상은 딴생각이 든다", val: "short" },
      { label: "30~45분 정도는 무난하다", val: "medium" },
      { label: "1시간 이상도 몰입해서 할 수 있다", val: "long" },
      { label: "그날 컨디션에 따라 완전히 다르다", val: "variable" },
    ],
  },
  {
    id: "execution", text: "세운 학습 계획을 실제로 얼마나 잘 지키나요?",
    options: [
      { label: "거의 항상 계획대로 실행한다", val: "high" },
      { label: "절반 정도는 밀리는 편이다", val: "mid" },
      { label: "자주 밀리고 몰아서 하게 된다", val: "low" },
      { label: "계획을 세워도 잘 안 지켜지는 게 고민이다", val: "verylow" },
    ],
  },
  {
    id: "stressType", text: "시험이 다가올 때 나의 모습에 가장 가까운 것은?",
    options: [
      { label: "미리미리 준비해서 여유있게 맞이한다", val: "early" },
      { label: "막판에 몰아서 벼락치기를 한다", val: "cram" },
      { label: "부담스러워서 자꾸 다른 일을 하며 미룬다", val: "avoid" },
      { label: "불안해서 오히려 손에 안 잡힌다", val: "anxious" },
    ],
  },
  {
    id: "reviewHabit", text: "틀린 문제나 이해 안 되는 부분을 만나면?",
    options: [
      { label: "바로 다시 풀어보고 확실히 짚고 넘어간다", val: "immediate" },
      { label: "체크만 해두고 나중에 몰아서 본다", val: "later" },
      { label: "일단 넘어가고 잘 안 돌아본다", val: "skip" },
      { label: "속상해서 그 부분은 피하게 된다", val: "avoid" },
    ],
  },
  {
    id: "motivation", text: "나를 가장 움직이게 하는 동기는?",
    options: [
      { label: "목표를 이뤘을 때의 성취감과 보상", val: "goal" },
      { label: "친구나 경쟁자보다 잘하고 싶은 마음", val: "compete" },
      { label: "주변에서 인정받고 칭찬받는 것", val: "recognition" },
      { label: "내가 정말 이해했다는 지적 만족감", val: "meaning" },
    ],
  },
];

const FALLBACK_STORIES = [
  { title: "스몰 스텝의 힘", body: "큰 목표를 통째로 보면 막막하지만, 오늘 할 일을 손바닥만큼 작게 쪼개면 시작이 쉬워진다. 어느 수험생 선배는 '하루에 딱 한 단원'만 정하고 그걸 지킨 것만으로 6개월 뒤 완전히 다른 성적표를 받았다." },
  { title: "파인만 기법", body: "정말 이해했는지 확인하는 가장 좋은 방법은, 그 내용을 아무것도 모르는 친구에게 설명해보는 것이다. 설명하다가 막히는 지점, 거기가 바로 다시 공부해야 할 부분이다." },
  { title: "25분의 마법", body: "뽀모도로 기법: 25분 집중 + 5분 휴식. 완벽한 컨디션을 기다리지 말고, 일단 25분 타이머를 누르는 사람이 결국 더 많이 해낸다." },
  { title: "틀린 문제가 보물인 이유", body: "맞은 문제는 이미 아는 것이고, 틀린 문제만이 나의 다음 점수를 올려준다. 오답노트를 귀찮아하지 않는 사람이 결국 상위권으로 올라간다." },
  { title: "잠은 배신하지 않는다", body: "벼락치기로 밤을 새운 기억력보다, 충분히 자고 아침에 30분 복습한 기억력이 시험장에서 훨씬 오래 살아남는다." },
  { title: "완벽보다 완료", body: "노트를 예쁘게 꾸미는 데 30분을 쓰는 것보다, 못생겨도 오늘 계획한 3문제를 다 푸는 것이 시험에는 훨씬 도움이 된다." },
];

/* ---- 쉬는시간 5분 서프라이즈 팝업용 콘텐츠 풀 ---- */
const SURPRISE_JOKES = [
  "국어 선생님이 제일 좋아하는 인사말은? '주어 없이 왔다가 서술어 없이 갑니다.'",
  "수학 문제집이 화났을 때 하는 말은? '풀지도 않고 왜 덮어!'",
  "영어 단어장이 다이어트에 실패한 이유? 계속 '외워'서(외워도 안 빠져서).",
  "쉬는 시간에 제일 빨리 끝나는 것은? 바로 이 쉬는 시간.",
  "역사 선생님이 가장 좋아하는 계절은? '조선'시대.",
  "과학 시간에 제일 무서운 말은? '이번 단원까지 시험 범위입니다.'",
];
const SURPRISE_STRETCHES = [
  "목을 좌우로 천천히 10초씩 기울여보자. 목 뒤가 시원해질 거야.",
  "양쪽 어깨를 귀 쪽으로 으쓱 5번, 뒤로 크게 5번 돌려보자.",
  "의자에서 일어나 제자리에서 30초만 걸어보자. 혈액순환이 확 달라져.",
  "손목을 앞뒤로 10번씩 돌려서 풀어주자. 필기하느라 뭉친 손목이 풀릴 거야.",
  "창밖 먼 곳을 20초만 바라보자. 눈의 초점 근육이 쉴 수 있어.",
  "양팔을 머리 위로 쭉 뻗고 크게 기지개를 켜보자.",
];
const SURPRISE_ENCOURAGE = [
  "지금까지 버틴 것만으로도 어제의 너보다 나아졌어.",
  "완벽하지 않아도 괜찮아, 오늘은 '했다'는 게 중요해.",
  "5분만 완전히 다른 생각을 해보자. 뇌도 쉼이 필요하거든.",
  "물 한 잔 마시고 오자 — 집중력이 은근히 물 한 잔 차이야.",
  "지금 이 순간에도 넌 조금씩 나아지고 있어.",
  "잘하고 있어. 진짜로.",
];
const SURPRISE_TRIVIA = [
  "문어는 심장이 3개래. 두 개는 아가미로, 한 개는 온몸으로 피를 보낸대.",
  "꿀은 상하지 않아서 수천 년 전 유적에서 나온 꿀도 먹을 수 있는 상태였대.",
  "번개 한 줄기의 순간 온도는 태양 표면보다 뜨겁대.",
  "사람 몸에서 가장 강한 근육은 턱 근육(교근)이래.",
  "바나나는 식물학적으로 '베리류'에 속한대. 딸기는 아니고.",
  "심장은 하루에 약 10만 번 뛴대. 쉬지 않고 일하는 중이야.",
];
function pickSurprise(excludeKey) {
  const pool = [
    ...SURPRISE_JOKES.map((t) => ({ type: "joke", icon: "😄", label: "빵 터지는 순간", text: t })),
    ...SURPRISE_STRETCHES.map((t) => ({ type: "stretch", icon: "🧘", label: "몸 풀기", text: t })),
    ...SURPRISE_ENCOURAGE.map((t) => ({ type: "encourage", icon: "💛", label: "응원 한마디", text: t })),
    ...SURPRISE_TRIVIA.map((t) => ({ type: "trivia", icon: "🤓", label: "5초 상식", text: t })),
    ...FALLBACK_STORIES.map((s) => ({ type: "story", icon: "📖", label: s.title, text: s.body })),
  ];
  const key = (item) => `${item.type}:${item.text}`;
  const candidates = pool.filter((p) => key(p) !== excludeKey);
  const picked = candidates[Math.floor(Math.random() * candidates.length)];
  return { ...picked, key: key(picked) };
}

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
const pad = (n) => String(n).padStart(2, "0");
const toStr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayStr = () => toStr(new Date());
const addDays = (dateStr, n) => { const d = new Date(dateStr + "T00:00:00"); d.setDate(d.getDate() + n); return toStr(d); };
const diffDays = (a, b) => Math.round((new Date(a + "T00:00:00") - new Date(b + "T00:00:00")) / 86400000);
const fmtKor = (dateStr) => { const d = new Date(dateStr + "T00:00:00"); return `${d.getMonth() + 1}월 ${d.getDate()}일`; };
const WEEK = ["일", "월", "화", "수", "목", "금", "토"];
const TIME_RULER = Array.from({ length: 18 }, (_, i) => String(6 + i).padStart(2, "0")); // 06~23시
const SUBJECT_COLORS = ["#E8615A", "#4A63C7", "#4FAE7C", "#F2A93B", "#9B6FD6", "#2CA6C4", "#D6608F", "#7A8B3F"];
function subjectColor(name) {
  let h = 0;
  for (let i = 0; i < (name || "").length; i++) h = (h * 31 + name.charCodeAt(i)) % SUBJECT_COLORS.length;
  return SUBJECT_COLORS[h];
}
function fmtHMS(totalSec) {
  const s = Math.max(0, Math.round(totalSec));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return `${pad(h)}:${pad(m)}:${pad(sec)}`;
}
function fmtHM(totalMin) {
  const m = Math.max(0, Math.round(totalMin));
  return `${Math.floor(m / 60)}시간 ${m % 60}분`;
}

const STUDY_HOURS = ["16", "17", "18", "19", "20", "21", "22"]; // 방과후 기본 학습 배정 시간대
const ARRANGEMENTS = {
  morning: { label: "아침 집중형", hours: ["07", "08", "16", "17", "18"], desc: "등교 전 아침 시간을 활용해 집중력이 좋을 때 새 학습을 먼저 배치" },
  focus: { label: "저녁 몰입형", hours: ["17", "18", "19"], desc: "방과후 3시간에 몰아서 깊게 집중하는 배치" },
  spread: { label: "균등 분산형", hours: STUDY_HOURS, desc: "방과후~저녁 시간에 고르게 나눠 부담을 분산하는 기본 배치" },
};

/* ---- 일론 머스크식 초밀도 스케줄링 (10분 단위, 빈틈 없이, 우선순위 먼저) ----
   원칙: ①가장 중요/급한 일을 맨 앞에 배치 ②일정 사이 여백(버퍼) 없이 촘촘하게 연결
   ③유사한 일은 묶어서 전환 비용 최소화. 5분 단위 원본을 10분 단위로 적용. */
const MUSK_DURATION_SEGMENTS = { "final-review": 6, new: 4, review: 2, custom: 3, backlog: 3 };
const MUSK_SEG_COUNT = TIME_RULER.length * 6; // 06~23시, 10분 단위 총 슬롯 수

function segToHourSlot(idx) { return { hour: TIME_RULER[Math.floor(idx / 6)], slot: idx % 6 }; }
function hourSlotToSeg(hour, slot) { return TIME_RULER.indexOf(hour) * 6 + slot; }

function muskOrderTasks(tasks, backlogTasks, customTasks, priorityIds) {
  const pri = tasks.filter((t) => priorityIds.includes(t.id));
  const rest = tasks.filter((t) => !priorityIds.includes(t.id));
  const finalReview = rest.filter((t) => t.type === "final-review");
  const newTasks = rest.filter((t) => t.type === "new");
  const reviewTasks = rest.filter((t) => t.type === "review");
  // ①우선순위(TOP3) ②밀린 보충(가장 급함) ③시험 총정리 ④새 학습 ⑤복습, 뒤로 갈수록 낮은 긴급도
  return [...pri, ...backlogTasks.map((b) => ({ ...b, __seg: "backlog" })), ...finalReview, ...newTasks, ...reviewTasks, ...customTasks.map((c) => ({ ...c, __seg: "custom" }))];
}

function buildMuskSchedule(orderedTasks, startHour, startMin) {
  let idx = Math.max(0, hourSlotToSeg(startHour, Math.floor((startMin || 0) / 10)));
  const grid = {};
  const overrides = {};
  const overflow = [];
  orderedTasks.forEach((t) => {
    const key = t.__seg || t.type || "custom";
    const segs = MUSK_DURATION_SEGMENTS[key] || 3;
    if (idx + segs > MUSK_SEG_COUNT) { overflow.push(t); return; }
    const startSeg = idx;
    for (let k = 0; k < segs; k++) {
      const { hour, slot } = segToHourSlot(idx + k);
      if (!grid[hour]) grid[hour] = Array(6).fill(null);
      grid[hour][slot] = t.subjectId || "generic";
    }
    overrides[t.id] = segToHourSlot(startSeg).hour;
    idx += segs;
  });
  return { grid, overrides, overflow };
}
const MOOD_OPTS = [
  { v: "great", e: "😄", label: "최고" }, { v: "good", e: "🙂", label: "괜찮음" },
  { v: "meh", e: "😐", label: "그냥그럼" }, { v: "tired", e: "😮‍💨", label: "지침" }, { v: "stressed", e: "😣", label: "힘듦" },
];

function useNowTick(intervalMs = 20000) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

/* ============================== Storage 헬퍼 ============================== */

async function loadKey(key, fallback) {
  try {
    const res = await window.storage.get(key, false);
    return res ? JSON.parse(res.value) : fallback;
  } catch {
    return fallback;
  }
}
async function saveKey(key, value) {
  try { await window.storage.set(key, JSON.stringify(value), false); } catch (e) { console.error("save fail", key, e); }
}

/* ============================== Claude API 헬퍼 ============================== */

async function askClaude(prompt, maxTokens = 700) {
  try {
    const response = await fetch("/api/claude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-5", // 실제 배포 시 비용을 낮추려면 "claude-haiku-4-5-20251001"로 바꿔도 됨
        max_tokens: maxTokens,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await response.json();
    const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n");
    return text;
  } catch (e) {
    console.error("claude api fail", e);
    return null;
  }
}
function tryParseJSON(text) {
  if (!text) return null;
  try {
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch { return null; }
}

/* ============================== 진단 스코어링 ============================== */

function scoreDiagnosis(answers) {
  return {
    style: answers.style,
    focusSpan: answers.focusSpan,
    execution: answers.execution,
    stressType: answers.stressType,
    reviewHabit: answers.reviewHabit,
    motivation: answers.motivation,
    date: todayStr(),
  };
}

function diagnosisSummary(d) {
  if (!d) return null;
  const styleTxt = DIM_LABEL[d.style] || "혼합형";
  const focusTxt = { short: "짧고 굵게 집중하는 편", medium: "무난한 몰입 지속력", long: "장시간 몰입 가능", variable: "컨디션에 따라 편차가 큼" }[d.focusSpan];
  const execTxt = { high: "계획 실행력이 높음", mid: "가끔 계획이 밀림", low: "계획이 자주 밀리는 편", verylow: "계획 실행에 어려움을 느낌" }[d.execution];
  const stressTxt = { early: "미리 준비하는 성향", cram: "벼락치기 성향", avoid: "부담을 회피하는 성향", anxious: "시험 불안이 있는 성향" }[d.stressType];
  const reviewTxt = { immediate: "오답을 바로 짚고 넘어감", later: "오답을 몰아서 복습함", skip: "오답 복습을 잘 안 함", avoid: "틀린 부분을 피하는 경향" }[d.reviewHabit];
  const cautions = [];
  if (d.execution === "low" || d.execution === "verylow") cautions.push("하루 계획을 잘게 쪼개고, 체크리스트 완료율을 눈에 보이게 관리해야 함");
  if (d.stressType === "cram" || d.stressType === "avoid") cautions.push("시험 D-14 이전부터 미리 알림·체크인이 필요함 (막판 몰림 방지)");
  if (d.stressType === "anxious") cautions.push("완벽보다 '완료'를 목표로 부담을 낮추는 톤의 코멘트 필요");
  if (d.reviewHabit === "skip" || d.reviewHabit === "avoid") cautions.push("오답·복습 시간을 계획에 강제로 배치해야 함");
  if (cautions.length === 0) cautions.push("전반적으로 안정적인 학습 습관 — 심화 학습과 학습량 확장에 집중 가능");
  return { styleTxt, focusTxt, execTxt, stressTxt, reviewTxt, cautions };
}

// 시각화용 4개 축 점수(1~4) + 종합 성장 점수(0~100)
const SCORE_MAP = {
  focusSpan: { short: 2, medium: 3, long: 4, variable: 2 },
  execution: { high: 4, mid: 3, low: 2, verylow: 1 },
  stressType: { early: 4, cram: 2, avoid: 2, anxious: 2 },
  reviewHabit: { immediate: 4, later: 3, skip: 2, avoid: 1 },
};
const GROWTH_TIP = {
  focusSpan: "타이머로 25분 집중 + 5분 휴식(뽀모도로)을 반복하면 몰입 지속시간을 조금씩 늘릴 수 있어",
  execution: "하루 계획을 3개 이하로 잘게 쪼개고, 완료 체크가 눈에 보이게 관리해보자",
  stressType: "시험 D-14 전부터 하루 30분씩 미리 시작하는 습관을 들이면 막판 몰림이 줄어들어",
  reviewHabit: "틀린 문제를 바로 다시 풀어보는 3분 루틴만 붙여도 복습 습관이 크게 달라져",
};
const DIM_TITLE = { focusSpan: "집중력", execution: "실행력", stressType: "시험대응력", reviewHabit: "복습습관" };

function diagnosisScores(d) {
  if (!d) return null;
  const dims = ["focusSpan", "execution", "stressType", "reviewHabit"];
  const scores = {};
  dims.forEach((k) => { scores[k] = SCORE_MAP[k][d[k]] || 2; });
  const overall = Math.round((Object.values(scores).reduce((a, b) => a + b, 0) / (dims.length * 4)) * 100);
  const weakestDim = dims.reduce((a, b) => (scores[a] <= scores[b] ? a : b));
  return { scores, overall, weakestDim, weakestTip: GROWTH_TIP[weakestDim], weakestTitle: DIM_TITLE[weakestDim] };
}

function DiagnosisVisual({ diagnosis, diagHistory }) {
  const ds = diagnosisSummary(diagnosis);
  const sc = diagnosisScores(diagnosis);
  if (!ds || !sc) return null;
  const prev = diagHistory.length > 1 ? diagnosisScores(diagHistory[diagHistory.length - 2]) : null;
  const delta = prev ? sc.overall - prev.overall : null;
  const dims = ["focusSpan", "execution", "stressType", "reviewHabit"];

  return (
    <Card>
      <h2><Sparkles size={17} color="var(--amber)" /> 나의 학습 성향 진단</h2>
      <div className="ys-diag-visual">
        <div className="ys-diag-score-ring">
          <Ring size={104} stroke={10} pct={sc.overall / 100} color={sc.overall >= 75 ? "var(--mint)" : sc.overall >= 50 ? "var(--amber)" : "var(--coral)"} label={`${sc.overall}`} sub="성장점수" />
          {delta != null && (
            <div className={`ys-diag-delta ${delta >= 0 ? "up" : "down"}`}>
              {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}점 {delta >= 0 ? "상승" : "하락"} (지난 진단 대비)
            </div>
          )}
        </div>
        <div className="ys-diag-bars">
          {dims.map((k) => (
            <div key={k} className="ys-diag-bar-row">
              <span className="ys-diag-bar-label">{DIM_TITLE[k]}</span>
              <div className="ys-progress-bar sm"><div className="ys-progress-fill" style={{
                width: `${(sc.scores[k] / 4) * 100}%`,
                background: sc.scores[k] >= 3.5 ? "var(--mint)" : sc.scores[k] >= 2.5 ? "var(--amber)" : "var(--coral)",
              }} /></div>
            </div>
          ))}
        </div>
      </div>
      <div className="ys-diag-style-chip"><User size={12} /> 학습 유형: {ds.styleTxt}</div>
      <div className="ys-growth-box">
        <div className="ys-review-label">🌱 지금 가장 성장 가능성이 큰 영역: {sc.weakestTitle}</div>
        <p>{sc.weakestTip}</p>
      </div>
      <div className="ys-caution-box">
        <div className="ys-review-label">⚠ 이 진단을 바탕으로 앱이 계속 챙길 부분</div>
        <ul>{ds.cautions.map((c, i) => <li key={i}>{c}</li>)}</ul>
      </div>
    </Card>
  );
}

// total 기간(일) 안에서 target회 만큼, 시험이 가까워질수록 촘촘해지는 반복 스케줄(offset, 0-indexed) 생성
function repeatOffsets(total, target, curve = 1.6) {
  const t = Math.max(1, Math.min(target, Math.max(1, total)));
  const raw = [];
  for (let i = 1; i <= t; i++) {
    const frac = Math.pow(i / t, curve); // 뒤로 갈수록(시험 근접) 촘촘해지는 곡선
    raw.push(Math.round((total - 1) * frac));
  }
  for (let i = 1; i < raw.length; i++) if (raw[i] <= raw[i - 1]) raw[i] = raw[i - 1] + 1;
  const maxIdx = Math.max(0, total - 1);
  for (let i = raw.length - 1; i >= 0; i--) {
    if (raw[i] > maxIdx) raw[i] = maxIdx;
    if (i > 0 && raw[i] <= raw[i - 1]) raw[i - 1] = raw[i] - 1;
  }
  return raw.map((o) => Math.max(0, o));
}

const PLAN_STYLES = {
  cycle: { label: "반복주기형", curve: 1.8, firstPassFrac: 0.4, repBoost: 0, dayCap: null, desc: "같은 과목을 가까운 간격으로 집중 반복해서 빠르게 각인시키는 스타일" },
  mix: { label: "믹스형", curve: 1.3, firstPassFrac: 0.55, repBoost: -2, dayCap: 2, desc: "하루에 여러 과목을 골고루 섞어 지루하지 않게 병행하는 스타일" },
};

function buildPlan(subjects, exams, diagnosis, from, repTargetDefault = 10, style = "cycle") {
  const cfg = PLAN_STYLES[style] || PLAN_STYLES.cycle;
  const byDate = {};
  const weakSubjectNames = new Set();
  const repMeta = {}; // subtopicId -> {target, subjectName, unitTitle, title}

  exams.forEach((exam) => {
    const subject = subjects.find((s) => s.id === exam.subjectId);
    if (!subject) return;
    const daysLeft = Math.max(1, diffDays(exam.date, from));

    // 시험범위(scopeSubtopicIds)가 지정돼 있으면 그 범위만, 없으면 전체 미완료 소제목
    const hasScope = exam.scopeSubtopicIds && exam.scopeSubtopicIds.length > 0;
    const scopeItems = [];
    subject.units.forEach((unit) => unit.subtopics.forEach((st) => {
      const inScope = hasScope ? exam.scopeSubtopicIds.includes(st.id) : true;
      if (inScope) scopeItems.push({ subjectId: subject.id, subjectName: subject.name, unitTitle: unit.title, subtopicId: st.id, title: st.title, avgRating: st.avgRating || null });
    }));
    if (scopeItems.length === 0) return;

    const isWeak = subject.selfWeak || scopeItems.some((i) => i.avgRating != null && i.avgRating < 3);
    if (isWeak) weakSubjectNames.add(subject.name);
    const repTarget = Math.max(3, (isWeak ? repTargetDefault : Math.max(5, repTargetDefault - 3)) + cfg.repBoost);

    // 1회독(최초 학습) 시작일: 전체 기간의 앞부분 구간에 나눠 배치 (뒤쪽은 반복 회독용으로 비워둠)
    const firstPassWindow = Math.max(1, Math.floor(daysLeft * cfg.firstPassFrac));
    const perDay = Math.max(1, Math.ceil(scopeItems.length / firstPassWindow));

    scopeItems.forEach((it, idx) => {
      const startOffset = Math.min(firstPassWindow - 1, Math.floor(idx / perDay));
      const startDate = addDays(from, startOffset);
      const totalFromStart = Math.max(1, diffDays(exam.date, startDate));
      const offsets = repeatOffsets(totalFromStart, repTarget, cfg.curve);
      repMeta[it.subtopicId] = { target: offsets.length, subjectName: it.subjectName, unitTitle: it.unitTitle, title: it.title };
      offsets.forEach((off, passIdx) => {
        const dateStr = addDays(startDate, off);
        if (!byDate[dateStr]) byDate[dateStr] = [];
        byDate[dateStr].push({
          id: uid(), type: passIdx === 0 ? "new" : "review", repIndex: passIdx + 1, repTarget: offsets.length,
          subjectId: it.subjectId, subjectName: it.subjectName, unitTitle: it.unitTitle, subtopicId: it.subtopicId, title: it.title,
        });
      });
    });

    // 시험 전날: 시험범위 전체 총정리
    const finalDate = addDays(exam.date, -1);
    if (diffDays(finalDate, from) >= 0) {
      if (!byDate[finalDate]) byDate[finalDate] = [];
      byDate[finalDate].push({ id: uid(), type: "final-review", subjectId: subject.id, subjectName: subject.name, unitTitle: "시험 전 총정리", subtopicId: null, title: `${subject.name} 시험범위 전체(${scopeItems.length}개 소제목) 마지막 총정리` });
    }
  });

  // 믹스형: 하루에 같은 과목이 dayCap개를 넘으면 다음 날로 초과분을 넘겨 과목을 고르게 섞음
  if (cfg.dayCap) {
    const dates = Object.keys(byDate).sort();
    dates.forEach((dateStr, di) => {
      const bySubj = {};
      byDate[dateStr].forEach((t) => { (bySubj[t.subjectId] = bySubj[t.subjectId] || []).push(t); });
      Object.values(bySubj).forEach((list) => {
        if (list.length > cfg.dayCap) {
          const overflow = list.slice(cfg.dayCap);
          byDate[dateStr] = byDate[dateStr].filter((t) => !overflow.includes(t));
          const nextDate = dates[di + 1] || addDays(dateStr, 1);
          if (!byDate[nextDate]) byDate[nextDate] = [];
          byDate[nextDate].push(...overflow);
        }
      });
    });
  }

  // 10분플래너 스타일: 날짜별 과제에 기본 시간대(hour) 배정
  Object.keys(byDate).forEach((dateStr) => {
    byDate[dateStr].forEach((t, i) => { t.hour = STUDY_HOURS[i % STUDY_HOURS.length]; });
  });

  return { byDate, generatedAt: new Date().toISOString(), weakSubjectNames: Array.from(weakSubjectNames), repMeta, style };
}

// 계획 요약을 이해하기 쉬운 불릿 리스트로 서술
function describePlan(planObj, exams, subjects) {
  const dates = Object.keys(planObj.byDate).sort();
  if (dates.length === 0) return ["아직 계산된 학습 일정이 없어."];
  const allTasks = dates.flatMap((d) => planObj.byDate[d]);
  const perDayCount = dates.map((d) => planObj.byDate[d].length);
  const avgPerDay = (perDayCount.reduce((a, b) => a + b, 0) / dates.length).toFixed(1);
  const maxDay = dates[perDayCount.indexOf(Math.max(...perDayCount))];
  const bySubject = {};
  allTasks.forEach((t) => { bySubject[t.subjectName] = (bySubject[t.subjectName] || 0) + 1; });
  const nearestExam = [...exams].sort((a, b) => a.date.localeCompare(b.date))[0];

  const bullets = [
    `${PLAN_STYLES[planObj.style]?.label || ""}: ${PLAN_STYLES[planObj.style]?.desc || ""}`,
    `전체 학습 기간: 오늘부터 ${dates[dates.length - 1]}까지 총 ${dates.length}일`,
    `하루 평균 학습 슬롯: 약 ${avgPerDay}개`,
    `가장 학습량이 많은 날: ${fmtKor(maxDay)} (${Math.max(...perDayCount)}개)`,
    ...Object.entries(bySubject).map(([name, cnt]) => `${name}: 총 ${cnt}개 슬롯 배정${planObj.weakSubjectNames.includes(name) ? " (취약 과목 · 반복 강화)" : ""}`),
    `시험 전날은 과목별로 전체 범위 총정리가 자동 예약돼`,
  ];
  return bullets;
}

/* ============================== 작은 UI 조각들 ============================== */

function Card({ children, className = "", style = {} }) {
  return <div className={`ys-card ${className}`} style={style}>{children}</div>;
}

function Ring({ size = 96, stroke = 9, pct = 0, color = "var(--amber)", label, sub }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - Math.min(1, Math.max(0, pct)) * c;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--ring-bg)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: "stroke-dashoffset .6s ease" }} />
      <text x="50%" y="47%" textAnchor="middle" fontSize={size * 0.22} fontWeight="700" fill="var(--ink)" fontFamily="var(--font-display)">{label}</text>
      {sub && <text x="50%" y="65%" textAnchor="middle" fontSize={size * 0.1} fill="var(--ink-soft)">{sub}</text>}
    </svg>
  );
}

function StarRate({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} onClick={() => onChange(n)} className="ys-star-btn" aria-label={`${n}점`}>
          <Star size={16} fill={n <= value ? "var(--amber)" : "none"} color={n <= value ? "var(--amber)" : "var(--ink-soft)"} />
        </button>
      ))}
    </div>
  );
}

/* ============================== 온보딩 ============================== */

function Onboarding({ onDone }) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({ name: "", school: "", grade: "" });
  const [answers, setAnswers] = useState({});

  const canNext0 = profile.name.trim() && profile.grade.trim();
  const qDone = QUESTIONS.every((q) => answers[q.id]);

  return (
    <div className="ys-onboard-wrap">
      <div className="ys-onboard-hero">
        <div className="ys-brand-mark">YS</div>
        <h1>Younique Studymate</h1>
        <p>너만의 속도, 너만의 방식 — 유니크영어 × 엠베스트유곡의 학습 파트너</p>
      </div>

      {step === 0 && (
        <Card className="ys-onboard-card">
          <h2>먼저 너를 소개해줘</h2>
          <label className="ys-field">
            <span>이름</span>
            <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} placeholder="예: 김민준" />
          </label>
          <label className="ys-field">
            <span>학교</span>
            <input value={profile.school} onChange={(e) => setProfile({ ...profile, school: e.target.value })} placeholder="예: OO중학교 (선택)" />
          </label>
          <label className="ys-field">
            <span>학년</span>
            <input value={profile.grade} onChange={(e) => setProfile({ ...profile, grade: e.target.value })} placeholder="예: 중2, 고1" />
          </label>
          <button className="ys-btn-primary" disabled={!canNext0} onClick={() => setStep(1)}>
            학습 성향 진단 시작하기 <ChevronRight size={16} />
          </button>
        </Card>
      )}

      {step === 1 && (
        <Card className="ys-onboard-card">
          <h2>학습 성향 진단 <span className="ys-tag">6문항 · 1분</span></h2>
          <p className="ys-muted">솔직하게 고를수록 플래너가 너에게 더 잘 맞춰져.</p>
          {QUESTIONS.map((q, i) => (
            <div key={q.id} className="ys-quiz-block">
              <div className="ys-quiz-q">{i + 1}. {q.text}</div>
              <div className="ys-quiz-opts">
                {q.options.map((op) => (
                  <button key={op.val} className={`ys-opt ${answers[q.id] === op.val ? "sel" : ""}`}
                    onClick={() => setAnswers({ ...answers, [q.id]: op.val })}>
                    {op.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div className="ys-row-btns">
            <button className="ys-btn-ghost" onClick={() => setStep(0)}><ChevronLeft size={16} /> 이전</button>
            <button className="ys-btn-primary" disabled={!qDone} onClick={() => {
              const result = scoreDiagnosis(answers);
              onDone(profile, result);
            }}>진단 완료하고 시작하기 <Sparkles size={16} /></button>
          </div>
        </Card>
      )}
    </div>
  );
}

/* ============================== 재진단 모달 ============================== */

function DiagnosisModal({ onClose, onSave }) {
  const [answers, setAnswers] = useState({});
  const qDone = QUESTIONS.every((q) => answers[q.id]);
  return (
    <div className="ys-modal-bg" onClick={onClose}>
      <div className="ys-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ys-modal-head"><h2>학습 성향 재진단</h2><button onClick={onClose}><X size={18} /></button></div>
        <div className="ys-modal-body">
          {QUESTIONS.map((q, i) => (
            <div key={q.id} className="ys-quiz-block">
              <div className="ys-quiz-q">{i + 1}. {q.text}</div>
              <div className="ys-quiz-opts">
                {q.options.map((op) => (
                  <button key={op.val} className={`ys-opt ${answers[q.id] === op.val ? "sel" : ""}`}
                    onClick={() => setAnswers({ ...answers, [q.id]: op.val })}>{op.label}</button>
                ))}
              </div>
            </div>
          ))}
          <button className="ys-btn-primary" disabled={!qDone} style={{ width: "100%" }}
            onClick={() => onSave(scoreDiagnosis(answers))}>진단 저장하기</button>
        </div>
      </div>
    </div>
  );
}

/* ============================== 과목/교과서 관리 ============================== */

function AiUnitSuggest({ subject, onAdd }) {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState(null); // {units:[{title, subtopics:[...]}]}
  const [checked, setChecked] = useState({}); // "unitIdx-subIdx" -> bool

  const fetchSuggestion = async () => {
    setLoading(true);
    setSuggestion(null);
    const prompt = `한국 중고등학교 "${subject.name}" 과목, 교재/문제집명 "${subject.textbook || "일반 교육과정"}" 기준으로 일반적인 단원 구성과 각 단원의 소제목(소단원) 목록을 추천해줘. 실제 그 교재를 모른다면 해당 과목의 표준 교육과정 단원 구성으로 대신 추천해줘. 단원은 4~8개, 각 단원의 소제목은 2~5개 정도로. JSON으로만 응답:
{"units":[{"title":"단원명","subtopics":["소제목1","소제목2"]}]}`;
    const text = await askClaude(prompt, 900);
    const parsed = tryParseJSON(text);
    if (parsed && Array.isArray(parsed.units)) {
      setSuggestion(parsed);
      const init = {};
      parsed.units.forEach((u, ui) => u.subtopics.forEach((_, si) => { init[`${ui}-${si}`] = true; }));
      setChecked(init);
    }
    setLoading(false);
  };

  const addSelected = () => {
    if (!suggestion) return;
    suggestion.units.forEach((u, ui) => {
      const subs = u.subtopics.filter((_, si) => checked[`${ui}-${si}`]);
      if (subs.length > 0) onAdd(u.title, subs);
    });
    setSuggestion(null);
  };

  return (
    <div className="ys-ai-suggest">
      <button className="ys-btn-ghost sm" onClick={fetchSuggestion} disabled={loading}>
        {loading ? <><Loader2 size={13} className="ys-spin" /> 추천 받는 중...</> : <><Sparkles size={13} /> AI로 단원 추천받기</>}
      </button>
      {suggestion && (
        <div className="ys-ai-suggest-box">
          <div className="ys-muted sm">⚠ AI 추천은 실제 교재와 다를 수 있어. 확인 후 선택해서 추가해줘.</div>
          {suggestion.units.map((u, ui) => (
            <div key={ui} className="ys-scope-unit">
              <div className="ys-scope-unit-title">{u.title}</div>
              {u.subtopics.map((st, si) => (
                <label key={si} className="ys-scope-item">
                  <input type="checkbox" checked={!!checked[`${ui}-${si}`]} onChange={() => setChecked({ ...checked, [`${ui}-${si}`]: !checked[`${ui}-${si}`] })} />
                  <span>{st}</span>
                </label>
              ))}
            </div>
          ))}
          <div className="ys-row-btns">
            <button className="ys-btn-ghost sm" onClick={() => setSuggestion(null)}>취소</button>
            <button className="ys-btn-primary sm" onClick={addSelected}><Plus size={13} /> 선택한 항목 추가</button>
          </div>
        </div>
      )}
    </div>
  );
}

function SubjectsManager({ subjects, setSubjects }) {
  const [newSubj, setNewSubj] = useState({ name: "", textbook: "" });
  const [openUnit, setOpenUnit] = useState({});
  const [unitDraft, setUnitDraft] = useState({});
  const [subDraft, setSubDraft] = useState({});

  const addSubject = () => {
    if (!newSubj.name.trim()) return;
    setSubjects([...subjects, { id: uid(), name: newSubj.name, textbook: newSubj.textbook, selfWeak: false, units: [] }]);
    setNewSubj({ name: "", textbook: "" });
  };
  const removeSubject = (id) => setSubjects(subjects.filter((s) => s.id !== id));
  const toggleWeak = (id) => setSubjects(subjects.map((s) => s.id === id ? { ...s, selfWeak: !s.selfWeak } : s));

  const addUnit = (sid) => {
    const title = (unitDraft[sid] || "").trim();
    if (!title) return;
    setSubjects(subjects.map((s) => s.id === sid ? { ...s, units: [...s.units, { id: uid(), title, subtopics: [] }] } : s));
    setUnitDraft({ ...unitDraft, [sid]: "" });
  };
  const removeUnit = (sid, uidUnit) => setSubjects(subjects.map((s) => s.id === sid ? { ...s, units: s.units.filter((u) => u.id !== uidUnit) } : s));

  const addSubtopic = (sid, unitId) => {
    const key = sid + unitId;
    const title = (subDraft[key] || "").trim();
    if (!title) return;
    setSubjects(subjects.map((s) => s.id !== sid ? s : {
      ...s, units: s.units.map((u) => u.id !== unitId ? u : { ...u, subtopics: [...u.subtopics, { id: uid(), title, done: false, avgRating: null }] })
    }));
    setSubDraft({ ...subDraft, [key]: "" });
  };
  const removeSubtopic = (sid, unitId, stId) => setSubjects(subjects.map((s) => s.id !== sid ? s : {
    ...s, units: s.units.map((u) => u.id !== unitId ? u : { ...u, subtopics: u.subtopics.filter((st) => st.id !== stId) })
  }));

  const addUnitWithSubs = (sid, unitTitle, subtopicTitles) => {
    setSubjects((prev) => prev.map((s) => s.id !== sid ? s : {
      ...s, units: [...s.units, { id: uid(), title: unitTitle, subtopics: subtopicTitles.map((t) => ({ id: uid(), title: t, done: false, avgRating: null })) }]
    }));
  };

  return (
    <div className="ys-stack">
      <Card>
        <h2><BookOpen size={18} /> 과목 · 교과서 추가</h2>
        <div className="ys-row-inputs">
          <input placeholder="과목명 (예: 수학)" value={newSubj.name} onChange={(e) => setNewSubj({ ...newSubj, name: e.target.value })} />
          <input placeholder="교과서/교재명 (예: 개념원리)" value={newSubj.textbook} onChange={(e) => setNewSubj({ ...newSubj, textbook: e.target.value })} />
          <button className="ys-btn-primary sm" onClick={addSubject}><Plus size={15} /> 추가</button>
        </div>
      </Card>

      {subjects.length === 0 && <Card className="ys-empty">아직 등록된 과목이 없어. 위에서 과목을 먼저 추가해줘.</Card>}

      {subjects.map((s) => {
        const totalSt = s.units.reduce((a, u) => a + u.subtopics.length, 0);
        const doneSt = s.units.reduce((a, u) => a + u.subtopics.filter((x) => x.done).length, 0);
        return (
          <Card key={s.id}>
            <div className="ys-subj-head">
              <div>
                <h3>{s.name} {s.selfWeak && <span className="ys-badge weak">취약</span>}</h3>
                <div className="ys-muted sm">{s.textbook || "교재 미입력"} · {doneSt}/{totalSt} 소제목 완료</div>
              </div>
              <div className="ys-row-btns">
                <button className="ys-btn-ghost sm" onClick={() => toggleWeak(s.id)}>{s.selfWeak ? "취약 해제" : "취약 표시"}</button>
                <button className="ys-icon-btn danger" onClick={() => removeSubject(s.id)}><Trash2 size={15} /></button>
              </div>
            </div>

            {s.units.map((u) => (
              <div key={u.id} className="ys-unit-block">
                <div className="ys-unit-head" onClick={() => setOpenUnit({ ...openUnit, [u.id]: !openUnit[u.id] })}>
                  <ChevronRight size={14} style={{ transform: openUnit[u.id] ? "rotate(90deg)" : "none", transition: "transform .15s" }} />
                  <span>{u.title}</span>
                  <span className="ys-muted sm">{u.subtopics.filter(x=>x.done).length}/{u.subtopics.length}</span>
                  <button className="ys-icon-btn danger" onClick={(e) => { e.stopPropagation(); removeUnit(s.id, u.id); }}><Trash2 size={13} /></button>
                </div>
                {openUnit[u.id] && (
                  <div className="ys-subtopic-list">
                    {u.subtopics.map((st) => (
                      <div key={st.id} className="ys-subtopic-row">
                        <span>{st.title}</span>
                        {st.avgRating != null && <span className={`ys-badge ${st.avgRating < 3 ? "weak" : "ok"}`}>이해도 {st.avgRating.toFixed(1)}</span>}
                        <button className="ys-icon-btn danger" onClick={() => removeSubtopic(s.id, u.id, st.id)}><Trash2 size={12} /></button>
                      </div>
                    ))}
                    <div className="ys-row-inputs sm">
                      <input placeholder="소제목 추가" value={subDraft[s.id + u.id] || ""}
                        onChange={(e) => setSubDraft({ ...subDraft, [s.id + u.id]: e.target.value })}
                        onKeyDown={(e) => e.key === "Enter" && addSubtopic(s.id, u.id)} />
                      <button className="ys-btn-ghost sm" onClick={() => addSubtopic(s.id, u.id)}><Plus size={13} /></button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div className="ys-row-inputs sm" style={{ marginTop: 8 }}>
              <input placeholder="단원 추가 (예: 1단원 다항식)" value={unitDraft[s.id] || ""}
                onChange={(e) => setUnitDraft({ ...unitDraft, [s.id]: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && addUnit(s.id)} />
              <button className="ys-btn-ghost sm" onClick={() => addUnit(s.id)}><Plus size={13} /> 단원 추가</button>
            </div>
            <AiUnitSuggest subject={s} onAdd={(title, subs) => addUnitWithSubs(s.id, title, subs)} />
          </Card>
        );
      })}
    </div>
  );
}

/* ============================== 시험 일정 관리 ============================== */

function ExamScopePicker({ subject, exam, onChange }) {
  const [open, setOpen] = useState(false);
  const scope = exam.scopeSubtopicIds || [];
  const allIds = subject.units.flatMap((u) => u.subtopics.map((st) => st.id));
  const allSelected = scope.length > 0 && allIds.every((id) => scope.includes(id));

  const toggleOne = (id) => {
    onChange(scope.includes(id) ? scope.filter((x) => x !== id) : [...scope, id]);
  };
  const selectAll = () => onChange(allIds);
  const clearAll = () => onChange([]);

  if (allIds.length === 0) return <div className="ys-muted sm">이 과목에 등록된 단원이 없어. '과목' 탭에서 먼저 단원·소제목을 추가해줘.</div>;

  return (
    <div className="ys-scope-picker">
      <button className="ys-scope-toggle" onClick={() => setOpen(!open)}>
        <ChevronRight size={13} style={{ transform: open ? "rotate(90deg)" : "none", transition: "transform .15s" }} />
        시험범위 {scope.length > 0 ? `(${scope.length}개 소단원 선택됨)` : <span className="ys-badge weak tiny">범위 미설정 · 전체로 계획됨</span>}
      </button>
      {open && (
        <div className="ys-scope-body">
          <div className="ys-row-btns" style={{ marginTop: 0 }}>
            <button className="ys-btn-ghost sm" onClick={selectAll}>전체 범위로 지정</button>
            <button className="ys-btn-ghost sm" onClick={clearAll}>선택 해제</button>
          </div>
          {subject.units.map((u) => (
            <div key={u.id} className="ys-scope-unit">
              <div className="ys-scope-unit-title">{u.title}</div>
              {u.subtopics.map((st) => (
                <label key={st.id} className="ys-scope-item">
                  <input type="checkbox" checked={scope.includes(st.id)} onChange={() => toggleOne(st.id)} />
                  <span>{st.title}</span>
                </label>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ExamManager({ subjects, exams, setExams }) {
  const [draft, setDraft] = useState({ subjectId: "", date: "", time: "" });
  const add = () => {
    if (!draft.subjectId || !draft.date) return;
    setExams([...exams, { id: uid(), ...draft, scopeSubtopicIds: [] }]);
    setDraft({ subjectId: "", date: "", time: "" });
  };
  const remove = (id) => setExams(exams.filter((e) => e.id !== id));
  const setScope = (examId, ids) => setExams(exams.map((e) => e.id === examId ? { ...e, scopeSubtopicIds: ids } : e));
  const sorted = [...exams].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="ys-stack">
      <Card>
        <h2><Calendar size={18} /> 중간고사 시간표</h2>
        {subjects.length === 0 ? <div className="ys-muted">먼저 '과목 관리'에서 과목을 등록해줘.</div> : (
          <div className="ys-row-inputs">
            <select value={draft.subjectId} onChange={(e) => setDraft({ ...draft, subjectId: e.target.value })}>
              <option value="">과목 선택</option>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
            <input type="time" value={draft.time} onChange={(e) => setDraft({ ...draft, time: e.target.value })} />
            <button className="ys-btn-primary sm" onClick={add}><Plus size={15} /> 추가</button>
          </div>
        )}
      </Card>
      {sorted.length === 0 && <Card className="ys-empty">등록된 시험 일정이 없어.</Card>}
      {sorted.map((e) => {
        const subj = subjects.find((s) => s.id === e.subjectId);
        const dleft = diffDays(e.date, todayStr());
        return (
          <Card key={e.id}>
            <div className="ys-exam-row">
              <div>
                <b>{subj?.name || "삭제된 과목"}</b>
                <div className="ys-muted sm">{fmtKor(e.date)} {e.time && `· ${e.time}`}</div>
              </div>
              <div className="ys-row-btns">
                <span className={`ys-badge ${dleft <= 3 ? "weak" : "ok"}`}>D-{dleft >= 0 ? dleft : "완료"}</span>
                <button className="ys-icon-btn danger" onClick={() => remove(e.id)}><Trash2 size={15} /></button>
              </div>
            </div>
            {subj && <ExamScopePicker subject={subj} exam={e} onChange={(ids) => setScope(e.id, ids)} />}
          </Card>
        );
      })}
    </div>
  );
}

/* ============================== 오늘 학습 뷰 ============================== */

function TaskChip({ t, onToggle, onRate, onTogglePriority, isPriority, onSetStatus, onNote, onRemove }) {
  const badgeCls = t.backlog ? "weak" : t.type === "final-review" ? "final" : t.type === "custom" ? "new" : t.type === "new" ? "new" : "review";
  const badgeLabel = t.backlog ? "보충" : t.type === "final-review" ? "총정리" : t.type === "custom" ? "직접추가" : t.repIndex ? `${t.repIndex}/${t.repTarget}회독` : "학습";
  return (
    <div className={`ys-chip-row ${t.done ? "done" : ""} ${t.status === "doing" ? "doing" : ""}`}>
      <button className="ys-check-big" onClick={() => onToggle(t.id, t.backlog)} aria-label="완료 체크">
        {t.done ? <CheckCircle2 size={24} color="var(--mint)" strokeWidth={2.2} /> : <Circle size={24} color="var(--ink-soft)" strokeWidth={2} />}
      </button>
      <div className="ys-chip-main">
        <div className="ys-task-title">
          <span className={`ys-badge tiny ${badgeCls}`}>{badgeLabel}</span>
          <b>{t.subjectName}</b> · {t.unitTitle}
          {t.status === "doing" && <span className="ys-doing-tag">🔴 진행중</span>}
        </div>
        <div className="ys-task-sub">{t.title}</div>
        {!t.done && onSetStatus && (
          <button className={`ys-doing-btn ${t.status === "doing" ? "on" : ""}`} onClick={() => onSetStatus(t.id, t.status === "doing" ? "planned" : "doing", t.backlog)}>
            {t.status === "doing" ? "진행 중지" : "▶ 지금 이거 하는 중"}
          </button>
        )}
        {(t.done || t.status === "doing") && onNote && (
          <input className="ys-task-note" placeholder="실제로 한 것 / 메모 (선택)" value={t.note || ""} onChange={(e) => onNote(t.id, e.target.value, t.backlog)} />
        )}
        {t.done && <div className="ys-rate-row"><span className="ys-muted sm">이해도</span><StarRate value={t.rating || 0} onChange={(v) => onRate(t.id, v, t.backlog)} /></div>}
      </div>
      {!t.backlog && !t.custom && (
        <button className={`ys-star-toggle ${isPriority ? "on" : ""}`} title="오늘의 우선순위로 표시" onClick={() => onTogglePriority(t.id)}>
          <Star size={16} fill={isPriority ? "var(--amber)" : "none"} color={isPriority ? "var(--amber)" : "var(--ink-soft)"} />
        </button>
      )}
      {t.custom && onRemove && (
        <button className="ys-icon-btn danger" onClick={() => onRemove(t.id)}><Trash2 size={14} /></button>
      )}
    </div>
  );
}

const TEN_MIN_LABELS = ["00", "10", "20", "30", "40", "50"];

function nextSegmentValue(cur, subjectList) {
  if (!cur) return subjectList[0]?.id || "generic";
  if (cur === "generic") return null;
  const idx = subjectList.findIndex((s) => s.id === cur);
  if (idx === -1 || idx === subjectList.length - 1) return subjectList.length > 0 ? "generic" : null;
  return subjectList[idx + 1].id;
}

function RulerRow({ h, items, meta, onMetaChange, isNowHour, nowMinuteFrac, expanded, onToggleExpand, tenMinRow, onCycleSegment, subjectList }) {
  return (
    <div className={`ys-ruler-row ${items ? "has-task" : ""} ${isNowHour ? "is-now" : ""} ${expanded ? "expanded" : ""}`}>
      <button className="ys-ruler-hour" onClick={onToggleExpand} title="탭하면 10분 단위로 확대돼">
        {h}<span>:00</span>
      </button>
      <div className="ys-ruler-content">
        {isNowHour && !expanded && <div className="ys-now-dot" style={{ left: `${nowMinuteFrac * 100}%` }} title="지금" />}
        {expanded ? (
          <div className="ys-tenmin-grid">
            {TEN_MIN_LABELS.map((lbl, i) => {
              const val = tenMinRow?.[i] || null;
              const subj = val && val !== "generic" ? subjectList.find((s) => s.id === val) : null;
              const isNowSeg = isNowHour && Math.floor(nowMinuteFrac * 6) === i;
              return (
                <button key={i} className={`ys-tenmin-cell ${val ? "filled" : ""} ${isNowSeg ? "now" : ""}`}
                  style={val ? { background: subj ? subjectColor(subj.name) : "var(--ink-soft)" } : {}}
                  onClick={() => onCycleSegment(i)}>
                  <span className="ys-tenmin-label">{h}:{lbl}</span>
                  {subj && <span className="ys-tenmin-subj">{subj.name}</span>}
                  {isNowSeg && <span className="ys-now-dot static" />}
                </button>
              );
            })}
          </div>
        ) : (
          <>
            {items ? items.map((t) => (
              <div key={t.id} className={`ys-ruler-chip ${t.done ? "done" : ""} ${t.status === "doing" ? "doing" : ""}`}>
                {t.done ? <CheckCircle2 size={12} color="var(--mint)" /> : <Circle size={12} color="var(--ink-soft)" />}
                <span>{t.subjectName} · {t.title}</span>
                {t.status === "doing" && <span className="ys-doing-tag">진행중</span>}
              </div>
            )) : (
              <input className="ys-ruler-memo" placeholder=""
                value={(meta.hourMemos || {})[h] || ""}
                onChange={(e) => onMetaChange({ hourMemos: { ...(meta.hourMemos || {}), [h]: e.target.value } })} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function TimeboxBar({ tasks, isToday, now }) {
  const nowHourFrac = now.getHours() + now.getMinutes() / 60;
  const rangeStart = 6, rangeEnd = 24;
  const nowPct = Math.min(100, Math.max(0, ((nowHourFrac - rangeStart) / (rangeEnd - rangeStart)) * 100));
  const byHour = {};
  tasks.forEach((t) => { const h = parseInt(t.hour || "16", 10); (byHour[h] = byHour[h] || []).push(t); });

  return (
    <div className="ys-timebox">
      <div className="ys-timebox-track">
        {TIME_RULER.map((h) => {
          const hn = parseInt(h, 10);
          const list = byHour[hn] || [];
          const doneCnt = list.filter((t) => t.done).length;
          return (
            <div key={h} className={`ys-timebox-cell ${list.length ? "has" : ""} ${doneCnt === list.length && list.length > 0 ? "all-done" : ""}`} title={`${h}시: ${list.map((t) => t.title).join(", ") || "비어있음"}`}>
              {list.length > 0 && <span>{list.length}</span>}
            </div>
          );
        })}
        {isToday && nowPct >= 0 && nowPct <= 100 && (
          <div className="ys-timebox-now" style={{ left: `${nowPct}%` }}><span className="ys-now-dot static" /></div>
        )}
      </div>
      <div className="ys-timebox-labels"><span>06시</span><span>15시</span><span>24시</span></div>
    </div>
  );
}

/* ============================== 과목별 스톱워치 (실제 학습시간 기록) ============================== */

function sessionSeconds(sessions, subjectId, now) {
  let total = 0;
  sessions.filter((s) => s.subjectId === subjectId).forEach((s) => {
    const end = s.end ? new Date(s.end) : now;
    total += Math.max(0, (end - new Date(s.start)) / 1000);
  });
  return total;
}

function StopwatchPanel({ subjectList, sessions, runningSubjectId, onStart, onStop, now, isToday }) {
  const totalSec = subjectList.reduce((a, s) => a + sessionSeconds(sessions, s.id, now), 0);
  return (
    <Card>
      <h2><Clock size={16} color="var(--coral)" /> 과목별 실제 학습시간</h2>
      {!isToday && <div className="ys-muted sm" style={{ marginBottom: 8 }}>스톱워치는 '오늘' 날짜에서만 기록할 수 있어. (지난 기록은 아래에서 확인 가능)</div>}
      <div className="ys-stopwatch-total">총 실제 학습시간: <b>{fmtHMS(totalSec)}</b></div>
      <div className="ys-stopwatch-list">
        {subjectList.length === 0 && <div className="ys-muted sm">오늘 계획된 과목이 없어.</div>}
        {subjectList.map((s) => {
          const sec = sessionSeconds(sessions, s.id, now);
          const running = runningSubjectId === s.id;
          return (
            <div key={s.id} className={`ys-stopwatch-row ${running ? "running" : ""}`}>
              <span className="ys-subject-dot" style={{ background: subjectColor(s.name) }} />
              <span className="ys-stopwatch-name">{s.name}</span>
              <span className="ys-stopwatch-time">{fmtHMS(sec)}</span>
              {isToday && (
                <button className={`ys-stopwatch-btn ${running ? "on" : ""}`} onClick={() => running ? onStop() : onStart(s.id, s.name)}>
                  {running ? "⏸ 정지" : "▶ 시작"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* ============================== 자동으로 채워지는 세로 타임라인 ============================== */

function VerticalTimeline({ sessions, now, isToday, rangeStart = 6, rangeEnd = 24 }) {
  const totalMin = (rangeEnd - rangeStart) * 60;
  const rowH = 30; // px per hour
  const hours = Array.from({ length: rangeEnd - rangeStart }, (_, i) => rangeStart + i);
  const nowMinFromStart = (now.getHours() + now.getMinutes() / 60 - rangeStart) * 60;

  return (
    <div className="ys-vtimeline">
      <div className="ys-vtimeline-hours">
        {hours.map((h) => <div key={h} className="ys-vtimeline-hourlabel" style={{ height: rowH }}>{pad(h % 24)}시</div>)}
      </div>
      <div className="ys-vtimeline-track" style={{ height: hours.length * rowH }}>
        {hours.map((h, i) => <div key={h} className="ys-vtimeline-gridline" style={{ top: i * rowH }} />)}
        {sessions.map((s) => {
          const start = new Date(s.start);
          const end = s.end ? new Date(s.end) : now;
          const startMin = (start.getHours() + start.getMinutes() / 60 - rangeStart) * 60;
          const endMin = (end.getHours() + end.getMinutes() / 60 - rangeStart) * 60;
          const top = Math.max(0, (startMin / 60) * rowH);
          const height = Math.max(4, ((endMin - startMin) / 60) * rowH);
          return (
            <div key={s.id} className="ys-vtimeline-block" style={{ top, height, background: subjectColor(s.subjectName) }} title={`${s.subjectName} ${fmtHMS((end - start) / 1000)}`}>
              <span>{s.subjectName}</span>
            </div>
          );
        })}
        {isToday && nowMinFromStart >= 0 && nowMinFromStart <= totalMin && (
          <div className="ys-vtimeline-now" style={{ top: (nowMinFromStart / 60) * rowH }}><span className="ys-now-dot static" /></div>
        )}
      </div>
    </div>
  );
}

function ArrangementPicker({ meta, onApply }) {
  const [loading, setLoading] = useState(false);
  const [aiChoice, setAiChoice] = useState(null); // {choice, reason}

  const askAi = async () => {
    setLoading(true);
    const prompt = `한국 학생의 오늘 학습 배치 스타일을 아침 집중형(morning) / 저녁 몰입형(focus) / 균등 분산형(spread) 중 하나로 추천해줘. 일반적인 학생 기준으로 무난한 걸 골라도 돼. JSON으로만: {"choice":"morning|focus|spread", "reason":"한 문장 이유"}`;
    const text = await askClaude(prompt, 200);
    const parsed = tryParseJSON(text);
    if (parsed && ARRANGEMENTS[parsed.choice]) setAiChoice(parsed);
    else setAiChoice({ choice: "spread", reason: "무난하게 시간을 고르게 나누는 배치를 추천해." });
    setLoading(false);
  };

  return (
    <Card>
      <div className="ys-today-head">
        <h2><Sparkles size={16} color="var(--amber)" /> 오늘의 세부계획 배치</h2>
        <button className="ys-btn-ghost sm" onClick={askAi} disabled={loading}>
          {loading ? <><Loader2 size={12} className="ys-spin" /> 추천 중</> : <>AI 추천받기</>}
        </button>
      </div>
      <div className="ys-arrangement-grid">
        {Object.entries(ARRANGEMENTS).map(([key, a]) => (
          <button key={key} className={`ys-arrangement-card ${meta.arrangement === key ? "sel" : ""}`} onClick={() => onApply(key)}>
            <div className="ys-arrangement-head">
              {a.label} {meta.arrangement === key && <CheckCircle2 size={13} color="var(--mint)" />}
              {aiChoice?.choice === key && <span className="ys-badge ok tiny">AI 추천</span>}
            </div>
            <div className="ys-muted sm">{a.desc}</div>
          </button>
        ))}
      </div>
      {aiChoice && <div className="ys-muted sm" style={{ marginTop: 8 }}>💬 {aiChoice.reason}</div>}
    </Card>
  );
}

function MuskSchedulerCard({ meta, onApply }) {
  const [startHour, setStartHour] = useState("16");
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <Card className="ys-musk-card">
      <h2>⚡ 일론 머스크식 초밀도 스케줄</h2>
      <ul className="ys-musk-bullets">
        <li>가장 중요·급한 일(오늘의 우선순위 TOP3 → 밀린 보충 → 시험 총정리)을 맨 앞에 배치</li>
        <li>일정 사이 여백(버퍼) 없이 10분 단위로 빈틈없이 이어붙임</li>
        <li>남는 시간은 뒤로 몰아서 확보 — 필요하면 쉬는 시간을 직접 끼워넣을 수 있어</li>
      </ul>
      <div className="ys-row-inputs sm" style={{ marginTop: 8 }}>
        <span className="ys-muted sm" style={{ alignSelf: "center" }}>시작 시각</span>
        <select value={startHour} onChange={(e) => setStartHour(e.target.value)} style={{ maxWidth: 90 }}>
          {TIME_RULER.map((h) => <option key={h} value={h}>{h}시</option>)}
        </select>
        <button className="ys-btn-primary sm" onClick={() => setConfirmOpen(true)}>이 방식으로 오늘 재배치</button>
      </div>
      {meta.arrangement === "musk" && (
        <div className="ys-muted sm" style={{ marginTop: 8 }}>
          ✅ 적용됨 — 시간표 자(ruler)를 탭해서 10분 단위로 확인해봐.
          {meta.muskOverflowCount > 0 && ` (오늘 안에 다 못 넣은 항목 ${meta.muskOverflowCount}개는 순서에서 밀렸어)`}
        </div>
      )}
      {confirmOpen && (
        <div className="ys-musk-confirm">
          <p>오늘의 10분 단위 시간표를 이 방식으로 다시 짤게. 기존에 손으로 표시해둔 기록은 덮어써져. 계속할까?</p>
          <div className="ys-row-btns">
            <button className="ys-btn-ghost sm" onClick={() => setConfirmOpen(false)}>취소</button>
            <button className="ys-btn-primary sm" onClick={() => { onApply(startHour, 0); setConfirmOpen(false); }}>덮어쓰고 적용</button>
          </div>
        </div>
      )}
    </Card>
  );
}

function PlannerSheet({ date, tasks, backlog, meta, onMetaChange, onToggle, onRate, onSetStatus, onNote, onFinishDay, finishing, onApplyArrangement, onApplyMuskSchedule, sessions, runningSubjectId, onStartSession, onStopSession, subjectList, now }) {
  const isToday = date === todayStr();
  const backlogHere = backlog.filter((b) => b.dueBefore >= date).slice(0, 3);
  const customTasks = (meta.customTasks || []).map((c) => ({ ...c, custom: true }));
  const all = [...backlogHere.map((b) => ({ ...b, backlog: true })), ...tasks, ...customTasks];
  const doneCount = tasks.filter((t) => t.done).length;
  const priorityIds = meta.priorityIds || [];
  const priorityTasks = tasks.filter((t) => priorityIds.includes(t.id));
  const overrides = meta.hourOverrides || {};

  const [customDraft, setCustomDraft] = useState({ title: "", subjectName: "", hour: "19" });
  const [expandedHour, setExpandedHour] = useState(null);
  const [surpriseItem, setSurpriseItem] = useState(null);
  const [surpriseAiLoading, setSurpriseAiLoading] = useState(false);

  const openSurprise = () => setSurpriseItem(pickSurprise(null));
  const rerollSurprise = () => setSurpriseItem((prev) => pickSurprise(prev?.key));
  const aiRollSurprise = async () => {
    setSurpriseAiLoading(true);
    const kinds = [
      { type: "joke", icon: "😄", label: "빵 터지는 순간", ask: "한국 중고등학생이 좋아할 만한, 짧고 건전한 학습 관련 아재개그/말장난 하나를 만들어줘. 1~2문장." },
      { type: "encourage", icon: "💛", label: "응원 한마디", ask: "공부하다 지친 한국 학생에게 건네는 짧고 진심어린 응원 한마디를 만들어줘. 1~2문장, 너무 오글거리지 않게." },
      { type: "trivia", icon: "🤓", label: "5초 상식", ask: "학생들이 좋아할 만한 짧고 신기한 과학/자연 상식 하나를 만들어줘. 사실에 기반해서, 1~2문장." },
      { type: "stretch", icon: "🧘", label: "몸 풀기", ask: "책상에 앉아서 5분 안에 할 수 있는 짧은 스트레칭 동작 하나를 설명해줘. 1~2문장." },
    ];
    const kind = kinds[Math.floor(Math.random() * kinds.length)];
    const text = await askClaude(`${kind.ask} 다른 설명 없이 내용만 한국어로 답해줘.`, 150);
    setSurpriseItem({ type: kind.type, icon: kind.icon, label: kind.label, text: (text || "").trim() || "지금은 새로 못 만들었어. 다시 뽑기를 눌러줘!", key: `ai:${Date.now()}` });
    setSurpriseAiLoading(false);
  };

  const togglePriority = (id) => {
    const cur = meta.priorityIds || [];
    if (cur.includes(id)) onMetaChange({ priorityIds: cur.filter((x) => x !== id) });
    else if (cur.length < 3) onMetaChange({ priorityIds: [...cur, id] });
  };

  const addCustomTask = () => {
    if (!customDraft.title.trim()) return;
    const newTask = { id: uid(), type: "custom", subjectName: customDraft.subjectName || "개인", unitTitle: "직접 추가", title: customDraft.title, hour: customDraft.hour, done: false };
    onMetaChange({ customTasks: [...(meta.customTasks || []), newTask] });
    setCustomDraft({ title: "", subjectName: "", hour: "19" });
  };
  const removeCustomTask = (id) => onMetaChange({ customTasks: (meta.customTasks || []).filter((c) => c.id !== id) });

  const byHour = {};
  all.forEach((t) => {
    const h = overrides[t.id] || t.hour || "16";
    if (!byHour[h]) byHour[h] = [];
    byHour[h].push(t);
  });

  const nowHour = String(now.getHours()).padStart(2, "0");
  const nowMinuteFrac = now.getMinutes() / 60;

  return (
    <div className="ys-stack">
      {meta.suggestion && (
        <Card className="ys-suggestion-banner">
          <div className="ys-suggestion-head"><AlertTriangle size={15} /> 어제 코멘트 기반 오늘의 제안</div>
          <p>{meta.suggestion}</p>
          <button className="ys-icon-btn" onClick={() => onMetaChange({ suggestion: null })}><X size={14} /></button>
        </Card>
      )}

      {/* 쉬는시간 5분 - 터치할 때마다 다른 서프라이즈 */}
      <BreakButton onOpen={openSurprise} />
      <SurpriseModal item={surpriseItem} onReroll={rerollSurprise} onClose={() => setSurpriseItem(null)} onAiRoll={aiRollSurprise} aiLoading={surpriseAiLoading} />

      {/* 타임박스 뷰 (상단 요약 + 실시간 위치) */}
      <Card>
        <div className="ys-today-head">
          <h2><Clock size={16} /> 오늘 타임박스</h2>
          {isToday && <span className="ys-badge ok tiny">지금 {now.getHours()}시 {now.getMinutes()}분</span>}
        </div>
        <TimeboxBar tasks={all} isToday={isToday} now={now} />
      </Card>

      {/* 상단: 오늘의 다짐 + 목표시간(GOAL) */}
      <Card className="ys-planner-top">
        <div className="ys-planner-top-row">
          <div className="ys-planner-date">
            <div className="ys-planner-date-num">{new Date(date + "T00:00:00").getDate()}</div>
            <div className="ys-planner-date-sub">{date.slice(0, 7).replace("-", ".")} · {WEEK[new Date(date + "T00:00:00").getDay()]}요일</div>
          </div>
          <div className="ys-planner-goal">
            <span>오늘의 다짐</span>
            <input placeholder="오늘 딱 하나, 이것만은 해내자 — 한 문장으로!" value={meta.goal || ""} onChange={(e) => onMetaChange({ goal: e.target.value })} />
          </div>
        </div>
        <div className="ys-planner-quick">
          <div className="ys-mood-row">
            <span className="ys-muted sm">기분</span>
            {MOOD_OPTS.map((m) => (
              <button key={m.v} className={`ys-mood-btn ${meta.mood === m.v ? "sel" : ""}`} title={m.label} onClick={() => onMetaChange({ mood: m.v })}>{m.e}</button>
            ))}
          </div>
          <label className="ys-sleep-input">
            <span className="ys-muted sm">수면</span>
            <input type="number" min="0" max="14" step="0.5" placeholder="7" value={meta.sleepHours || ""} onChange={(e) => onMetaChange({ sleepHours: e.target.value })} />
            <span className="ys-muted sm">시간</span>
          </label>
        </div>
        <div className="ys-goal-time-row">
          <span className="ys-muted sm">🎯 오늘 목표 학습시간</span>
          <input type="number" min="0" max="16" step="0.5" placeholder="7" value={meta.goalHours || ""} onChange={(e) => onMetaChange({ goalHours: e.target.value })} />
          <span className="ys-muted sm">시간</span>
          {meta.goalHours && (
            <span className="ys-muted sm">· 실제 {fmtHMS(sessions.reduce((a, s) => a + Math.max(0, ((s.end ? new Date(s.end) : now) - new Date(s.start)) / 1000), 0))}</span>
          )}
        </div>
      </Card>

      <ArrangementPicker meta={meta} onApply={onApplyArrangement} />
      <MuskSchedulerCard meta={meta} onApply={onApplyMuskSchedule} />

      {/* 과목별 실제 학습시간 스톱워치 + 자동으로 채워지는 세로 타임라인 */}
      <Card>
        <StopwatchPanel subjectList={subjectList} sessions={sessions} runningSubjectId={runningSubjectId} onStart={onStartSession} onStop={onStopSession} now={now} isToday={isToday} />
      </Card>
      {sessions.length > 0 && (
        <Card>
          <h2><BarChart3 size={16} /> 자동으로 채워지는 타임라인</h2>
          <VerticalTimeline sessions={sessions} now={now} isToday={isToday} />
        </Card>
      )}

      {/* 오늘의 우선순위 Top 3 + 생각정리(브레인덤프) */}
      <Card>
        <h2><Target size={16} color="var(--coral)" /> 오늘의 우선순위 TOP 3</h2>
        {priorityTasks.length === 0 && <div className="ys-muted sm">아래 체크리스트에서 별(★)을 눌러 오늘 꼭 해낼 3가지를 골라봐.</div>}
        {priorityTasks.map((t, i) => (
          <div key={t.id} className="ys-priority-row">
            <span className="ys-priority-num">{i + 1}</span>
            <span className={t.done ? "ys-done-text" : ""}>{t.subjectName} · {t.title}</span>
          </div>
        ))}
        <label className="ys-field" style={{ marginTop: 10 }}>
          <span>💭 생각 정리 (브레인덤프)</span>
          <textarea rows={2} placeholder="머릿속에 떠다니는 걱정·할일·잡생각을 여기 다 적어서 비워내" value={meta.brainDump || ""} onChange={(e) => onMetaChange({ brainDump: e.target.value })} />
        </label>
      </Card>

      {/* ✅ 체크리스트 (완료 체크는 여기서!) */}
      <Card className="ys-checklist-card">
        <div className="ys-today-head">
          <h2><CheckCircle2 size={17} color="var(--mint)" /> 오늘의 체크리스트</h2>
          <div className="ys-muted sm">{doneCount}/{tasks.length} 완료{backlogHere.length > 0 && ` · 보충 ${backlogHere.length}개 포함`}</div>
        </div>
        <div className="ys-progress-bar" style={{ marginBottom: 10 }}>
          <div className="ys-progress-fill" style={{ width: `${tasks.length ? (doneCount / tasks.length) * 100 : 0}%` }} />
        </div>
        {all.length === 0 && <div className="ys-empty">이 날짜에 배정된 학습이 없어. 홈에서 '계획 생성'을 먼저 눌러줘.</div>}
        <div className="ys-checklist-list">
          {all.map((t) => (
            <TaskChip key={t.id} t={t} onToggle={onToggle} onRate={onRate} onTogglePriority={togglePriority} isPriority={priorityIds.includes(t.id)}
              onSetStatus={onSetStatus} onNote={onNote} onRemove={t.custom ? removeCustomTask : undefined} />
          ))}
        </div>
        <div className="ys-custom-add">
          <div className="ys-row-inputs sm">
            <input placeholder="직접 할일 제목" value={customDraft.title} onChange={(e) => setCustomDraft({ ...customDraft, title: e.target.value })} />
            <input placeholder="과목(선택)" value={customDraft.subjectName} onChange={(e) => setCustomDraft({ ...customDraft, subjectName: e.target.value })} style={{ maxWidth: 90 }} />
            <select value={customDraft.hour} onChange={(e) => setCustomDraft({ ...customDraft, hour: e.target.value })} style={{ maxWidth: 80 }}>
              {TIME_RULER.map((h) => <option key={h} value={h}>{h}시</option>)}
            </select>
            <button className="ys-btn-ghost sm" onClick={addCustomTask}><Plus size={13} /> 추가</button>
          </div>
        </div>
      </Card>

      {/* 시간표 자(ruler) - 시각적 참고용 + 실시간 위치 + 탭하면 10분단위 확대 */}
      <Card className="ys-ruler-card">
        <h2><Clock size={16} /> 오늘의 시간표 <span className="ys-muted sm">(시간을 탭하면 10분 단위로 커져)</span></h2>
        <div className="ys-ruler">
          {TIME_RULER.map((h) => (
            <RulerRow key={h} h={h} items={byHour[h]} meta={meta} onMetaChange={onMetaChange}
              isNowHour={isToday && h === nowHour} nowMinuteFrac={nowMinuteFrac}
              expanded={expandedHour === h} onToggleExpand={() => setExpandedHour(expandedHour === h ? null : h)}
              tenMinRow={(meta.tenMinGrid || {})[h]} subjectList={subjectList}
              onCycleSegment={(i) => {
                const grid = { ...(meta.tenMinGrid || {}) };
                const row = [...(grid[h] || Array(6).fill(null))];
                row[i] = nextSegmentValue(row[i], subjectList);
                grid[h] = row;
                onMetaChange({ tenMinGrid: grid });
              }} />
          ))}
        </div>
      </Card>

      {/* 메모 + 마무리 */}
      <Card>
        <label className="ys-field">
          <span>오늘의 메모</span>
          <textarea rows={2} placeholder="특이사항, 준비물, 내일 챙길 것 등 자유롭게" value={meta.memo || ""} onChange={(e) => onMetaChange({ memo: e.target.value })} />
        </label>
        {all.length > 0 && (
          <>
            <label className="ys-field">
              <span>하루 한 줄 리뷰 (직접 작성)</span>
              <input placeholder="오늘 하루를 한 문장으로 남긴다면?" value={meta.oneLineReview || ""} onChange={(e) => onMetaChange({ oneLineReview: e.target.value })} />
            </label>
            <button className="ys-btn-primary ys-finish-btn" onClick={onFinishDay} disabled={finishing}>
              {finishing ? <><Loader2 size={16} className="ys-spin" /> 오늘 리뷰 작성 중...</> : <><Trophy size={16} /> 오늘 학습 마무리하고 코멘트 받기</>}
            </button>
            <div className="ys-muted sm" style={{ textAlign: "center", marginTop: 6 }}>마무리하면 오늘의 실제 기록을 바탕으로 객관적인 피드백이 만들어지고, '리포트' 탭에서 확인할 수 있어</div>
          </>
        )}
      </Card>
    </div>
  );
}

/* ============================== 어제·오늘·내일 비교 ============================== */

function DayCompareStrip({ plan, progress, selectedDate, onPick }) {
  const days = [-1, 0, 1].map((off) => addDays(selectedDate, off));
  const labels = ["어제", "오늘", "내일"];
  return (
    <Card>
      <h2><BarChart3 size={16} /> 어제 · 오늘 · 내일 비교</h2>
      <div className="ys-compare-grid">
        {days.map((d, i) => {
          const list = plan.byDate[d] || [];
          const prog = progress[d] || {};
          const doneCnt = list.filter((t) => prog[t.id]?.done).length;
          const bySubj = {};
          list.forEach((t) => { bySubj[t.subjectName] = (bySubj[t.subjectName] || 0) + 1; });
          const isSelected = d === selectedDate;
          return (
            <button key={d} className={`ys-compare-col ${isSelected ? "sel" : ""}`} onClick={() => onPick(d)}>
              <div className="ys-compare-label">{labels[i]}</div>
              <div className="ys-compare-date">{fmtKor(d)}</div>
              <div className="ys-compare-count">{list.length === 0 ? "-" : `${doneCnt}/${list.length}`}</div>
              <div className="ys-compare-subjects">
                {Object.entries(bySubj).slice(0, 3).map(([n, c]) => <div key={n} className="ys-muted sm">{n} {c}</div>)}
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

/* ============================== 하루 리뷰 카드 ============================== */

function ReviewCard({ review }) {
  if (!review) return null;
  return (
    <Card className="ys-review-card">
      <div className="ys-review-head"><Sparkles size={18} color="var(--amber)" /><h3>오늘의 스터디메이트 코멘트</h3></div>
      <div className="ys-review-block value">
        <div className="ys-review-label">🌱 오늘의 가치</div>
        <p>{review.valueComment}</p>
      </div>
      <div className="ys-review-block func">
        <div className="ys-review-label">📊 객관적으로 보면</div>
        <p>{review.functionalComment}</p>
      </div>
      {review.tip && <div className="ys-review-tip"><Target size={14} /> {review.tip}</div>}
    </Card>
  );
}

/* ============================== 쉬는시간 멘토 카드 ============================== */

function BackupCard({ onExport, onImport }) {
  const fileRef = useRef(null);
  const [importMsg, setImportMsg] = useState(null);
  const [pendingData, setPendingData] = useState(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        setPendingData(data);
        setImportMsg(null);
      } catch {
        setImportMsg({ ok: false, text: "파일을 읽지 못했어. 올바른 백업 파일인지 확인해줘." });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const confirmImport = () => {
    onImport(pendingData);
    setPendingData(null);
    setImportMsg({ ok: true, text: "가져오기 완료! 데이터가 복원됐어." });
  };

  return (
    <Card>
      <h2><BookMarked size={17} color="var(--navy)" /> 내 데이터 백업</h2>
      <div className="ys-muted sm" style={{ marginBottom: 10 }}>
        이 앱의 기록(진단·과목·계획·체크 내역·리뷰 등)은 이 기기·계정에 자동으로 저장돼서 다시 열어도 그대로 남아있어.
        그래도 만약을 대비하거나 다른 대화/기기로 옮기고 싶다면 아래에서 파일로 내보내고 불러올 수 있어.
      </div>
      <div className="ys-row-btns">
        <button className="ys-btn-ghost sm" onClick={onExport}><BarChart3 size={13} /> 내보내기 (다운로드)</button>
        <button className="ys-btn-ghost sm" onClick={() => fileRef.current?.click()}><RefreshCw size={13} /> 가져오기 (복원)</button>
        <input ref={fileRef} type="file" accept="application/json" style={{ display: "none" }} onChange={handleFile} />
      </div>
      {pendingData && (
        <div className="ys-musk-confirm" style={{ marginTop: 10 }}>
          <p>가져오기를 하면 지금 앱에 있는 데이터가 이 파일 내용으로 덮어써져. 계속할까?</p>
          <div className="ys-row-btns">
            <button className="ys-btn-ghost sm" onClick={() => setPendingData(null)}>취소</button>
            <button className="ys-btn-primary sm" onClick={confirmImport}>덮어쓰고 복원</button>
          </div>
        </div>
      )}
      {importMsg && <div className="ys-muted sm" style={{ marginTop: 8, color: importMsg.ok ? "var(--mint)" : "var(--coral)" }}>{importMsg.text}</div>}
    </Card>
  );
}

function MentorCard({ story, loading, onNext }) {
  return (
    <Card className="ys-mentor-card">
      <div className="ys-review-head"><Coffee size={18} color="var(--coral)" /><h3>쉬는 시간 5분</h3></div>
      {loading ? <div className="ys-muted"><Loader2 size={14} className="ys-spin" /> 이야기를 가져오는 중...</div> : story && (
        <>
          <div className="ys-mentor-title">{story.title}</div>
          <p className="ys-mentor-body">{story.body}</p>
        </>
      )}
      <button className="ys-btn-ghost sm" onClick={onNext}><RefreshCw size={13} /> 다른 이야기</button>
    </Card>
  );
}

/* ============================== 쉬는시간 5분 서프라이즈 팝업 ============================== */

function SurpriseModal({ item, onReroll, onClose, onAiRoll, aiLoading }) {
  if (!item) return null;
  return (
    <div className="ys-modal-bg" onClick={onClose}>
      <div className="ys-surprise-modal" onClick={(e) => e.stopPropagation()}>
        <button className="ys-surprise-close" onClick={onClose}><X size={18} /></button>
        <div className="ys-surprise-icon">{item.icon}</div>
        <div className="ys-surprise-label">{item.label}</div>
        <p className="ys-surprise-text">{aiLoading ? <><Loader2 size={16} className="ys-spin" /> 새로 뽑는 중...</> : item.text}</p>
        <div className="ys-surprise-btns">
          <button className="ys-btn-ghost" onClick={onReroll}>🎲 다시 뽑기</button>
          <button className="ys-btn-primary" onClick={onAiRoll} disabled={aiLoading}>✨ AI로 새로 만들기</button>
        </div>
      </div>
    </div>
  );
}

function BreakButton({ onOpen }) {
  return (
    <Card className="ys-break-card">
      <div className="ys-break-inner">
        <div>
          <div className="ys-break-title">☕ 쉬는시간 5분</div>
          <div className="ys-muted sm">터치할 때마다 다른 게 튀어나와 — 농담, 스트레칭, 응원, 상식 중 랜덤!</div>
        </div>
        <button className="ys-btn-primary" onClick={onOpen}>뽑기 🎁</button>
      </div>
    </Card>
  );
}

/* ============================== 학습 현황(완료도 · 반복도) 패널 ============================== */

function StudyStatsPanel({ subjects, plan, progress }) {
  const stats = useMemo(() => {
    let totalSt = 0, doneSt = 0;
    subjects.forEach((s) => s.units.forEach((u) => u.subtopics.forEach((st) => { totalSt++; if (st.done) doneSt++; })));

    const repBySubtopic = {}; // subtopicId -> {planned, done, subjectName}
    Object.entries(plan.byDate || {}).forEach(([dateStr, tasks]) => {
      tasks.forEach((t) => {
        if (!t.subtopicId) return;
        if (!repBySubtopic[t.subtopicId]) repBySubtopic[t.subtopicId] = { planned: 0, done: 0, subjectName: t.subjectName };
        repBySubtopic[t.subtopicId].planned++;
        if (progress[dateStr]?.[t.id]?.done) repBySubtopic[t.subtopicId].done++;
      });
    });
    let plannedReps = 0, doneReps = 0;
    const bySubject = {};
    Object.values(repBySubtopic).forEach((r) => {
      plannedReps += r.planned; doneReps += r.done;
      if (!bySubject[r.subjectName]) bySubject[r.subjectName] = { planned: 0, done: 0 };
      bySubject[r.subjectName].planned += r.planned; bySubject[r.subjectName].done += r.done;
    });
    return { totalSt, doneSt, plannedReps, doneReps, bySubject };
  }, [subjects, plan, progress]);

  const compRate = stats.totalSt ? stats.doneSt / stats.totalSt : 0;
  const repRate = stats.plannedReps ? stats.doneReps / stats.plannedReps : 0;

  return (
    <Card>
      <h2><BarChart3 size={17} color="var(--navy)" /> 전체 학습 현황</h2>
      <div className="ys-stats-row">
        <div className="ys-stats-block">
          <div className="ys-stats-label">완료도 <span className="ys-muted sm">(소제목 최초 학습)</span></div>
          <div className="ys-progress-bar"><div className="ys-progress-fill" style={{ width: `${compRate * 100}%`, background: "linear-gradient(90deg,var(--mint),var(--navy))" }} /></div>
          <div className="ys-muted sm">{stats.doneSt}/{stats.totalSt} · {Math.round(compRate * 100)}%</div>
        </div>
        <div className="ys-stats-block">
          <div className="ys-stats-label">누적 반복도 <span className="ys-muted sm">(N회독 진행)</span></div>
          <div className="ys-progress-bar"><div className="ys-progress-fill" style={{ width: `${repRate * 100}%`, background: "linear-gradient(90deg,var(--amber),var(--coral))" }} /></div>
          <div className="ys-muted sm">{stats.doneReps}/{stats.plannedReps}회독 · {Math.round(repRate * 100)}%</div>
        </div>
      </div>
      {Object.keys(stats.bySubject).length > 0 && (
        <div className="ys-subject-stats">
          {Object.entries(stats.bySubject).map(([name, r]) => (
            <div key={name} className="ys-subject-stat-row">
              <span className="ys-subject-stat-name">{name}</span>
              <div className="ys-progress-bar sm"><div className="ys-progress-fill" style={{ width: `${r.planned ? (r.done / r.planned) * 100 : 0}%` }} /></div>
              <span className="ys-muted sm">{r.done}/{r.planned}회독</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

/* ============================== 취약 영역 패널 ============================== */

function WeakSpotPanel({ subjects, backlog }) {
  const weakUnits = [];
  subjects.forEach((s) => s.units.forEach((u) => u.subtopics.forEach((st) => {
    if (st.avgRating != null && st.avgRating < 3) weakUnits.push({ subject: s.name, unit: u.title, title: st.title, rating: st.avgRating });
  })));
  const bySubjectBacklog = {};
  backlog.forEach((b) => { bySubjectBacklog[b.subjectName] = (bySubjectBacklog[b.subjectName] || 0) + 1; });

  if (weakUnits.length === 0 && Object.keys(bySubjectBacklog).length === 0) {
    return <Card className="ys-empty"><CheckCircle2 size={16} color="var(--mint)" /> 현재 특별한 취약 영역이 감지되지 않았어. 좋은 흐름이야!</Card>;
  }
  return (
    <Card>
      <h2><AlertTriangle size={18} color="var(--coral)" /> 보완이 필요한 부분</h2>
      {Object.entries(bySubjectBacklog).map(([name, cnt]) => (
        <div key={name} className="ys-weak-row">
          <b>{name}</b> — 밀린 학습 {cnt}개
          <div className="ys-muted sm">제안: 이번 주 안에 {name} 학습 시간을 30분 추가로 배정하고, 밀린 항목부터 순서대로 처리하기</div>
        </div>
      ))}
      {weakUnits.map((w, i) => (
        <div key={i} className="ys-weak-row">
          <b>{w.subject}</b> · {w.unit} — {w.title} (이해도 {w.rating.toFixed(1)}/5)
          <div className="ys-muted sm">제안: 심화 문제 3~5개로 개념을 다시 확인하고, 이틀 뒤 재복습 배치</div>
        </div>
      ))}
    </Card>
  );
}

/* ============================== 월간 캘린더 뷰 ============================== */

function CalendarView({ exams, subjects, plan, selectedDate, onPickDate }) {
  const [ym, setYm] = useState(() => { const d = new Date(selectedDate + "T00:00:00"); return { y: d.getFullYear(), m: d.getMonth() }; });
  const monthStart = new Date(ym.y, ym.m, 1);
  const startWeekday = monthStart.getDay();
  const daysInMonth = new Date(ym.y, ym.m + 1, 0).getDate();
  const today = todayStr();

  const examsByDate = {};
  exams.forEach((e) => { (examsByDate[e.date] = examsByDate[e.date] || []).push(e); });

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const changeMonth = (delta) => {
    let m = ym.m + delta, y = ym.y;
    if (m < 0) { m = 11; y--; } else if (m > 11) { m = 0; y++; }
    setYm({ y, m });
  };

  const upcoming = [...exams].filter((e) => diffDays(e.date, today) >= 0).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);

  return (
    <div className="ys-stack">
      <Card>
        <div className="ys-cal-head">
          <button className="ys-icon-btn" onClick={() => changeMonth(-1)}><ChevronLeft size={18} /></button>
          <div className="ys-cal-title">{ym.y}년 {ym.m + 1}월</div>
          <button className="ys-icon-btn" onClick={() => changeMonth(1)}><ChevronRight size={18} /></button>
        </div>
        <div className="ys-cal-weekrow">{WEEK.map((w, i) => <div key={i} className={`ys-cal-weekday ${i === 0 ? "sun" : i === 6 ? "sat" : ""}`}>{w}</div>)}</div>
        <div className="ys-cal-grid">
          {cells.map((d, i) => {
            if (d == null) return <div key={i} className="ys-cal-cell empty" />;
            const dateStr = `${ym.y}-${pad(ym.m + 1)}-${pad(d)}`;
            const dayExams = examsByDate[dateStr] || [];
            const hasPlan = (plan.byDate[dateStr] || []).length > 0;
            const isToday = dateStr === today;
            const isSelected = dateStr === selectedDate;
            return (
              <button key={i} className={`ys-cal-cell ${isToday ? "today" : ""} ${isSelected ? "sel" : ""}`} onClick={() => onPickDate(dateStr)}>
                <span className="ys-cal-daynum">{d}</span>
                <span className="ys-cal-dots">
                  {dayExams.map((e) => {
                    const subj = subjects.find((s) => s.id === e.subjectId);
                    return <span key={e.id} className="ys-cal-dot exam" style={{ background: subjectColor(subj?.name || "") }} title={`시험: ${subj?.name || ""}`} />;
                  })}
                  {hasPlan && dayExams.length === 0 && <span className="ys-cal-dot plan" />}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      <Card>
        <h2><AlertTriangle size={16} color="var(--coral)" /> 다가오는 시험</h2>
        {upcoming.length === 0 && <div className="ys-muted sm">등록된 예정 시험이 없어.</div>}
        {upcoming.map((e) => {
          const subj = subjects.find((s) => s.id === e.subjectId);
          const d = diffDays(e.date, today);
          return (
            <div key={e.id} className="ys-upcoming-row" onClick={() => onPickDate(e.date)}>
              <span className="ys-subject-dot" style={{ background: subjectColor(subj?.name || "") }} />
              <div className="ys-upcoming-main">
                <b>{subj?.name || "삭제된 과목"} 시험</b>
                <div className="ys-muted sm">{fmtKor(e.date)}{e.time && ` · ${e.time}`}</div>
              </div>
              <span className={`ys-badge ${d <= 3 ? "weak" : "ok"} tiny`}>D-{d}</span>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

/* ============================== 리포트(최종 피드백/제안) 페이지 ============================== */

function ReportView({ date, review, subjects, plan, progress, backlog, exams, onGoToday }) {
  const nextDate = addDays(date, 1);
  return (
    <div className="ys-stack">
      <div className="ys-date-nav">
        <div className="ys-date-label">{fmtKor(date)} 리포트</div>
      </div>
      {review ? <ReviewCard review={review} /> : (
        <Card className="ys-empty">
          아직 오늘 학습을 마무리하지 않았어. '오늘' 탭에서 체크리스트를 완료하고 <b>오늘 학습 마무리하기</b>를 눌러줘.
          <button className="ys-btn-primary sm" style={{ marginTop: 10 }} onClick={onGoToday}>오늘 탭으로 이동</button>
        </Card>
      )}
      <StudyStatsPanel subjects={subjects} plan={plan} progress={progress} />
      <WeakSpotPanel subjects={subjects} backlog={backlog} />
    </div>
  );
}

/* ============================== 메인 앱 ============================== */

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState("dashboard");
  const [profile, setProfile] = useState(null);
  const [diagnosis, setDiagnosis] = useState(null);
  const [diagHistory, setDiagHistory] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [exams, setExams] = useState([]);
  const [plan, setPlan] = useState({ byDate: {} });
  const [progress, setProgress] = useState({});
  const [backlog, setBacklog] = useState([]);
  const [dailyMeta, setDailyMeta] = useState({});
  const [reviews, setReviews] = useState({});
  const [showDiagModal, setShowDiagModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [finishing, setFinishing] = useState(false);
  const [planPreviews, setPlanPreviews] = useState(null); // {cycle, mix}
  const [selectedStyle, setSelectedStyle] = useState("cycle");
  const [story, setStory] = useState(FALLBACK_STORIES[0]);
  const [storyLoading, setStoryLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const core = await loadKey("ys-core", null);
      const study = await loadKey("ys-study", null);
      const rev = await loadKey("ys-reviews", null);
      if (core) {
        setProfile(core.profile || null);
        setDiagnosis(core.diagnosis?.current || null);
        setDiagHistory(core.diagnosis?.history || []);
        setSubjects(core.subjects || []);
        setExams(core.exams || []);
      }
      if (study) {
        setPlan(study.plan || { byDate: {} });
        setProgress(study.progress || {});
        setBacklog(study.backlog || []);
        setDailyMeta(study.dailyMeta || {});
      }
      if (rev) setReviews(rev.byDate || {});
      setLoaded(true);
    })();
  }, []);

  useEffect(() => { if (loaded && profile) saveKey("ys-core", { profile, diagnosis: { current: diagnosis, history: diagHistory }, subjects, exams }); }, [loaded, profile, diagnosis, diagHistory, subjects, exams]);
  useEffect(() => { if (loaded) saveKey("ys-study", { plan, progress, backlog, dailyMeta }); }, [loaded, plan, progress, backlog, dailyMeta]);
  useEffect(() => { if (loaded) saveKey("ys-reviews", { byDate: reviews }); }, [loaded, reviews]);

  const nextExam = useMemo(() => {
    const upcoming = exams.filter((e) => diffDays(e.date, todayStr()) >= 0).sort((a, b) => a.date.localeCompare(b.date));
    return upcoming[0] || null;
  }, [exams]);

  const todayTasks = useMemo(() => {
    const arr = plan.byDate[selectedDate] || [];
    const prog = progress[selectedDate] || {};
    return arr.map((t) => ({ ...t, done: !!prog[t.id]?.done, rating: prog[t.id]?.rating || 0, status: prog[t.id]?.status || "planned", note: prog[t.id]?.note || "" }));
  }, [plan, progress, selectedDate]);

  const now = useNowTick();
  const subjectListToday = useMemo(() => {
    const seen = new Map();
    todayTasks.forEach((t) => { if (t.subjectId && !seen.has(t.subjectId)) seen.set(t.subjectId, t.subjectName); });
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
  }, [todayTasks]);

  const overallProgress = useMemo(() => {
    let total = 0, done = 0;
    subjects.forEach((s) => s.units.forEach((u) => u.subtopics.forEach((st) => { total++; if (st.done) done++; })));
    return total ? done / total : 0;
  }, [subjects]);

  const handleOnboardDone = (prof, diagResult) => {
    setProfile(prof);
    setDiagnosis(diagResult);
    setDiagHistory([diagResult]);
    setView("dashboard");
  };

  const handleDiagSave = (result) => {
    setDiagnosis(result);
    setDiagHistory([...diagHistory, result]);
    setShowDiagModal(false);
  };

  const generatePlan = () => {
    if (subjects.length === 0 || exams.length === 0) return;
    const cycle = buildPlan(subjects, exams, diagnosis, todayStr(), 10, "cycle");
    const mix = buildPlan(subjects, exams, diagnosis, todayStr(), 10, "mix");
    setPlanPreviews({ cycle, mix });
    setSelectedStyle("cycle");
  };
  const confirmPlan = () => {
    if (!planPreviews) return;
    setPlan(planPreviews[selectedStyle]);
    setPlanPreviews(null);
    setView("today");
  };

  const updateMeta = (date, patch) => {
    setDailyMeta((prev) => ({ ...prev, [date]: { ...(prev[date] || {}), ...patch } }));
  };
  const todayMeta = dailyMeta[selectedDate] || {};
  const isCustomId = (id) => (todayMeta.customTasks || []).some((c) => c.id === id);
  const updateCustomTask = (id, patch) => {
    updateMeta(selectedDate, { customTasks: (todayMeta.customTasks || []).map((c) => c.id === id ? { ...c, ...patch } : c) });
  };

  const toggleTask = (taskId, isBacklog) => {
    if (isBacklog) {
      setBacklog(backlog.map((b) => b.id === taskId ? { ...b, done: !b.done } : b));
    } else if (isCustomId(taskId)) {
      const cur = (todayMeta.customTasks || []).find((c) => c.id === taskId);
      updateCustomTask(taskId, { done: !cur.done, status: !cur.done ? "done" : "planned" });
    } else {
      setProgress((prev) => {
        const dayProg = { ...(prev[selectedDate] || {}) };
        const cur = dayProg[taskId] || { done: false, rating: 0 };
        dayProg[taskId] = { ...cur, done: !cur.done, status: !cur.done ? "done" : "planned" };
        return { ...prev, [selectedDate]: dayProg };
      });
    }
  };

  const rateTask = (taskId, rating, isBacklog) => {
    if (isBacklog) {
      setBacklog(backlog.map((b) => b.id === taskId ? { ...b, rating } : b));
    } else if (isCustomId(taskId)) {
      updateCustomTask(taskId, { rating });
    } else {
      setProgress((prev) => {
        const dayProg = { ...(prev[selectedDate] || {}) };
        dayProg[taskId] = { ...(dayProg[taskId] || {}), rating };
        return { ...prev, [selectedDate]: dayProg };
      });
      const task = (plan.byDate[selectedDate] || []).find((t) => t.id === taskId);
      if (task && task.subtopicId) {
        setSubjects((prev) => prev.map((s) => s.id !== task.subjectId ? s : {
          ...s, units: s.units.map((u) => ({
            ...u, subtopics: u.subtopics.map((st) => st.id !== task.subtopicId ? st : {
              ...st, done: true, avgRating: st.avgRating == null ? rating : (st.avgRating + rating) / 2
            })
          }))
        }));
      }
    }
  };

  const setTaskStatus = (taskId, status, isBacklog) => {
    const nowIso = new Date().toISOString();
    if (isBacklog) {
      setBacklog(backlog.map((b) => b.id === taskId ? { ...b, status, actualStart: status === "doing" ? nowIso : b.actualStart } : b));
    } else if (isCustomId(taskId)) {
      updateCustomTask(taskId, { status, actualStart: status === "doing" ? nowIso : undefined });
    } else {
      setProgress((prev) => {
        const dayProg = { ...(prev[selectedDate] || {}) };
        const cur = dayProg[taskId] || { done: false, rating: 0 };
        dayProg[taskId] = { ...cur, status, actualStart: status === "doing" ? nowIso : cur.actualStart };
        return { ...prev, [selectedDate]: dayProg };
      });
    }
  };

  const noteTask = (taskId, note, isBacklog) => {
    if (isBacklog) {
      setBacklog(backlog.map((b) => b.id === taskId ? { ...b, note } : b));
    } else if (isCustomId(taskId)) {
      updateCustomTask(taskId, { note });
    } else {
      setProgress((prev) => {
        const dayProg = { ...(prev[selectedDate] || {}) };
        dayProg[taskId] = { ...(dayProg[taskId] || {}), note };
        return { ...prev, [selectedDate]: dayProg };
      });
    }
  };

  const applyArrangement = (key) => {
    const arr = ARRANGEMENTS[key];
    if (!arr) return;
    const overrides = { ...(todayMeta.hourOverrides || {}) };
    todayTasks.forEach((t, i) => { overrides[t.id] = arr.hours[i % arr.hours.length]; });
    updateMeta(selectedDate, { hourOverrides: overrides, arrangement: key });
  };

  const applyMuskSchedule = (startHour, startMin) => {
    const backlogToday = backlog.filter((b) => b.dueBefore >= selectedDate && !b.done).slice(0, 3);
    const customToday = (todayMeta.customTasks || []).filter((c) => !c.done);
    const priorityIds = todayMeta.priorityIds || [];
    const undoneTasks = todayTasks.filter((t) => !t.done);
    const ordered = muskOrderTasks(undoneTasks, backlogToday, customToday, priorityIds);
    const { grid, overrides, overflow } = buildMuskSchedule(ordered, startHour, startMin);
    updateMeta(selectedDate, {
      tenMinGrid: grid,
      hourOverrides: { ...(todayMeta.hourOverrides || {}), ...overrides },
      arrangement: "musk",
      muskOverflowCount: overflow.length,
    });
  };

  const runningSession = (todayMeta.sessions || []).find((s) => !s.end);
  const startSession = (subjectId, subjectName) => {
    const nowIso = new Date().toISOString();
    let sessions = todayMeta.sessions || [];
    sessions = sessions.map((s) => s.end ? s : { ...s, end: nowIso }); // 기존 실행중 세션 종료
    sessions = [...sessions, { id: uid(), subjectId, subjectName, start: nowIso, end: null }];
    updateMeta(selectedDate, { sessions });
  };
  const stopSession = () => {
    const nowIso = new Date().toISOString();
    const sessions = (todayMeta.sessions || []).map((s) => s.end ? s : { ...s, end: nowIso });
    updateMeta(selectedDate, { sessions });
  };

  const finishDay = async () => {
    setFinishing(true);
    const tasks = todayTasks;
    const undone = tasks.filter((t) => !t.done);
    const doneList = tasks.filter((t) => t.done);
    const avgRating = doneList.length ? doneList.reduce((a, t) => a + (t.rating || 3), 0) / doneList.length : null;

    // 미완료 항목 -> 백로그
    if (undone.length > 0) {
      const subjectExamDates = {};
      exams.forEach((e) => { subjectExamDates[e.subjectId] = e.date; });
      const newBacklogItems = undone.map((t) => ({
        ...t, id: uid(), done: false, rating: 0, dueBefore: subjectExamDates[t.subjectId] || addDays(selectedDate, 14),
      }));
      setBacklog((prev) => [...prev, ...newBacklogItems]);
    }
    // 완료된 백로그 항목 제거
    setBacklog((prev) => prev.filter((b) => !b.done));

    const weakList = subjects.filter((s) => backlog.filter((b) => b.subjectId === s.id).length >= 3).map((s) => s.name);
    const customTasks = todayMeta.customTasks || [];
    const notedTasks = [...tasks, ...customTasks].filter((t) => t.note && t.note.trim());
    const actualLogTxt = notedTasks.length > 0
      ? notedTasks.map((t) => `- ${t.subjectName}·${t.title}: "${t.note}"`).join("\n")
      : "학생이 남긴 실시간 메모 없음";
    const finishedSessions = (todayMeta.sessions || []).map((s) => s.end ? s : { ...s, end: new Date().toISOString() });
    const actualTotalSec = finishedSessions.reduce((a, s) => a + Math.max(0, (new Date(s.end) - new Date(s.start)) / 1000), 0);
    const plannedMin = (parseFloat(todayMeta.goalHours) || 0) * 60;
    if (finishedSessions.length > 0) updateMeta(selectedDate, { sessions: finishedSessions });

    const moodTxt = MOOD_OPTS.find((m) => m.v === todayMeta.mood)?.label;
    const timeTxt = plannedMin > 0 ? `목표 학습시간 ${fmtHM(plannedMin)} 중 실제 ${fmtHMS(actualTotalSec)} 기록됨.` : `실제 스톱워치 기록 총 ${fmtHMS(actualTotalSec)}.`;
    const prompt = `너는 한국 중고등학생을 위한 생성형 학습 플래너 "Younique Studymate"의 AI 멘토야. 학생 이름: ${profile?.name || "학생"}. 오늘의 다짐: "${todayMeta.goal || "없음"}". 오늘 계획 ${tasks.length}개 중 ${doneList.length}개 완료, 평균 이해도 자가평가 ${avgRating ? avgRating.toFixed(1) : "없음"}/5, 밀린 항목 ${undone.length}개. ${timeTxt} 오늘 기분: ${moodTxt || "미입력"}, 수면 ${todayMeta.sleepHours || "미입력"}시간. 학생이 직접 남긴 한 줄 리뷰: "${todayMeta.oneLineReview || "없음"}". 학생이 실시간으로 남긴 실제 기록(사실 기반):
${actualLogTxt}
학습 성향: ${diagnosisSummary(diagnosis)?.styleTxt || "정보없음"}, ${diagnosisSummary(diagnosis)?.execTxt || ""}. 취약 과목: ${weakList.join(", ") || "없음"}.
아래 JSON 형식으로만, 한국어로, 다른 텍스트 없이 응답해줘. 실제 기록이 있다면 반드시 반영해서 추측이 아닌 사실에 기반한 코멘트를 만들어줘:
{"valueComment": "오늘 하루 버티고 노력한 것 자체의 가치를 인정하는 따뜻한 멘토링 코멘트 2~3문장. 목표 달성 여부와 별개로 자존감을 세워주는 톤. 가끔은 가벼운 농담을 섞어도 좋음.",
"functionalComment": "학습 실행률과 이해도를 객관적이고 냉정하게 짚어주는 코멘트 2~3문장. 잘한 점과 부족한 점을 솔직하게. 필요하면 살짝 냉소적인 뉘앙스도 괜찮음. 미화하지 말 것.",
"tip": "내일 바로 실행할 수 있는 구체적인 행동 팁 1문장."}`;

    const text = await askClaude(prompt, 500);
    const parsed = tryParseJSON(text);
    const completionRate = tasks.length ? doneList.length / tasks.length : 1;
    const fallback = {
      valueComment: undone.length === 0
        ? `${profile?.name || "너"}, 오늘 계획한 걸 다 해냈어. 결과보다 그 꾸준함이 진짜 실력이 되는 거야.`
        : `오늘 다 못 끝냈다고 해서 오늘 하루가 헛된 건 아니야. 앉아있었던 시간, 그 자체가 쌓이고 있어.`,
      functionalComment: `${tasks.length}개 중 ${doneList.length}개 완료(${Math.round(completionRate * 100)}%). ${undone.length > 0 ? `밀린 ${undone.length}개는 내일 보충으로 자동 배치했어.` : "완료율이 좋아, 이 페이스를 유지해봐."}`,
      tip: undone.length > 0 ? "내일은 밀린 항목부터 먼저 처리하고 시작하자." : "내일도 같은 시간에 시작해서 리듬을 유지해보자.",
    };
    const finalReview = parsed || fallback;
    setReviews((prev) => ({ ...prev, [selectedDate]: finalReview }));

    // 다음날 계획에 대한 자동 지적/제안 (규칙 기반 + AI tip)
    const nextDate = addDays(selectedDate, 1);
    let ruleSuggestion = null;
    if (completionRate < 0.6) ruleSuggestion = `어제 완료율이 ${Math.round(completionRate * 100)}%로 낮았어. 오늘은 새 학습보다 밀린 항목(보충)부터 먼저 끝내고 시작하자.`;
    else if (avgRating != null && avgRating < 3) ruleSuggestion = `어제 이해도 평균이 낮았어(${avgRating.toFixed(1)}/5). 오늘은 새 진도보다 어제 배운 내용 복습에 먼저 시간을 써보자.`;
    else if (undone.length > 0) ruleSuggestion = `어제 ${undone.length}개가 밀렸어. 오늘 체크리스트 상단의 '보충' 항목부터 처리해줘.`;
    const suggestion = finalReview.tip ? `${ruleSuggestion ? ruleSuggestion + " " : ""}${finalReview.tip}` : ruleSuggestion;
    if (suggestion) updateMeta(nextDate, { suggestion });

    setFinishing(false);
  };

  const fetchStory = async () => {
    setStoryLoading(true);
    const prompt = `한국 중고등학생을 위한 짧은 학습 동기부여 이야기를 하나 만들어줘. 실존 인물의 이름은 쓰지 말고, 일반적인 공부법이나 익명의 선배 사례로. JSON으로만 응답: {"title":"짧은 제목", "body":"3~4문장 이야기, 한국어"}`;
    const text = await askClaude(prompt, 300);
    const parsed = tryParseJSON(text);
    if (parsed && parsed.title && parsed.body) setStory(parsed);
    else setStory(FALLBACK_STORIES[Math.floor(Math.random() * FALLBACK_STORIES.length)]);
    setStoryLoading(false);
  };

  useEffect(() => { setStory(FALLBACK_STORIES[Math.floor(Math.random() * FALLBACK_STORIES.length)]); }, []);

  if (!loaded) return <div className="ys-root ys-loading"><Loader2 className="ys-spin" size={28} /></div>;

  if (!profile) {
    return (
      <div className="ys-root">
        <GlobalStyle />
        <Onboarding onDone={handleOnboardDone} />
      </div>
    );
  }

  const dsum = diagnosisSummary(diagnosis);
  const daysToExam = nextExam ? diffDays(nextExam.date, todayStr()) : null;

  const exportData = () => {
    const payload = { app: "Younique Studymate", exportedAt: new Date().toISOString(), profile, diagnosis, diagHistory, subjects, exams, plan, progress, backlog, dailyMeta, reviews };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `younique-studymate-backup-${todayStr()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = (data) => {
    if (data.profile) setProfile(data.profile);
    if (data.diagnosis) setDiagnosis(data.diagnosis);
    if (data.diagHistory) setDiagHistory(data.diagHistory);
    if (data.subjects) setSubjects(data.subjects);
    if (data.exams) setExams(data.exams);
    if (data.plan) setPlan(data.plan);
    if (data.progress) setProgress(data.progress);
    if (data.backlog) setBacklog(data.backlog);
    if (data.dailyMeta) setDailyMeta(data.dailyMeta);
    if (data.reviews) setReviews(data.reviews);
  };

  return (
    <div className="ys-root">
      <GlobalStyle />
      {showDiagModal && <DiagnosisModal onClose={() => setShowDiagModal(false)} onSave={handleDiagSave} />}

      <header className="ys-header">
        <div className="ys-brand-mark sm">YS</div>
        <div className="ys-header-title">
          <div className="ys-header-name">Younique Studymate</div>
          <div className="ys-header-sub">{profile.name}{profile.school ? ` · ${profile.school}` : ""} · {profile.grade}</div>
        </div>
        <button className="ys-icon-btn" onClick={() => setShowDiagModal(true)} title="재진단"><Settings2 size={17} /></button>
      </header>

      <nav className="ys-nav">
        {[
          { k: "dashboard", label: "홈", icon: TrendingUp },
          { k: "today", label: "오늘", icon: CheckCircle2 },
          { k: "calendar", label: "캘린더", icon: Calendar },
          { k: "report", label: "리포트", icon: BarChart3 },
          { k: "subjects", label: "과목", icon: BookOpen },
          { k: "exams", label: "시험일정", icon: Calendar },
          { k: "weak", label: "보완", icon: AlertTriangle },
        ].map(({ k, label, icon: Icon }) => (
          <button key={k} className={`ys-nav-btn ${view === k ? "active" : ""}`} onClick={() => setView(k)}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </nav>

      <main className="ys-main">
        {view === "dashboard" && (
          <div className="ys-stack">
            <Card className="ys-hero-card">
              <div className="ys-hero-left">
                {nextExam ? <Ring pct={daysToExam <= 0 ? 1 : Math.max(0, 1 - daysToExam / 30)} label={`D-${daysToExam}`} sub={nextExam ? subjects.find(s=>s.id===nextExam.subjectId)?.name : ""} />
                  : <Ring pct={0} label="D-?" sub="시험 미등록" />}
              </div>
              <div className="ys-hero-right">
                <div className="ys-muted sm">전체 학습 진도</div>
                <div className="ys-progress-bar"><div className="ys-progress-fill" style={{ width: `${overallProgress * 100}%` }} /></div>
                <div className="ys-muted sm">{Math.round(overallProgress * 100)}% 완료</div>
                {dsum && <div className="ys-diag-chip"><User size={12} /> {dsum.styleTxt} · {dsum.execTxt}</div>}
              </div>
            </Card>

            {diagnosis && <DiagnosisVisual diagnosis={diagnosis} diagHistory={diagHistory} />}

            {reviews[todayStr()] && <ReviewCard review={reviews[todayStr()]} />}
            <StudyStatsPanel subjects={subjects} plan={plan} progress={progress} />
            <MentorCard story={story} loading={storyLoading} onNext={fetchStory} />

            {planPreviews && (
              <Card className="ys-preview-card">
                <h2><Sparkles size={17} color="var(--amber)" /> 추천 학습계획 스타일 선택</h2>
                <div className="ys-muted sm" style={{ marginBottom: 10 }}>두 스타일 중 나에게 맞는 쪽을 골라봐. 언제든 다시 만들 수 있어.</div>
                <div className="ys-style-picker">
                  {["cycle", "mix"].map((sKey) => {
                    const p = planPreviews[sKey];
                    const dates = Object.keys(p.byDate);
                    const totalSlots = dates.reduce((a, d) => a + p.byDate[d].length, 0);
                    return (
                      <button key={sKey} className={`ys-style-card ${selectedStyle === sKey ? "sel" : ""}`} onClick={() => setSelectedStyle(sKey)}>
                        <div className="ys-style-card-head">{PLAN_STYLES[sKey].label} {selectedStyle === sKey && <CheckCircle2 size={15} color="var(--mint)" />}</div>
                        <div className="ys-muted sm">{PLAN_STYLES[sKey].desc}</div>
                        <div className="ys-style-card-stat">총 {totalSlots}개 슬롯 · {dates.length}일</div>
                      </button>
                    );
                  })}
                </div>
                <div className="ys-plan-bullets">
                  {describePlan(planPreviews[selectedStyle], exams, subjects).map((b, i) => <div key={i} className="ys-bullet-row">• {b}</div>)}
                </div>
                <div className="ys-row-btns">
                  <button className="ys-btn-ghost" onClick={() => setPlanPreviews(null)}>취소</button>
                  <button className="ys-btn-primary" onClick={confirmPlan}><CheckCircle2 size={15} /> 이 스타일로 확정하기</button>
                </div>
              </Card>
            )}
            {!planPreviews && (subjects.length === 0 || exams.length === 0) && (
              <Card className="ys-empty">
                시작하려면: <b>과목</b> 탭에서 과목·단원·소제목을 등록하고, <b>시험일정</b> 탭에서 중간고사 범위를 입력한 뒤,
                <button className="ys-btn-primary sm" style={{ marginTop: 10 }} onClick={() => setView("subjects")}>과목 등록하러 가기</button>
              </Card>
            )}
            {!planPreviews && subjects.length > 0 && exams.length > 0 && (
              <Card>
                <div className="ys-row-btns">
                  <button className="ys-btn-primary" onClick={generatePlan}><RefreshCw size={15} /> 추천 학습 계획 미리보기</button>
                </div>
                <div className="ys-muted sm" style={{ marginTop: 6 }}>시험범위 안의 소제목만 뽑아서, 반복주기형/믹스형 두 스타일로 미리 계산해줄게.</div>
              </Card>
            )}
            <BackupCard onExport={exportData} onImport={importData} />
          </div>
        )}

        {view === "today" && (
          <div className="ys-stack">
            <div className="ys-date-nav">
              <button className="ys-icon-btn" onClick={() => setSelectedDate(addDays(selectedDate, -1))}><ChevronLeft size={16} /></button>
              <div className="ys-date-label">{fmtKor(selectedDate)} ({WEEK[new Date(selectedDate + "T00:00:00").getDay()]}) {selectedDate === todayStr() && <span className="ys-badge ok tiny">오늘</span>}</div>
              <button className="ys-icon-btn" onClick={() => setSelectedDate(addDays(selectedDate, 1))}><ChevronRight size={16} /></button>
            </div>
            <DayCompareStrip plan={plan} progress={progress} selectedDate={selectedDate} onPick={setSelectedDate} />
            <PlannerSheet date={selectedDate} tasks={todayTasks} backlog={backlog} meta={todayMeta}
              onMetaChange={(patch) => updateMeta(selectedDate, patch)}
              onToggle={toggleTask} onRate={rateTask} onSetStatus={setTaskStatus} onNote={noteTask}
              onApplyArrangement={applyArrangement}
              onApplyMuskSchedule={applyMuskSchedule}
              sessions={todayMeta.sessions || []} runningSubjectId={runningSession?.subjectId || null}
              onStartSession={startSession} onStopSession={stopSession}
              subjectList={subjectListToday} now={now}
              onFinishDay={finishDay} finishing={finishing} />
            {reviews[selectedDate] && (
              <>
                <ReviewCard review={reviews[selectedDate]} />
                <button className="ys-btn-ghost sm" onClick={() => setView("report")}><BarChart3 size={13} /> 리포트 탭에서 자세히 보기</button>
              </>
            )}
          </div>
        )}

        {view === "calendar" && (
          <CalendarView exams={exams} subjects={subjects} plan={plan} selectedDate={selectedDate}
            onPickDate={(d) => { setSelectedDate(d); setView("today"); }} />
        )}

        {view === "report" && (
          <ReportView date={selectedDate} review={reviews[selectedDate]} subjects={subjects} plan={plan} progress={progress} backlog={backlog} exams={exams} onGoToday={() => setView("today")} />
        )}

        {view === "subjects" && <SubjectsManager subjects={subjects} setSubjects={setSubjects} />}
        {view === "exams" && <ExamManager subjects={subjects} exams={exams} setExams={setExams} />}
        {view === "weak" && <WeakSpotPanel subjects={subjects} backlog={backlog} />}
      </main>

      <footer className="ys-footer">Younique Studymate · 유니크영어 × 엠베스트유곡 · 2026</footer>
    </div>
  );
}

/* ============================== 전역 스타일 ============================== */

function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&family=Pretendard:wght@400;500;600;700&display=swap');
      :root{
        --cream:#FBF8F3; --ink:#20242B; --ink-soft:#767A85;
        --navy:#1B1F3B; --amber:#F2A93B; --mint:#4FAE7C; --coral:#E8615A;
        --ring-bg:#E9E4D8; --card-bd:#E7E2D6;
        --font-display:'Gowun Batang', serif; --font-body:'Pretendard', -apple-system, sans-serif;
      }
      .ys-root{ font-family:var(--font-body); background:var(--cream); color:var(--ink); min-height:100%; max-width:640px; margin:0 auto; padding-bottom:24px; }
      .ys-loading{ display:flex; align-items:center; justify-content:center; height:300px; }
      .ys-spin{ animation:ys-spin 1s linear infinite; }
      @keyframes ys-spin{ to{ transform:rotate(360deg); } }

      .ys-brand-mark{ width:44px; height:44px; border-radius:12px; background:linear-gradient(135deg,var(--navy),#3A4270); color:#fff; display:flex; align-items:center; justify-content:center; font-family:var(--font-display); font-weight:700; font-size:16px; flex-shrink:0; }
      .ys-brand-mark.sm{ width:34px; height:34px; font-size:13px; border-radius:9px; }

      .ys-onboard-wrap{ padding:28px 18px; }
      .ys-onboard-hero{ text-align:center; margin-bottom:22px; }
      .ys-onboard-hero .ys-brand-mark{ margin:0 auto 12px; width:56px; height:56px; font-size:20px; border-radius:16px; }
      .ys-onboard-hero h1{ font-family:var(--font-display); font-size:26px; margin:0 0 6px; }
      .ys-onboard-hero p{ color:var(--ink-soft); font-size:13.5px; margin:0; }
      .ys-onboard-card h2{ font-family:var(--font-display); font-size:19px; margin:0 0 14px; display:flex; align-items:center; gap:8px; }

      .ys-card{ background:#fff; border:1px solid var(--card-bd); border-radius:16px; padding:18px; box-shadow:0 1px 2px rgba(27,31,59,.04); }
      .ys-stack{ display:flex; flex-direction:column; gap:14px; }
      .ys-empty{ text-align:center; color:var(--ink-soft); font-size:13.5px; padding:22px; }

      .ys-field{ display:flex; flex-direction:column; gap:5px; margin-bottom:12px; font-size:13px; color:var(--ink-soft); }
      .ys-field input{ font-family:var(--font-body); font-size:15px; padding:10px 12px; border:1.5px solid var(--card-bd); border-radius:10px; color:var(--ink); background:var(--cream); }
      .ys-field input:focus{ outline:none; border-color:var(--amber); }

      .ys-btn-primary{ background:var(--navy); color:#fff; border:none; border-radius:12px; padding:12px 18px; font-size:14.5px; font-weight:600; display:inline-flex; align-items:center; justify-content:center; gap:6px; cursor:pointer; width:auto; }
      .ys-btn-primary:disabled{ opacity:.4; cursor:not-allowed; }
      .ys-btn-primary.sm{ padding:8px 13px; font-size:13px; }
      .ys-btn-ghost{ background:transparent; border:1.5px solid var(--card-bd); color:var(--ink); border-radius:10px; padding:9px 14px; font-size:13.5px; display:inline-flex; align-items:center; gap:6px; cursor:pointer; }
      .ys-btn-ghost.sm{ padding:7px 11px; font-size:12.5px; }
      .ys-icon-btn{ background:transparent; border:none; color:var(--ink-soft); cursor:pointer; padding:6px; border-radius:8px; display:inline-flex; }
      .ys-icon-btn:hover{ background:var(--cream); }
      .ys-icon-btn.danger:hover{ color:var(--coral); }
      .ys-row-btns{ display:flex; gap:8px; align-items:center; justify-content:space-between; margin-top:10px; flex-wrap:wrap; }
      .ys-row-inputs{ display:flex; gap:8px; flex-wrap:wrap; }
      .ys-row-inputs input, .ys-row-inputs select{ flex:1; min-width:110px; padding:9px 10px; border:1.5px solid var(--card-bd); border-radius:9px; font-size:13.5px; font-family:var(--font-body); background:var(--cream); }
      .ys-row-inputs.sm input{ padding:6px 9px; font-size:12.5px; }

      .ys-quiz-block{ margin-bottom:16px; }
      .ys-quiz-q{ font-size:14px; font-weight:600; margin-bottom:8px; }
      .ys-quiz-opts{ display:flex; flex-direction:column; gap:6px; }
      .ys-opt{ text-align:left; padding:10px 12px; border-radius:10px; border:1.5px solid var(--card-bd); background:#fff; font-size:13.5px; cursor:pointer; font-family:var(--font-body); }
      .ys-opt.sel{ border-color:var(--amber); background:#FFF6E6; font-weight:600; }
      .ys-muted{ color:var(--ink-soft); font-size:13px; }
      .ys-muted.sm{ font-size:12px; }
      .ys-tag{ font-size:11px; background:var(--cream); border-radius:6px; padding:3px 7px; font-weight:500; margin-left:6px; vertical-align:middle; }

      .ys-modal-bg{ position:fixed; inset:0; background:rgba(20,22,35,.5); display:flex; align-items:center; justify-content:center; z-index:50; padding:16px; }
      .ys-modal{ background:#fff; border-radius:18px; max-width:520px; width:100%; max-height:85vh; overflow:auto; }
      .ys-modal-head{ display:flex; justify-content:space-between; align-items:center; padding:16px 18px; border-bottom:1px solid var(--card-bd); position:sticky; top:0; background:#fff; }
      .ys-modal-head h2{ font-family:var(--font-display); font-size:18px; margin:0; }
      .ys-modal-head button{ background:none; border:none; cursor:pointer; color:var(--ink-soft); }
      .ys-modal-body{ padding:18px; }

      .ys-header{ display:flex; align-items:center; gap:10px; padding:16px 16px 10px; }
      .ys-header-title{ flex:1; }
      .ys-header-name{ font-family:var(--font-display); font-weight:700; font-size:16px; }
      .ys-header-sub{ font-size:11.5px; color:var(--ink-soft); }
      .ys-nav{ display:flex; gap:4px; padding:0 12px 10px; overflow-x:auto; }
      .ys-nav-btn{ flex:1; display:flex; flex-direction:column; align-items:center; gap:3px; padding:8px 4px; border-radius:12px; border:none; background:transparent; color:var(--ink-soft); font-size:11px; cursor:pointer; white-space:nowrap; }
      .ys-nav-btn.active{ background:var(--navy); color:#fff; }
      .ys-main{ padding:0 14px; }
      .ys-footer{ text-align:center; color:var(--ink-soft); font-size:11px; padding:22px 0 8px; }

      .ys-hero-card{ display:flex; align-items:center; gap:18px; background:linear-gradient(135deg,#fff,#FBF3E4); }
      .ys-hero-right{ flex:1; }
      .ys-progress-bar{ height:8px; background:var(--ring-bg); border-radius:5px; overflow:hidden; margin:6px 0; }
      .ys-progress-fill{ height:100%; background:linear-gradient(90deg,var(--amber),var(--mint)); border-radius:5px; transition:width .5s; }
      .ys-diag-chip{ display:inline-flex; align-items:center; gap:5px; font-size:11.5px; background:var(--navy); color:#fff; padding:4px 9px; border-radius:20px; margin-top:6px; }

      .ys-card h2{ font-family:var(--font-display); font-size:17px; display:flex; align-items:center; gap:7px; margin:0 0 12px; }
      .ys-diag-grid{ display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:12px; }
      .ys-diag-grid div{ display:flex; flex-direction:column; gap:2px; }
      .ys-diag-grid span{ font-size:11px; color:var(--ink-soft); }
      .ys-diag-grid b{ font-size:13px; }
      .ys-caution-box{ background:#FFF8EC; border:1px solid #F0DDA9; border-radius:12px; padding:12px; }
      .ys-caution-box ul{ margin:6px 0 0; padding-left:18px; font-size:12.5px; line-height:1.6; }

      .ys-review-card{ background:linear-gradient(135deg,#20242B,#31385A); color:#fff; border:none; }
      .ys-review-head{ display:flex; align-items:center; gap:8px; margin-bottom:10px; }
      .ys-review-head h3{ font-family:var(--font-display); font-size:15.5px; margin:0; }
      .ys-review-block{ margin-bottom:10px; }
      .ys-review-label{ font-size:11px; opacity:.75; margin-bottom:3px; font-weight:600; }
      .ys-review-block p{ margin:0; font-size:13.5px; line-height:1.55; }
      .ys-review-tip{ display:flex; align-items:center; gap:6px; font-size:12.5px; background:rgba(255,255,255,.12); padding:8px 10px; border-radius:9px; margin-top:4px; }

      .ys-mentor-card{ background:#FFF4EE; border-color:#F3D8CB; }
      .ys-mentor-title{ font-weight:700; font-size:14px; margin-bottom:4px; }
      .ys-mentor-body{ font-size:13px; line-height:1.6; color:var(--ink); margin:0 0 10px; }

      .ys-subj-head{ display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px; }
      .ys-subj-head h3{ font-family:var(--font-display); font-size:15.5px; margin:0 0 2px; }
      .ys-badge{ display:inline-block; font-size:10.5px; padding:2px 8px; border-radius:20px; font-weight:600; }
      .ys-badge.weak{ background:#FDE7E5; color:var(--coral); }
      .ys-badge.ok{ background:#E5F3EB; color:var(--mint); }
      .ys-badge.tiny{ font-size:10px; padding:2px 6px; margin-right:5px; }
      .ys-badge.new{ background:#EAF0FF; color:#4A63C7; }
      .ys-badge.review{ background:#FFF1DC; color:#B57A18; }
      .ys-badge.final{ background:#F0E5FF; color:#7C4DC4; }

      .ys-unit-block{ border-top:1px solid var(--card-bd); padding-top:8px; margin-top:8px; }
      .ys-unit-head{ display:flex; align-items:center; gap:6px; cursor:pointer; font-size:13.5px; font-weight:600; padding:4px 0; }
      .ys-unit-head span:nth-child(2){ flex:1; }
      .ys-subtopic-list{ padding-left:20px; margin-top:6px; display:flex; flex-direction:column; gap:6px; }
      .ys-subtopic-row{ display:flex; align-items:center; gap:8px; font-size:12.5px; }
      .ys-subtopic-row span:first-child{ flex:1; }

      .ys-exam-row{ display:flex; justify-content:space-between; align-items:center; }

      .ys-date-nav{ display:flex; align-items:center; justify-content:center; gap:14px; margin-bottom:2px; }
      .ys-date-label{ font-family:var(--font-display); font-size:15.5px; display:flex; align-items:center; gap:6px; }
      .ys-today-head{ display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; }
      .ys-today-head h2{ font-family:var(--font-display); font-size:16.5px; margin:0; }
      .ys-task-row{ display:flex; align-items:flex-start; gap:10px; padding:10px 0; border-top:1px solid var(--card-bd); }
      .ys-task-row.done{ opacity:.6; }
      .ys-task-row.done .ys-task-title, .ys-task-row.done .ys-task-sub{ text-decoration:line-through; }
      .ys-check{ background:none; border:none; cursor:pointer; padding:2px; flex-shrink:0; }
      .ys-task-main{ flex:1; }
      .ys-task-title{ font-size:13px; margin-bottom:2px; }
      .ys-task-sub{ font-size:12.5px; color:var(--ink-soft); }
      .ys-star-btn{ background:none; border:none; cursor:pointer; padding:1px; }

      .ys-field textarea{ font-family:var(--font-body); font-size:13.5px; padding:10px 12px; border:1.5px solid var(--card-bd); border-radius:10px; color:var(--ink); background:var(--cream); resize:vertical; }
      .ys-field textarea:focus{ outline:none; border-color:var(--amber); }

      .ys-planner-top{ background:linear-gradient(135deg,#fff,#FDF6E9); }
      .ys-planner-top-row{ display:flex; gap:14px; align-items:flex-start; }
      .ys-planner-date{ text-align:center; flex-shrink:0; background:var(--navy); color:#fff; border-radius:12px; padding:8px 14px; min-width:56px; }
      .ys-planner-date-num{ font-family:var(--font-display); font-size:22px; font-weight:700; line-height:1; }
      .ys-planner-date-sub{ font-size:9.5px; opacity:.8; margin-top:3px; white-space:nowrap; }
      .ys-planner-goal{ flex:1; display:flex; flex-direction:column; gap:5px; padding-top:4px; }
      .ys-planner-goal span{ font-size:11px; color:var(--ink-soft); font-weight:600; }
      .ys-planner-goal input{ border:none; border-bottom:1.5px dashed var(--ink-soft); background:transparent; font-family:var(--font-display); font-size:15px; padding:3px 2px; }
      .ys-planner-goal input:focus{ outline:none; border-color:var(--amber); }
      .ys-planner-quick{ display:flex; justify-content:space-between; align-items:center; margin-top:14px; padding-top:10px; border-top:1px dashed var(--card-bd); flex-wrap:wrap; gap:10px; }
      .ys-mood-row{ display:flex; align-items:center; gap:4px; }
      .ys-mood-btn{ background:none; border:1.5px solid transparent; border-radius:8px; font-size:17px; padding:2px 4px; cursor:pointer; opacity:.5; }
      .ys-mood-btn.sel{ opacity:1; border-color:var(--amber); background:#FFF6E6; }
      .ys-sleep-input{ display:flex; align-items:center; gap:5px; }
      .ys-sleep-input input{ width:44px; padding:5px 6px; border:1.5px solid var(--card-bd); border-radius:8px; font-size:12.5px; text-align:center; }

      .ys-priority-row{ display:flex; align-items:center; gap:9px; padding:6px 0; font-size:13px; }
      .ys-priority-num{ width:20px; height:20px; border-radius:50%; background:var(--coral); color:#fff; font-size:11px; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
      .ys-done-text{ text-decoration:line-through; color:var(--ink-soft); }

      .ys-ruler{ border-top:1px solid var(--card-bd); }
      .ys-ruler-row{ display:flex; border-bottom:1px dashed var(--card-bd); min-height:34px; }
      .ys-ruler-row.has-task{ background:#FFFBF2; }
      .ys-ruler-hour{ width:52px; flex-shrink:0; font-size:11px; color:var(--ink-soft); padding:8px 6px 0 0; text-align:right; font-family:var(--font-display); border-right:1px solid var(--card-bd); }
      .ys-ruler-hour span{ font-size:9px; }
      .ys-ruler-content{ flex:1; padding:2px 0 2px 10px; display:flex; flex-direction:column; }
      .ys-ruler-memo{ border:none; background:transparent; font-size:12.5px; padding:8px 4px; width:100%; color:var(--ink-soft); }
      .ys-ruler-memo:focus{ outline:none; color:var(--ink); }

      .ys-chip-row{ display:flex; align-items:flex-start; gap:8px; padding:6px 4px; }
      .ys-chip-row.done{ opacity:.6; }
      .ys-chip-row.done .ys-task-title, .ys-chip-row.done .ys-task-sub{ text-decoration:line-through; }
      .ys-chip-main{ flex:1; }
      .ys-star-toggle{ background:none; border:none; cursor:pointer; padding:2px; flex-shrink:0; }

      .ys-weak-row{ padding:10px 0; border-top:1px solid var(--card-bd); font-size:13px; }
      .ys-weak-row:first-of-type{ border-top:none; }

      /* 학습 현황 패널 */
      .ys-stats-row{ display:flex; gap:16px; flex-wrap:wrap; }
      .ys-stats-block{ flex:1; min-width:140px; }
      .ys-stats-label{ font-size:12px; font-weight:600; margin-bottom:5px; }
      .ys-subject-stats{ margin-top:14px; padding-top:10px; border-top:1px dashed var(--card-bd); display:flex; flex-direction:column; gap:8px; }
      .ys-subject-stat-row{ display:grid; grid-template-columns:70px 1fr 70px; align-items:center; gap:8px; }
      .ys-subject-stat-name{ font-size:12.5px; font-weight:600; }
      .ys-progress-bar.sm{ height:6px; margin:0; }

      /* 제안 배너 */
      .ys-suggestion-banner{ background:#FFF3E0; border-color:#F0CB8C; position:relative; padding-right:36px; }
      .ys-suggestion-head{ display:flex; align-items:center; gap:6px; font-size:12px; font-weight:700; color:#A56A17; margin-bottom:4px; }
      .ys-suggestion-banner p{ margin:0; font-size:13px; line-height:1.5; }
      .ys-suggestion-banner .ys-icon-btn{ position:absolute; top:10px; right:10px; }

      /* 체크리스트 카드 */
      .ys-checklist-card{ border:1.5px solid var(--mint); }
      .ys-checklist-list{ display:flex; flex-direction:column; }
      .ys-check-big{ background:none; border:none; cursor:pointer; padding:2px; flex-shrink:0; margin-top:1px; }
      .ys-rate-row{ display:flex; align-items:center; gap:6px; margin-top:4px; }
      .ys-finish-btn{ width:100%; margin-top:6px; }

      /* 시간표 자 - 읽기전용 칩 */
      .ys-ruler-chip{ display:flex; align-items:center; gap:6px; font-size:11.5px; padding:4px 4px; color:var(--ink); }
      .ys-ruler-chip.done{ opacity:.5; text-decoration:line-through; }

      /* 계획 미리보기 */
      .ys-preview-card{ border:1.5px solid var(--amber); background:#FFFBF2; }
      .ys-preview-grid{ display:flex; flex-direction:column; gap:8px; margin-bottom:12px; }
      .ys-preview-row{ display:flex; flex-direction:column; gap:2px; padding:8px 10px; background:#fff; border-radius:10px; border:1px solid var(--card-bd); }

      /* 시험범위 선택 */
      .ys-scope-picker{ margin-top:10px; padding-top:10px; border-top:1px dashed var(--card-bd); }
      .ys-scope-toggle{ background:none; border:none; cursor:pointer; display:flex; align-items:center; gap:6px; font-size:12.5px; font-weight:600; color:var(--ink); padding:0; }
      .ys-scope-body{ margin-top:8px; padding-left:18px; }
      .ys-scope-unit{ margin-bottom:8px; }
      .ys-scope-unit-title{ font-size:12.5px; font-weight:600; margin-bottom:3px; }
      .ys-scope-item{ display:flex; align-items:center; gap:7px; font-size:12.5px; padding:3px 0; cursor:pointer; }

      /* AI 단원 추천 */
      .ys-ai-suggest{ margin-top:8px; }
      .ys-ai-suggest-box{ margin-top:8px; padding:10px; background:var(--cream); border-radius:10px; border:1px dashed var(--card-bd); }

      /* 진단 시각화 */
      .ys-diag-visual{ display:flex; gap:18px; align-items:center; flex-wrap:wrap; margin-bottom:12px; }
      .ys-diag-score-ring{ text-align:center; flex-shrink:0; }
      .ys-diag-delta{ font-size:10.5px; margin-top:6px; font-weight:600; }
      .ys-diag-delta.up{ color:var(--mint); }
      .ys-diag-delta.down{ color:var(--coral); }
      .ys-diag-bars{ flex:1; min-width:160px; display:flex; flex-direction:column; gap:9px; }
      .ys-diag-bar-row{ display:flex; align-items:center; gap:8px; }
      .ys-diag-bar-label{ width:60px; flex-shrink:0; font-size:11.5px; font-weight:600; }
      .ys-diag-style-chip{ display:inline-flex; align-items:center; gap:5px; font-size:11.5px; background:var(--navy); color:#fff; padding:4px 10px; border-radius:20px; margin-bottom:10px; }
      .ys-growth-box{ background:#EFFAF3; border:1px solid #BFE6CC; border-radius:12px; padding:12px; margin-bottom:10px; }
      .ys-growth-box p{ margin:4px 0 0; font-size:13px; line-height:1.5; }

      /* 계획 스타일 선택 */
      .ys-style-picker{ display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:12px; }
      .ys-style-card{ text-align:left; background:#fff; border:1.5px solid var(--card-bd); border-radius:12px; padding:12px; cursor:pointer; display:flex; flex-direction:column; gap:4px; }
      .ys-style-card.sel{ border-color:var(--mint); background:#F3FBF6; }
      .ys-style-card-head{ font-weight:700; font-size:13.5px; display:flex; align-items:center; gap:5px; }
      .ys-style-card-stat{ font-size:11px; color:var(--ink-soft); margin-top:4px; }
      .ys-plan-bullets{ background:var(--cream); border-radius:10px; padding:10px 12px; margin-bottom:12px; display:flex; flex-direction:column; gap:5px; }
      .ys-bullet-row{ font-size:12.5px; line-height:1.5; }

      /* 타임박스 뷰 */
      .ys-timebox-track{ position:relative; display:flex; gap:2px; margin-top:8px; }
      .ys-timebox-cell{ flex:1; height:26px; background:var(--ring-bg); border-radius:4px; display:flex; align-items:center; justify-content:center; font-size:9.5px; color:var(--ink-soft); }
      .ys-timebox-cell.has{ background:#FFD9A0; color:#7A4A05; font-weight:700; }
      .ys-timebox-cell.all-done{ background:var(--mint); color:#fff; }
      .ys-timebox-now{ position:absolute; top:-4px; bottom:-4px; width:0; border-left:2px solid var(--coral); }
      .ys-timebox-labels{ display:flex; justify-content:space-between; font-size:10px; color:var(--ink-soft); margin-top:4px; }

      /* 실시간 현재시각 마커 */
      .ys-now-dot{ position:absolute; top:50%; width:9px; height:9px; border-radius:50%; background:var(--coral); transform:translate(-50%,-50%); animation:ys-pulse 1.4s ease-in-out infinite; z-index:2; }
      .ys-now-dot.static{ position:static; transform:none; display:inline-block; }
      @keyframes ys-pulse{ 0%,100%{ box-shadow:0 0 0 0 rgba(232,97,90,.55);} 50%{ box-shadow:0 0 0 6px rgba(232,97,90,0);} }
      .ys-ruler-row.is-now{ background:#FDE2E2; }
      .ys-ruler-row.expanded{ background:#F7F5EF; border-radius:10px; }
      .ys-ruler-content{ position:relative; }
      .ys-ruler-hour{ cursor:pointer; background:none; border:none; padding:0; }
      .ys-ruler-hour:hover{ color:var(--amber); }

      /* 탭하면 확대되는 10분 단위 그리드 */
      .ys-tenmin-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:6px; padding:6px 4px; }
      .ys-tenmin-cell{ position:relative; height:52px; border-radius:10px; border:1.5px solid var(--card-bd); background:#fff; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; cursor:pointer; }
      .ys-tenmin-cell.filled{ border-color:transparent; color:#fff; }
      .ys-tenmin-cell.now{ box-shadow:0 0 0 2px var(--coral); }
      .ys-tenmin-label{ font-size:11px; font-weight:700; opacity:.85; }
      .ys-tenmin-subj{ font-size:10px; font-weight:600; }

      /* 일론 머스크식 초밀도 스케줄 카드 */
      .ys-musk-card{ border:1.5px solid var(--navy); background:linear-gradient(135deg,#fff,#F2F3FA); }
      .ys-musk-card h2{ font-family:var(--font-display); font-size:16px; margin:0 0 8px; }
      .ys-musk-bullets{ margin:0; padding-left:18px; font-size:12.5px; line-height:1.6; color:var(--ink); }
      .ys-musk-confirm{ margin-top:10px; padding:10px; background:#FFF3E9; border:1px solid var(--amber); border-radius:10px; }
      .ys-musk-confirm p{ margin:0 0 8px; font-size:12.5px; line-height:1.5; }

      /* 쉬는시간 5분 버튼 + 서프라이즈 팝업 */
      .ys-break-card{ background:linear-gradient(135deg,#FFF4EE,#FFE9DC); border-color:#F3D0BC; }
      .ys-break-inner{ display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; }
      .ys-break-title{ font-family:var(--font-display); font-size:15px; font-weight:700; margin-bottom:3px; }
      .ys-surprise-modal{ background:#fff; border-radius:22px; max-width:380px; width:100%; padding:28px 22px 22px; text-align:center; position:relative; animation:ys-pop .25s ease; }
      @keyframes ys-pop{ from{ transform:scale(.9); opacity:0; } to{ transform:scale(1); opacity:1; } }
      .ys-surprise-close{ position:absolute; top:12px; right:12px; background:none; border:none; color:var(--ink-soft); cursor:pointer; }
      .ys-surprise-icon{ font-size:44px; margin-bottom:6px; }
      .ys-surprise-label{ font-size:12px; font-weight:700; color:var(--coral); text-transform:uppercase; letter-spacing:.03em; margin-bottom:10px; }
      .ys-surprise-text{ font-size:15px; line-height:1.6; margin:0 0 20px; min-height:48px; }
      .ys-surprise-btns{ display:flex; gap:8px; justify-content:center; }

      /* 진행중 상태 / 실시간 메모 */
      .ys-chip-row.doing{ background:#FFF8EF; border-radius:10px; padding-left:4px; }
      .ys-doing-tag{ font-size:10px; color:var(--coral); font-weight:700; }
      .ys-doing-btn{ background:none; border:1px solid var(--card-bd); border-radius:8px; font-size:10.5px; padding:3px 8px; margin-top:4px; cursor:pointer; color:var(--ink-soft); }
      .ys-doing-btn.on{ background:var(--coral); color:#fff; border-color:var(--coral); }
      .ys-task-note{ width:100%; border:1px dashed var(--card-bd); background:transparent; border-radius:8px; font-size:12px; padding:6px 8px; margin-top:5px; }
      .ys-ruler-chip.doing{ background:#FFF0DC; border-radius:6px; }
      .ys-custom-add{ margin-top:10px; padding-top:10px; border-top:1px dashed var(--card-bd); }

      /* 세부계획(배치) 선택 */
      .ys-arrangement-grid{ display:grid; grid-template-columns:1fr; gap:8px; margin-top:8px; }
      .ys-arrangement-card{ text-align:left; background:#fff; border:1.5px solid var(--card-bd); border-radius:10px; padding:10px 12px; cursor:pointer; }
      .ys-arrangement-card.sel{ border-color:var(--amber); background:#FFFBF2; }
      .ys-arrangement-head{ font-weight:700; font-size:13px; display:flex; align-items:center; gap:6px; }

      /* 어제·오늘·내일 비교 */
      .ys-compare-grid{ display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; }
      .ys-compare-col{ background:#fff; border:1.5px solid var(--card-bd); border-radius:12px; padding:10px 6px; text-align:center; cursor:pointer; }
      .ys-compare-col.sel{ border-color:var(--navy); background:#F3F4FA; }
      .ys-compare-label{ font-size:11px; color:var(--ink-soft); font-weight:600; }
      .ys-compare-date{ font-size:11px; margin-bottom:4px; }
      .ys-compare-count{ font-family:var(--font-display); font-size:17px; font-weight:700; margin-bottom:4px; }
      .ys-compare-subjects{ display:flex; flex-direction:column; gap:1px; }

      /* 목표시간(GOAL) */
      .ys-goal-time-row{ display:flex; align-items:center; gap:6px; margin-top:12px; padding-top:10px; border-top:1px dashed var(--card-bd); flex-wrap:wrap; }
      .ys-goal-time-row input{ width:50px; padding:5px 6px; border:1.5px solid var(--card-bd); border-radius:8px; font-size:12.5px; text-align:center; }

      /* 과목별 스톱워치 */
      .ys-stopwatch-total{ font-size:13px; margin-bottom:10px; }
      .ys-stopwatch-list{ display:flex; flex-direction:column; gap:6px; }
      .ys-stopwatch-row{ display:flex; align-items:center; gap:8px; padding:8px 10px; border-radius:10px; background:var(--cream); }
      .ys-stopwatch-row.running{ background:#FFF3E9; border:1px solid var(--amber); }
      .ys-subject-dot{ width:10px; height:10px; border-radius:50%; flex-shrink:0; }
      .ys-stopwatch-name{ flex:1; font-size:13px; font-weight:600; }
      .ys-stopwatch-time{ font-family:var(--font-display); font-size:13.5px; font-variant-numeric:tabular-nums; }
      .ys-stopwatch-btn{ border:none; border-radius:8px; padding:6px 10px; font-size:11.5px; font-weight:700; cursor:pointer; background:var(--navy); color:#fff; }
      .ys-stopwatch-btn.on{ background:var(--coral); }

      /* 자동으로 채워지는 세로 타임라인 */
      .ys-vtimeline{ display:flex; gap:8px; }
      .ys-vtimeline-hours{ display:flex; flex-direction:column; flex-shrink:0; }
      .ys-vtimeline-hourlabel{ font-size:9.5px; color:var(--ink-soft); display:flex; align-items:flex-start; }
      .ys-vtimeline-track{ position:relative; flex:1; background:var(--cream); border-radius:8px; overflow:hidden; }
      .ys-vtimeline-gridline{ position:absolute; left:0; right:0; height:1px; background:var(--card-bd); }
      .ys-vtimeline-block{ position:absolute; left:4px; right:4px; border-radius:5px; color:#fff; font-size:9.5px; padding:1px 5px; overflow:hidden; white-space:nowrap; }
      .ys-vtimeline-now{ position:absolute; left:0; right:0; height:0; border-top:2px solid var(--coral); z-index:3; }
      .ys-vtimeline-now .ys-now-dot.static{ position:absolute; left:-4px; top:-4px; }

      /* 월간 캘린더 뷰 */
      .ys-cal-head{ display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
      .ys-cal-title{ font-family:var(--font-display); font-size:17px; font-weight:700; }
      .ys-cal-weekrow{ display:grid; grid-template-columns:repeat(7,1fr); margin-bottom:4px; }
      .ys-cal-weekday{ text-align:center; font-size:11px; color:var(--ink-soft); font-weight:600; padding:4px 0; }
      .ys-cal-weekday.sun{ color:var(--coral); }
      .ys-cal-weekday.sat{ color:#4A63C7; }
      .ys-cal-grid{ display:grid; grid-template-columns:repeat(7,1fr); gap:3px; }
      .ys-cal-cell{ aspect-ratio:1; border:none; background:var(--cream); border-radius:9px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:3px; cursor:pointer; padding:2px; }
      .ys-cal-cell.empty{ background:transparent; cursor:default; }
      .ys-cal-cell.today{ background:#FFF3E0; border:1.5px solid var(--amber); }
      .ys-cal-cell.sel{ background:var(--navy); }
      .ys-cal-cell.sel .ys-cal-daynum{ color:#fff; }
      .ys-cal-daynum{ font-size:12.5px; font-weight:600; }
      .ys-cal-dots{ display:flex; gap:2px; min-height:6px; flex-wrap:wrap; justify-content:center; }
      .ys-cal-dot{ width:5px; height:5px; border-radius:50%; }
      .ys-cal-dot.plan{ background:var(--ink-soft); opacity:.5; }
      .ys-upcoming-row{ display:flex; align-items:center; gap:10px; padding:10px 0; border-top:1px solid var(--card-bd); cursor:pointer; background:none; border-left:none; border-right:none; border-bottom:none; width:100%; text-align:left; }
      .ys-upcoming-row:first-of-type{ border-top:none; }
      .ys-upcoming-main{ flex:1; }

      @media (max-width:420px){
        .ys-diag-grid{ grid-template-columns:1fr; }
        .ys-nav-btn{ font-size:10px; }
      }
    `}</style>
  );
}
