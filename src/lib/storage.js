import { supabase } from "./supabaseClient";

// Claude 아티팩트의 window.storage API를 그대로 흉내내는 폴리필.
// App.jsx 코드는 전혀 수정하지 않고 window.storage.get/set/delete/list를 그대로 호출한다.
// 실제 데이터는 Supabase의 kv_store 테이블에 로그인한 사용자(user_id) 기준으로 저장/동기화된다.

let currentUserId = null;
export function setStorageUserId(userId) {
  currentUserId = userId;
}

async function get(key, shared = false) {
  if (!currentUserId) return null;
  const { data, error } = await supabase
    .from("kv_store")
    .select("value")
    .eq("user_id", currentUserId)
    .eq("key", key)
    .eq("shared", shared)
    .maybeSingle();
  if (error || !data) return null;
  return { key, value: data.value, shared };
}

async function set(key, value, shared = false) {
  if (!currentUserId) return null;
  const { error } = await supabase
    .from("kv_store")
    .upsert(
      { user_id: currentUserId, key, value, shared, updated_at: new Date().toISOString() },
      { onConflict: "user_id,key,shared" }
    );
  if (error) {
    console.error("storage.set error", error);
    return null;
  }
  return { key, value, shared };
}

async function del(key, shared = false) {
  if (!currentUserId) return null;
  const { error } = await supabase
    .from("kv_store")
    .delete()
    .eq("user_id", currentUserId)
    .eq("key", key)
    .eq("shared", shared);
  if (error) return null;
  return { key, deleted: true, shared };
}

async function list(prefix = "", shared = false) {
  if (!currentUserId) return null;
  let query = supabase.from("kv_store").select("key").eq("user_id", currentUserId).eq("shared", shared);
  if (prefix) query = query.like("key", `${prefix}%`);
  const { data, error } = await query;
  if (error) return null;
  return { keys: (data || []).map((r) => r.key), prefix, shared };
}

export function installWindowStorage() {
  window.storage = { get, set, delete: del, list };
}
