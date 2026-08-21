import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error(
    "Supabase 환경변수가 설정되지 않았어. .env 파일(또는 배포 플랫폼의 환경변수)에 VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY를 넣어줘."
  );
}

export const supabase = createClient(url, anonKey);
