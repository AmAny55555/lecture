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

  useEffect(() => {
    setToken(getTokenFromCookies());
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

  const handleSubscribe = async () => {
    if (!token || !selectedLectureId) return;
    setSubscribing(true);
    setMessage("");
    try {
      const res = await fetch(
        `https://eng-mohamedkhalf.shop/api/OnlineLectures/SubscribeToLecture/${selectedLectureId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            lang: "ar",
          },
        }
      );
      const json = await res.json();
      if (json.errorCode === 0) {
        setMessage("تم فتح المحاضرة");
        setTimeout(() => {
          setShowModal(false);
          router.push(
            `/subject/${subjectId}/lecture/${groupId}/video/${selectedLectureId}?subjectTeacherId=${subjectTeacherId}`
          );
        }, 1000);
      } else {
        setMessage("الرصيد غير كاف");
      }
    } catch (err) {
      setMessage("حدث خطأ");
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) return <Spinner />;
  if (!groupData)
    return <p className="text-center text-red-600 mt-10">لا توجد بيانات</p>;

  return (
    <div className="min-h-screen p-4 bg-gray-50 relative" dir="rtl">
      {/* سهم الرجوع */}
      <button
        onClick={() => router.back()}
        className="text-[#bf9916] text-3xl mb-4"
      >
        &#8594;
      </button>

      {/* عنوان الصفحة */}
      <h1 className="text-2xl font-bold text-[#bf9916] mb-6">
        محاضرات - <span className="text-[#bf9916]">{groupData.name}</span>
      </h1>

      {/* عرض روابط الفيديو */}
      <div className="flex flex-col gap-4">
        {groupData.onlineLectures?.map((lecture) => (
          <button
            key={lecture.id}
            onClick={() => {
              setSelectedLectureId(lecture.id);
              setShowModal(true);
              setMessage("");
            }}
            className="bg-white shadow-md rounded p-10 text-[#bf9916] font-semibold text-xl text-right"
          >
            {lecture.name}
          </button>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-[rgba(0,0,0,0.4)] flex items-center justify-center z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white p-6 rounded-lg w-11/12 max-w-md text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-2 text-[#bf9916]">اشتراك</h2>
            <p className="mb-4">يجب الاشتراك في المحاضرة أولاً</p>
            <button
              onClick={handleSubscribe}
              disabled={subscribing}
              className="bg-[#bf9916] text-white px-4 py-2 rounded mb-2 w-full"
            >
              باستخدام المحفظة
            </button>
            {message && <p className="text-sm text-gray-700 mt-2">{message}</p>}
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 text-red-500 underline"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
