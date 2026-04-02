"use client";

import { useState } from "react";

interface FormData {
  name: string;
  email: string;
  department: string;
  rank: string;
  aiExperience: string;
  learningGoal: string;
  dietaryRestrictions: string;
}

const initialFormData: FormData = {
  name: "",
  email: "",
  department: "",
  rank: "",
  aiExperience: "",
  learningGoal: "",
  dietaryRestrictions: "",
};

export default function Home() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [duplicateError, setDuplicateError] = useState(false);

  const getSubmittedEmails = (): string[] => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("workshopSubmittedEmails");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveSubmittedEmail = (email: string) => {
    if (typeof window === "undefined") return;
    const emails = getSubmittedEmails();
    emails.push(email.toLowerCase());
    localStorage.setItem("workshopSubmittedEmails", JSON.stringify(emails));
  };

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.name.trim()) newErrors.name = "이름을 입력해주세요.";
    if (!formData.email.trim()) {
      newErrors.email = "이메일을 입력해주세요.";
    } else if (!formData.email.includes("@")) {
      newErrors.email = "올바른 이메일 형식을 입력해주세요.";
    }
    if (!formData.department) newErrors.department = "소속 팀/부서를 선택해주세요.";
    if (!formData.rank) newErrors.rank = "직급을 선택해주세요.";
    if (!formData.aiExperience) newErrors.aiExperience = "AI 도구 사용 경험을 선택해주세요.";
    if (!formData.learningGoal) newErrors.learningGoal = "배우고 싶은 것을 선택해주세요.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (name === "email") setDuplicateError(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDuplicateError(false);

    if (!validate()) return;

    const submittedEmails = getSubmittedEmails();
    if (submittedEmails.includes(formData.email.toLowerCase())) {
      setDuplicateError(true);
      return;
    }

    console.log("Workshop Registration:", formData);
    saveSubmittedEmail(formData.email);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-[#0f172a] mb-3">신청 완료!</h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            신청이 완료되었습니다! 🎉<br />당일 노트북 꼭 챙겨오세요.
          </p>
          <div className="mt-6 p-4 bg-orange-50 rounded-xl border border-orange-200">
            <p className="text-sm text-orange-700 font-medium">📅 2026년 4월 2일 오후 1시~5시</p>
            <p className="text-sm text-orange-700 font-medium">🏢 본사 대회의실</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f172a]">
      {/* Hero Section */}
      <section className="bg-[#0f172a] text-white py-16 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-block bg-[#ff6b35] text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-6 uppercase tracking-wider">
            내부 워크샵
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
            AI 바이브 코딩 마스터클래스
          </h1>
          <p className="text-xl md:text-2xl text-orange-400 font-medium">
            코딩 없이 AI로 업무 도구를 만드는 법
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="bg-[#0f172a] px-4 pb-12">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-gray-300 text-lg leading-relaxed">
            AI에게 말로 지시하면 앱이 만들어집니다. 코딩 경험이 전혀 없어도 괜찮아요.
            4시간이면 여러분만의 업무 도구를 직접 만들 수 있습니다.
          </p>
        </div>
      </section>

      {/* Event Info */}
      <section className="bg-[#1e293b] px-4 py-10">
        <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex items-start gap-4 bg-[#0f172a] rounded-xl p-5 border border-gray-700">
            <span className="text-3xl">📅</span>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">일시</p>
              <p className="text-white font-semibold">2026년 4월 2일</p>
              <p className="text-orange-400 text-sm">오후 1시~5시 (4시간)</p>
            </div>
          </div>
          <div className="flex items-start gap-4 bg-[#0f172a] rounded-xl p-5 border border-gray-700">
            <span className="text-3xl">🏢</span>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">장소</p>
              <p className="text-white font-semibold">본사 대회의실</p>
            </div>
          </div>
          <div className="flex items-start gap-4 bg-[#0f172a] rounded-xl p-5 border border-gray-700">
            <span className="text-3xl">👥</span>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">대상</p>
              <p className="text-white font-semibold">전 직원</p>
              <p className="text-gray-400 text-sm">개발/비개발 무관</p>
            </div>
          </div>
          <div className="flex items-start gap-4 bg-[#0f172a] rounded-xl p-5 border border-gray-700">
            <span className="text-3xl">💻</span>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">준비물</p>
              <p className="text-white font-semibold">개인 노트북</p>
              <p className="text-gray-400 text-sm">강사: AI커피챗 (외부 초청)</p>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section className="bg-[#0f172a] px-4 py-12">
        <div className="max-w-xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-[#0f172a] mb-2">워크샵 신청</h2>
            <p className="text-gray-500 text-sm mb-8">아래 정보를 입력하고 신청해주세요.</p>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* 이름 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  이름 <span className="text-[#ff6b35]">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="홍길동"
                  className={`w-full border rounded-lg px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent transition ${
                    errors.name ? "border-red-400 bg-red-50" : "border-gray-300"
                  }`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* 이메일 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  이메일 <span className="text-[#ff6b35]">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="hong@company.com"
                  className={`w-full border rounded-lg px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent transition ${
                    errors.email || duplicateError ? "border-red-400 bg-red-50" : "border-gray-300"
                  }`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                {duplicateError && (
                  <p className="text-red-500 text-xs mt-1">이미 신청된 이메일입니다.</p>
                )}
              </div>

              {/* 소속 팀/부서 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  소속 팀/부서 <span className="text-[#ff6b35]">*</span>
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent transition bg-white ${
                    errors.department ? "border-red-400 bg-red-50" : "border-gray-300"
                  }`}
                >
                  <option value="">선택해주세요</option>
                  <option value="프로덕트">프로덕트</option>
                  <option value="마케팅">마케팅</option>
                  <option value="세일즈">세일즈</option>
                  <option value="컨설팅">컨설팅</option>
                  <option value="개발">개발</option>
                  <option value="디자인">디자인</option>
                  <option value="경영지원">경영지원</option>
                  <option value="기타">기타</option>
                </select>
                {errors.department && (
                  <p className="text-red-500 text-xs mt-1">{errors.department}</p>
                )}
              </div>

              {/* 직급 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  직급 <span className="text-[#ff6b35]">*</span>
                </label>
                <select
                  name="rank"
                  value={formData.rank}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent transition bg-white ${
                    errors.rank ? "border-red-400 bg-red-50" : "border-gray-300"
                  }`}
                >
                  <option value="">선택해주세요</option>
                  <option value="사원">사원</option>
                  <option value="대리">대리</option>
                  <option value="과장">과장</option>
                  <option value="차장">차장</option>
                  <option value="부장">부장</option>
                  <option value="임원">임원</option>
                </select>
                {errors.rank && <p className="text-red-500 text-xs mt-1">{errors.rank}</p>}
              </div>

              {/* AI 도구 사용 경험 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  AI 도구 사용 경험 <span className="text-[#ff6b35]">*</span>
                </label>
                <select
                  name="aiExperience"
                  value={formData.aiExperience}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent transition bg-white ${
                    errors.aiExperience ? "border-red-400 bg-red-50" : "border-gray-300"
                  }`}
                >
                  <option value="">선택해주세요</option>
                  <option value="처음이에요">처음이에요</option>
                  <option value="ChatGPT 정도 써봤어요">ChatGPT 정도 써봤어요</option>
                  <option value="Claude도 써봤어요">Claude도 써봤어요</option>
                  <option value="Claude Code까지 써봤어요">Claude Code까지 써봤어요</option>
                </select>
                {errors.aiExperience && (
                  <p className="text-red-500 text-xs mt-1">{errors.aiExperience}</p>
                )}
              </div>

              {/* 강의에서 가장 배우고 싶은 것 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  강의에서 가장 배우고 싶은 것 <span className="text-[#ff6b35]">*</span>
                </label>
                <select
                  name="learningGoal"
                  value={formData.learningGoal}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent transition bg-white ${
                    errors.learningGoal ? "border-red-400 bg-red-50" : "border-gray-300"
                  }`}
                >
                  <option value="">선택해주세요</option>
                  <option value="업무 자동화">업무 자동화</option>
                  <option value="데이터 분석">데이터 분석</option>
                  <option value="웹서비스 만들기">웹서비스 만들기</option>
                  <option value="AI 도구 전반">AI 도구 전반</option>
                  <option value="기타">기타</option>
                </select>
                {errors.learningGoal && (
                  <p className="text-red-500 text-xs mt-1">{errors.learningGoal}</p>
                )}
              </div>

              {/* 식이 제한이나 알레르기 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  식이 제한이나 알레르기{" "}
                  <span className="text-gray-400 font-normal text-xs">(선택)</span>
                </label>
                <textarea
                  name="dietaryRestrictions"
                  value={formData.dietaryRestrictions}
                  onChange={handleChange}
                  placeholder="간식 준비 참고용"
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent transition resize-none"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full bg-[#ff6b35] hover:bg-orange-500 active:bg-orange-600 text-white font-bold py-3.5 rounded-xl text-base transition-colors duration-150 mt-2 shadow-lg"
              >
                신청하기
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0f172a] text-center py-8 border-t border-gray-800">
        <p className="text-gray-500 text-sm">Powered by Listeningmind ☕</p>
      </footer>
    </main>
  );
}
