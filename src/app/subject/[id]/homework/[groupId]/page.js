"use client";

import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Spinner from "@/app/components/Spinner";
import NoItem from "@/app/NoItem";
import { useUser } from "@/app/context/UserContext";

function getTokenFromCookies() {
  const cookieString = document.cookie;
  const cookies = cookieString.split("; ").reduce((acc, current) => {
    const [name, value] = current.split("=");
    acc[name] = value;
    return acc;
  }, {});
  return cookies.token || null;
}

export default function HomeworkListPage() {
  const { id: subjectId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const subjectTeacherId = searchParams.get("subjectTeacherId");
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [homeworks, setHomeworks] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [selectedHomeworkId, setSelectedHomeworkId] = useState(null);
  const [paidMessage, setPaidMessage] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [feedbackColor, setFeedbackColor] = useState("");

  const { money, setMoney, subscribedGroups, addSubscribedGroup } = useUser();

  useEffect(() => {
    setToken(getTokenFromCookies());
  }, []);

  useEffect(() => {
    if (!token || !subjectTeacherId) return;

    async function fetchHomeworks() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `https://eng-mohamedkhalf.shop/api/HomeWorks/GetHomeWorkLectures/${subjectTeacherId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
              lang: "ar",
            },
          }
        );
        const json = await res.json();

        if (json.errorCode !== 0) {
          setError("لا توجد واجبات لهذا المدرس");
          setHomeworks([]);
        } else {
          setHomeworks(json.data || []);
        }
      } catch (e) {
        setError("حدث خطأ أثناء جلب الواجبات");
        setHomeworks([]);
      } finally {
        setLoading(false);
      }
    }

    fetchHomeworks();
  }, [token, subjectTeacherId]);

  const isSubscribed = subscribedGroups.includes(
    selectedHomeworkId?.toString()
  );

  const handleHomeworkClick = (hw) => {
    if (hw.price === 0 || isSubscribed) {
      router.push(
        `/subject/${subjectId}/homework/${subjectTeacherId}/video/${hw.id}?subjectTeacherId=${subjectTeacherId}`
      );
    } else {
      setSelectedHomeworkId(hw.id);
      setShowModal(true);
      setPaidMessage("");
    }
  };

  const handleSubscribe = () => {
    setPaidMessage("باستخدام المحفظة");
  };

  const handleConfirmPayment = async () => {
    if (!selectedHomeworkId) return;
    const hw = homeworks.find((h) => h.id === selectedHomeworkId);
    if (!hw) return;

    setPaidMessage("");
    setShowModal(false);

    if (money >= hw.price) {
      try {
        const res = await fetch(
          "https://eng-mohamedkhalf.shop/api/OnlineSubSubjects/PayOnlineSubSubjectLectures",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              lang: "ar",
              "Content-Type": "application/json-patch+json",
              accept: "text/plain",
            },
            body: JSON.stringify({
              onlineSubSubjectId: selectedHomeworkId,
            }),
          }
        );

        if (!res.ok) throw new Error("فشل في الدفع");

        const updatedBalance = money - hw.price;
        setMoney(updatedBalance);
        localStorage.setItem("money", updatedBalance);

        addSubscribedGroup(selectedHomeworkId.toString());

        setFeedbackMessage("تم فتح الواجب للطالب");
        setFeedbackColor("bg-green-600");

        setTimeout(() => {
          setFeedbackMessage(null);
          router.push(
            `/subject/${subjectId}/homework/${subjectTeacherId}/video/${selectedHomeworkId}?subjectTeacherId=${subjectTeacherId}`
          );
        }, 2000);
      } catch (e) {
        setFeedbackMessage("حدث خطأ أثناء الدفع");
        setFeedbackColor("bg-red-600");
        setTimeout(() => setFeedbackMessage(null), 2000);
      }
    } else {
      setFeedbackMessage("رصيد المحفظة غير كافى");
      setFeedbackColor("bg-red-600");
      setTimeout(() => setFeedbackMessage(null), 2000);
    }
  };

  return (
    <div className="min-h-screen p-4 bg-gray-50" dir="rtl" lang="ar">
      <button
        onClick={() => router.back()}
        className="text-[#bf9916] text-2xl mb-4"
        title="رجوع"
      >
        &#8594;
      </button>

      <h1 className="text-2xl font-bold mb-6 text-[#bf9916]">الواجبات</h1>

      {loading ? (
        <Spinner />
      ) : error ? (
        <p className="text-red-600 font-bold text-center">{error}</p>
      ) : homeworks.length === 0 ? (
        <NoItem text="لا توجد واجبات الآن" />
      ) : (
        <ul className="space-y-3">
          {homeworks.map((hw) => (
            <li
              key={hw.id}
              className="bg-white p-4 rounded shadow cursor-pointer "
              onClick={() => handleHomeworkClick(hw)}
            >
              <h3 className="text-[#bf9916] font-semibold text-lg mb-1">
                {hw.name || "بدون عنوان"}
              </h3>
              <div className="flex gap-2 mb-1">
                <span className="font-semibold text-[#bf9916]">الوصف:</span>
                <p className="text-[#bf9916]">
                  {hw.description || "لا يوجد وصف"}
                </p>
              </div>

              <p className="text-green-600 font-bold">
                السعر: {hw.price ?? 0} جنيه
              </p>
            </li>
          ))}
        </ul>
      )}

      {showModal && (
        <div
          className="fixed inset-0 bg-[rgba(0,0,0,0.4)] flex items-center justify-center z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">اشتراك</h2>
            <p>يجب الاشتراك في الواجب أولاً</p>
            <div className="flex justify-end gap-4 mt-6">
              <button onClick={handleSubscribe} className="text-purple-600">
                اشتراك
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="text-purple-600"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {paidMessage && (
        <div
          onClick={handleConfirmPayment}
          className="fixed bottom-0 left-0 right-0 bg-white text-[#bf9916] text-center py-4 shadow z-[999] cursor-pointer"
          style={{ userSelect: "none" }}
        >
          {paidMessage}
        </div>
      )}

      {feedbackMessage && (
        <div
          className={`fixed bottom-20 left-1/2 transform -translate-x-1/2 scale-90 animate-pulse text-white px-6 py-3 rounded-xl z-[1000] transition-all duration-500 ${feedbackColor}`}
        >
          {feedbackMessage}
        </div>
      )}
    </div>
  );
}
