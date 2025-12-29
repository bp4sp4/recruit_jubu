"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { ConsultationApplication } from "@/lib/types/database";

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ConsultationModal({
  isOpen,
  onClose,
}: ConsultationModalProps) {
  const [formData, setFormData] = useState<
    Omit<
      ConsultationApplication,
      "id" | "created_at" | "updated_at" | "region"
    > & { region: "서울" | "경기인천" | "그 외지역" | "" }
  >({
    name: "",
    contact: "",
    checkbox_selection: [],
    region: "" as "",
    privacy_consent: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [contactError, setContactError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPrivacyDetail, setShowPrivacyDetail] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      // 모달 닫을 때 폼 초기화
      setFormData({
        name: "",
        contact: "",
        checkbox_selection: [],
        region: "",
        privacy_consent: false,
      });
      setError("");
      setContactError("");
      setSuccess(false);
      setShowPrivacyDetail(false);
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const formatPhoneNumber = (value: string) => {
    // 숫자만 추출
    const numbers = value.replace(/[^\d]/g, "");

    // 길이에 따라 포맷팅
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(
        7,
        11
      )}`;
    }
  };

  const validatePhoneNumber = (phone: string): boolean => {
    // 010-XXXX-XXXX 형식인지 확인
    const phoneRegex = /^010-\d{4}-\d{4}$/;
    return phoneRegex.test(phone);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, contact: formatted });

    // 실시간 유효성 검사
    if (formatted.length > 0 && formatted.length === 13) {
      if (!validatePhoneNumber(formatted)) {
        setContactError("올바른 전화번호 형식이 아니에요");
      } else {
        setContactError("");
      }
    } else if (formatted.length === 0) {
      setContactError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 필수 필드 검증
      if (!formData.name.trim()) {
        throw new Error("이름을 입력해주세요.");
      }
      if (!formData.contact.trim()) {
        throw new Error("연락처를 입력해주세요.");
      }
      if (!validatePhoneNumber(formData.contact)) {
        throw new Error("올바른 전화번호 형식이 아니에요");
      }
      if (!formData.region) {
        throw new Error("지역을 선택해주세요.");
      }
      if (!formData.privacy_consent) {
        throw new Error("개인정보 수집 및 이용 동의는 필수입니다.");
      }

      const { error: insertError } = await supabase
        .from("consultation_applications")
        .insert([
          {
            ...formData,
            region: formData.region as "서울" | "경기인천" | "그 외지역",
          },
        ]);

      if (insertError) throw insertError;

      // Slack 알림 전송 (실패해도 사용자에게는 성공으로 표시)
      try {
        await fetch("/api/slack/notify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            contact: formData.contact,
            region: formData.region,
            source: undefined,
            utm_source: undefined,
            referrer_url: undefined,
          }),
        });
      } catch (slackError) {
        // Slack 알림 실패는 로그만 남기고 사용자에게는 에러를 표시하지 않음
        console.error("Slack 알림 전송 실패:", slackError);
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "신청에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const regionOptions: ("서울" | "경기인천" | "그 외지역")[] = [
    "서울",
    "경기인천",
    "그 외지역",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-[720px] max-w-[90vw] max-h-[90vh] overflow-y-auto mx-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
        {/* 헤더 */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm  px-8 py-6 flex justify-between items-center rounded-t-3xl">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">
            면접 지원하기
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-50/80 border border-red-100 rounded-2xl text-red-600 text-xs md:text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-blue-50/80 border border-blue-100 rounded-2xl text-blue-600 text-xs md:text-sm">
              신청이 완료되었습니다!
            </div>
          )}

          {/* 이름 */}
          <div>
            <label
              htmlFor="name"
              className="block text-xs md:text-sm font-medium text-gray-900 mb-3"
            >
              이름 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg placeholder-gray-400 focus:outline-none transition-all duration-200"
                style={{
                  height: "48px",
                  fontSize: "15px",
                  color: "#333d4b",
                  boxShadow: "none",
                }}
                onFocus={(e) => {
                  e.target.style.boxShadow = "inset 0 0 0 2px #3182f6";
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = "none";
                  e.target.style.borderColor = "#e5e7eb";
                }}
                placeholder="이름을 입력하세요"
              />
            </div>
          </div>

          {/* 연락처 */}
          <div>
            <label
              htmlFor="contact"
              className="block text-xs md:text-sm font-medium text-gray-900 mb-3"
            >
              연락처 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="contact"
                type="tel"
                value={formData.contact}
                onChange={handlePhoneChange}
                required
                maxLength={13}
                className={`w-full px-4 py-3 bg-white border rounded-lg placeholder-gray-400 focus:outline-none transition-all duration-200 ${
                  contactError ? "border-red-500" : "border-gray-200"
                }`}
                style={{
                  height: "48px",
                  fontSize: "15px",
                  color: "#333d4b",
                  boxShadow: "none",
                }}
                onFocus={(e) => {
                  if (contactError) {
                    e.target.style.boxShadow = "inset 0 0 0 2px #ef4444";
                    e.target.style.borderColor = "#ef4444";
                  } else {
                    e.target.style.boxShadow = "inset 0 0 0 2px #3182f6";
                  }
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = "none";
                  if (contactError) {
                    e.target.style.borderColor = "#ef4444";
                  } else {
                    e.target.style.borderColor = "#e5e7eb";
                  }
                }}
                placeholder="01012345678"
              />
            </div>
            {contactError && (
              <p className="mt-2 text-sm text-red-500">{contactError}</p>
            )}
          </div>

          {/* 지역 */}
          <div className="mb-2">
            <label className="block text-xs md:text-sm font-medium text-gray-900 mb-2">
              지역 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3">
              {regionOptions.map((region) => (
                <label
                  key={region}
                  className="flex items-center py-3 cursor-pointer"
                >
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      value={region}
                      checked={formData.region === region}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            region: region as typeof formData.region,
                          });
                        }
                      }}
                      className="w-5 h-5 appearance-none bg-white border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer checked:bg-blue-500 checked:border-blue-500 transition-colors duration-200"
                    />
                    {formData.region === region && (
                      <svg
                        className="absolute w-4 h-4 pointer-events-none text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <span
                    className={`ml-3 text-sm md:text-base font-medium ${
                      formData.region === region
                        ? "text-blue-600"
                        : "text-gray-700"
                    }`}
                  >
                    {region}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* 개인정보 수집 및 이용 동의 */}
          <div>
            <label className="flex items-center py-3 rounded-lg cursor-pointer">
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={formData.privacy_consent}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      privacy_consent: e.target.checked,
                    })
                  }
                  required
                  className="w-5 h-5 appearance-none bg-white border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer checked:bg-blue-500 checked:border-blue-500 transition-colors duration-200"
                />
                {formData.privacy_consent && (
                  <svg
                    className="absolute w-4 h-4 pointer-events-none text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              <div className="flex-1 ml-3">
                <span className="text-sm md:text-base font-medium text-gray-700">
                  개인정보 수집 및 이용 동의{" "}
                  <span className="text-red-500">*</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowPrivacyDetail(true)}
                  className="ml-2 text-sm md:text-base text-blue-500 hover:text-blue-600 font-medium transition-colors"
                >
                  자세히 보기
                </button>
              </div>
            </label>
          </div>

          {/* 제출 버튼 */}

          <button
            type="submit"
            disabled={
              loading ||
              success ||
              !formData.name.trim() ||
              !formData.contact.trim() ||
              !formData.region ||
              !formData.privacy_consent ||
              !!contactError
            }
            className="w-full py-3 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-sm md:text-base text-white font-semibold rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            {loading ? "신청 중..." : success ? "지원 완료!" : "신청하기"}
          </button>
        </form>
      </div>

      {/* 지원 완료 팝업 */}
      {success && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-[400px] max-w-[90vw] mx-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
            <div className="p-8 flex flex-col items-center space-y-6">
              <img
                src="/check.gif"
                alt="완료"
                className="w-24 h-auto object-cover"
              />
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-gray-900">
                  지원이 완료되었습니다
                </h3>
                <p className="text-sm text-gray-600">
                  담당자가 빠른시일내에 연락 드리겠습니다
                </p>
              </div>
              <button
                onClick={() => {
                  setSuccess(false);
                  onClose();
                }}
                className="w-full py-3 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-sm md:text-base text-white font-semibold rounded-2xl transition-all duration-200 shadow-sm hover:shadow-md"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 개인정보 수집 및 이용 동의 상세 팝업 */}
      {showPrivacyDetail && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-[600px] max-w-[90vw] max-h-[80vh] overflow-y-auto mx-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-8 py-6 flex justify-between items-center rounded-t-3xl">
              <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                개인정보 수집 및 이용 동의
              </h3>
              <button
                onClick={() => setShowPrivacyDetail(false)}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-8 space-y-5 text-xs md:text-sm text-gray-700">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">수집 항목</h4>
                <p className="text-gray-600">이름, 연락처, 지역</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">이용 목적</h4>
                <p className="text-gray-600">면접 일정 조율 및 관리</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  보유 및 이용 기간
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  신청일로부터 1년 또는 관련 법령(전자상거래 등에서의 소비자
                  보호에 관한 법률 등)에 따라 보관될 수 있으며, 보유 기간 경과
                  시 즉시 파기합니다.
                </p>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <p className="text-red-500 font-medium">
                  동의 거부 시 면접 일정 조율이 어려울 수 있습니다.
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => setShowPrivacyDetail(false)}
                  className="w-full py-4 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-sm md:text-base text-white font-semibold rounded-2xl transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
