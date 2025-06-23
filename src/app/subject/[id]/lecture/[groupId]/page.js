"use client";

import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Spinner from "@/app/components/Spinner";

function getTokenFromCookies() {
  const cookieString = document.cookie;
  const cookies = cookieString.split("; ").reduce((acc, current) => {
    const [name, value] = current.split("=");
    acc[name] = value;
    return acc;
  }, {});
  return cookies.token || null;
}

export default function LectureGroupPage() {
  const { id: subjectId, groupId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const subjectTeacherId = searchParams.get("subjectTeacherId");

  const [token, setToken] = useState(null);
  const [groupData, setGroupData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedLectureId, setSelectedLectureId] = useState(null);
  const [subscribing, setSubscribing] = useState(false);
  const [message, setMessage] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);
  const [subscribedGroups, setSubscribedGroups] = useState([]);
  const [paidMessage, setPaidMessage] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [feedbackColor, setFeedbackColor] = useState("");

  useEffect(() => {
    setToken(getTokenFromCookies());
    const localBalance = parseFloat(
      localStorage.getItem("wallet_balance") || "0"
    );
    setWalletBalance(localBalance);

    const groups = JSON.parse(
      localStorage.getItem("subscribed_groups") || "[]"
    );
    setSubscribedGroups(groups);
  }, []);

  useEffect(() => {
    if (!token || !subjectTeacherId || !groupId) return;

    const fetchData = async () => {
      try {
        const res = await fetch(
          `https://eng-mohamedkhalf.shop/api/OnlineSubSubjects/GetOnlineSubSubjects/${subjectTeacherId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
              lang: "ar",
            },
          }
        );
        const json = await res.json();
        if (json.errorCode === 0) {
          const group = json.data.find((g) => g.id.toString() === groupId);
          setGroupData(group);
        }
      } catch (err) {
        console.error("Error fetching lectures:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, subjectTeacherId, groupId]);

  const isGroupSubscribed = subscribedGroups.includes(groupId?.toString());

  const handleLectureClick = (lectureId) => {
    if (isGroupSubscribed) {
      router.push(
        `/subject/${subjectId}/lecture/${groupId}/video/${lectureId}?subjectTeacherId=${subjectTeacherId}`
      );
    } else {
      setSelectedLectureId(lectureId);
      setShowModal(true);
      setMessage("");
    }
  };

  const handleSubscribeGroup = () => {
    setPaidMessage("باستخدام المحفظة");
    // المودال يظل ظاهر والخلفية موجودة
  };

  const handleConfirmPayment = () => {
    const price = groupData?.price || 0;
    setPaidMessage(""); // إخفاء الرسالة
    setShowModal(false); // إخفاء المودال

    if (walletBalance >= price) {
      const newBalance = walletBalance - price;
      localStorage.setItem("wallet_balance", newBalance.toFixed(2));
      setWalletBalance(newBalance);

      const updatedGroups = [...subscribedGroups, groupId.toString()];
      localStorage.setItem("subscribed_groups", JSON.stringify(updatedGroups));
      setSubscribedGroups(updatedGroups);

      setFeedbackMessage("تم فتح المحاضرة للطالب");
      setFeedbackColor("bg-green-600");

      setTimeout(() => {
        setFeedbackMessage(null);
        router.push(
          `/subject/${subjectId}/lecture/${groupId}/video/${selectedLectureId}?subjectTeacherId=${subjectTeacherId}`
        );
      }, 2000);
    } else {
      setFeedbackMessage("الرصيد غير كافى");
      setFeedbackColor("bg-red-600");

      setTimeout(() => {
        setFeedbackMessage(null);
      }, 2000);
    }
  };

  if (loading) return <Spinner />;
  if (!groupData)
    return <p className="text-center text-red-600 mt-10">لا توجد بيانات</p>;

  return (
    <div className="min-h-screen p-4 bg-gray-50 relative" dir="rtl">
      <button
        onClick={() => router.back()}
        className="text-[#bf9916] text-3xl mb-4"
      >
        &#8594;
      </button>

      <h1 className="text-2xl font-bold text-[#bf9916] mb-6">
        محاضرات - <span className="text-[#bf9916]">{groupData.name}</span>
      </h1>

      <div className="flex flex-col gap-4">
        {groupData.onlineLectures?.map((lecture) => (
          <button
            key={lecture.id}
            onClick={() => handleLectureClick(lecture.id)}
            className="bg-white shadow-md rounded p-10 text-[#bf9916] font-semibold text-xl text-right"
          >
            {lecture.name}
          </button>
        ))}
      </div>

      {showModal && (
        <div
          className="fixed inset-0 bg-[rgba(0,0,0,0.4)] flex items-center justify-center z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white p-6 rounded-4xl w-11/12 max-w-sm text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-right">
              <h2 className="text-xl font-bold mb-3">اشتراك</h2>
              <p className="mb-4">يجب الاشتراك في المحاضرة أولاً</p>
            </div>
            <div className="flex items-center justify-end gap-4 mt-4">
              <button
                onClick={handleSubscribeGroup}
                disabled={subscribing}
                className="text-purple-600 px-4 py-2"
              >
                اشتراك
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="text-purple-600"
              >
                إلغاء
              </button>
              {message && (
                <p className="text-sm text-gray-700 ml-4">{message}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ✅ رسالة "باستخدام المحفظة" */}
      {paidMessage && (
        <div
          onClick={handleConfirmPayment}
          className="cursor-pointer fixed bottom-0 left-0 right-0 bg-white text-[#bf9916] text-center py-4 shadow z-[999]"
        >
          {paidMessage}
        </div>
      )}

      {/* ✅ رسالة النتيجة المتحركة */}
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
