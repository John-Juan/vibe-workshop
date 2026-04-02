"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
import { Doughnut, Bar, Pie, Line } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler
);

interface Signup {
  id: string;
  created_at: string;
  name: string;
  email: string;
  department: string;
  position: string;
  ai_experience: string;
  learning_goal: string;
  dietary_restrictions: string | null;
}

const DEPARTMENTS = ["프로덕트", "마케팅", "세일즈", "컨설팅", "개발", "디자인", "경영지원", "기타"];
const AI_EXPERIENCES = ["처음이에요", "ChatGPT 정도 써봤어요", "Claude도 써봤어요", "Claude Code까지 써봤어요"];
const LEARNING_GOALS = ["업무 자동화", "데이터 분석", "웹서비스 만들기", "AI 도구 전반", "기타"];

const ORANGE_PALETTE = [
  "#ff6b35", "#ff8c5a", "#ffad80", "#ffcda6", "#ffe4cc",
  "#e85d2c", "#cc5025", "#b3431e", "#993617", "#802910",
];

function countByField(data: Signup[], field: keyof Signup, categories: string[]): number[] {
  const counts = new Map<string, number>();
  categories.forEach((c) => counts.set(c, 0));
  data.forEach((row) => {
    const val = row[field] as string;
    if (counts.has(val)) {
      counts.set(val, (counts.get(val) ?? 0) + 1);
    } else {
      counts.set("기타", (counts.get("기타") ?? 0) + 1);
    }
  });
  return categories.map((c) => counts.get(c) ?? 0);
}

function getTopItem(data: Signup[], field: keyof Signup): string {
  if (data.length === 0) return "-";
  const counts = new Map<string, number>();
  data.forEach((row) => {
    const val = row[field] as string;
    counts.set(val, (counts.get(val) ?? 0) + 1);
  });
  let max = 0;
  let top = "-";
  counts.forEach((count, key) => {
    if (count > max) {
      max = count;
      top = key;
    }
  });
  return top;
}

function getTodayCountKST(data: Signup[]): number {
  const now = new Date();
  const kstOffset = 9 * 60 * 60 * 1000;
  const kstNow = new Date(now.getTime() + kstOffset);
  const todayStr = kstNow.toISOString().slice(0, 10);
  return data.filter((row) => {
    const kstDate = new Date(new Date(row.created_at).getTime() + kstOffset);
    return kstDate.toISOString().slice(0, 10) === todayStr;
  }).length;
}

function getLast7DaysData(data: Signup[]): { labels: string[]; counts: number[] } {
  const kstOffset = 9 * 60 * 60 * 1000;
  const now = new Date();
  const kstNow = new Date(now.getTime() + kstOffset);

  const labels: string[] = [];
  const dateMap = new Map<string, number>();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(kstNow);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    labels.push(dateStr.slice(5)); // MM-DD
    dateMap.set(dateStr, 0);
  }

  data.forEach((row) => {
    const kstDate = new Date(new Date(row.created_at).getTime() + kstOffset);
    const dateStr = kstDate.toISOString().slice(0, 10);
    if (dateMap.has(dateStr)) {
      dateMap.set(dateStr, (dateMap.get(dateStr) ?? 0) + 1);
    }
  });

  const counts = Array.from(dateMap.values());
  return { labels, counts };
}

function formatKST(dateStr: string): string {
  const d = new Date(dateStr);
  const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  const y = kst.getUTCFullYear();
  const m = String(kst.getUTCMonth() + 1).padStart(2, "0");
  const day = String(kst.getUTCDate()).padStart(2, "0");
  const h = String(kst.getUTCHours()).padStart(2, "0");
  const min = String(kst.getUTCMinutes()).padStart(2, "0");
  return `${y}-${m}-${day} ${h}:${min}`;
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: "#ccc", font: { size: 12 } } },
  },
};

export default function Dashboard() {
  const [signups, setSignups] = useState<Signup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!supabase) {
      setError("Supabase 연결이 설정되지 않았습니다.");
      setLoading(false);
      return;
    }
    const { data, error: fetchError } = await supabase
      .from("signups")
      .select("*")
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError("데이터를 불러오는 중 오류가 발생했습니다.");
      console.error(fetchError);
    } else {
      setSignups(data ?? []);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const todayCount = getTodayCountKST(signups);
  const topDept = getTopItem(signups, "department");
  const topExp = getTopItem(signups, "ai_experience");
  const deptCounts = countByField(signups, "department", DEPARTMENTS);
  const expCounts = countByField(signups, "ai_experience", AI_EXPERIENCES);
  const goalCounts = countByField(signups, "learning_goal", LEARNING_GOALS);
  const daily = getLast7DaysData(signups);

  const summaryCards = [
    { label: "총 신청 인원", value: signups.length },
    { label: "오늘 신청", value: todayCount },
    { label: "가장 많은 소속 팀", value: topDept },
    { label: "가장 많은 AI 경험", value: topExp },
  ];

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
        <p className="text-gray-400 text-lg">데이터를 불러오는 중...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
        <p className="text-red-400 text-lg">{error}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f0f1a] text-white px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold">
            AI 바이브 코딩 마스터클래스{" "}
            <span className="text-[#ff6b35]">신청 현황</span>
          </h1>
          <button
            onClick={() => { setLoading(true); fetchData(); }}
            className="bg-[#ff6b35] hover:bg-orange-500 text-white font-semibold px-5 py-2 rounded-lg transition-colors text-sm self-start sm:self-auto"
          >
            새로고침
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className="bg-[#1a1a2e] rounded-xl p-5 shadow-lg border border-gray-800"
            >
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">{card.label}</p>
              <p className="text-2xl font-bold text-[#ff6b35]">{card.value}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* 소속 팀별 도넛 */}
          <div className="bg-[#1a1a2e] rounded-xl p-5 shadow-lg border border-gray-800">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">소속 팀별 신청 분포</h3>
            <div className="h-64">
              <Doughnut
                data={{
                  labels: DEPARTMENTS,
                  datasets: [{
                    data: deptCounts,
                    backgroundColor: ORANGE_PALETTE.slice(0, DEPARTMENTS.length),
                    borderWidth: 0,
                  }],
                }}
                options={chartOptions}
              />
            </div>
          </div>

          {/* AI 경험 수평 바 */}
          <div className="bg-[#1a1a2e] rounded-xl p-5 shadow-lg border border-gray-800">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">AI 도구 사용 경험 분포</h3>
            <div className="h-64">
              <Bar
                data={{
                  labels: AI_EXPERIENCES,
                  datasets: [{
                    label: "명",
                    data: expCounts,
                    backgroundColor: "#ff6b35",
                    borderRadius: 4,
                  }],
                }}
                options={{
                  ...chartOptions,
                  indexAxis: "y" as const,
                  scales: {
                    x: { ticks: { color: "#999", stepSize: 1 }, grid: { color: "#2a2a3e" } },
                    y: { ticks: { color: "#ccc", font: { size: 11 } }, grid: { display: false } },
                  },
                }}
              />
            </div>
          </div>

          {/* 배우고 싶은 것 파이 */}
          <div className="bg-[#1a1a2e] rounded-xl p-5 shadow-lg border border-gray-800">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">가장 배우고 싶은 것</h3>
            <div className="h-64">
              <Pie
                data={{
                  labels: LEARNING_GOALS,
                  datasets: [{
                    data: goalCounts,
                    backgroundColor: ORANGE_PALETTE.slice(0, LEARNING_GOALS.length),
                    borderWidth: 0,
                  }],
                }}
                options={chartOptions}
              />
            </div>
          </div>

          {/* 일별 추이 라인 */}
          <div className="bg-[#1a1a2e] rounded-xl p-5 shadow-lg border border-gray-800">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">일별 신청 추이 (최근 7일)</h3>
            <div className="h-64">
              <Line
                data={{
                  labels: daily.labels,
                  datasets: [{
                    label: "신청 수",
                    data: daily.counts,
                    borderColor: "#ff6b35",
                    backgroundColor: "rgba(255,107,53,0.15)",
                    fill: true,
                    tension: 0.3,
                    pointBackgroundColor: "#ff6b35",
                  }],
                }}
                options={{
                  ...chartOptions,
                  scales: {
                    x: { ticks: { color: "#999" }, grid: { color: "#2a2a3e" } },
                    y: { ticks: { color: "#999", stepSize: 1 }, grid: { color: "#2a2a3e" }, beginAtZero: true },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#1a1a2e] rounded-xl shadow-lg border border-gray-800 overflow-x-auto">
          <h3 className="text-sm font-semibold text-gray-300 p-5 pb-0">신청자 목록</h3>
          <table className="w-full text-sm mt-4">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400 text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3">이름</th>
                <th className="text-left px-5 py-3">이메일</th>
                <th className="text-left px-5 py-3">소속 팀</th>
                <th className="text-left px-5 py-3">직급</th>
                <th className="text-left px-5 py-3">AI 경험</th>
                <th className="text-left px-5 py-3">배우고 싶은 것</th>
                <th className="text-left px-5 py-3">식이 제한</th>
                <th className="text-left px-5 py-3">신청일시</th>
              </tr>
            </thead>
            <tbody>
              {signups.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-gray-500 py-8">
                    아직 신청 데이터가 없습니다.
                  </td>
                </tr>
              ) : (
                signups.map((s) => (
                  <tr key={s.id} className="border-b border-gray-800 hover:bg-[#22223a] transition-colors">
                    <td className="px-5 py-3 text-white font-medium">{s.name}</td>
                    <td className="px-5 py-3 text-gray-300">{s.email}</td>
                    <td className="px-5 py-3 text-gray-300">{s.department}</td>
                    <td className="px-5 py-3 text-gray-300">{s.position}</td>
                    <td className="px-5 py-3 text-gray-300">{s.ai_experience}</td>
                    <td className="px-5 py-3 text-gray-300">{s.learning_goal}</td>
                    <td className={`px-5 py-3 ${s.dietary_restrictions ? "bg-yellow-900/40 text-yellow-300" : "text-gray-500"}`}>
                      {s.dietary_restrictions || "-"}
                    </td>
                    <td className="px-5 py-3 text-gray-400 whitespace-nowrap">{formatKST(s.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <footer className="text-center py-8 mt-8 border-t border-gray-800">
          <p className="text-gray-500 text-sm">Powered by Listeningmind ☕</p>
        </footer>
      </div>
    </main>
  );
}
