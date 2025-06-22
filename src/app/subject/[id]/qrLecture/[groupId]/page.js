"use client";

import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Spinner from "@/app/components/Spinner";
import Link from "next/link";

function getTokenFromCookies() {
  const cookieString = document.cookie;
  const cookies = cookieString.split("; ").reduce((acc, current) => {
    const [name, value] = current.split("=");
    acc[name] = value;
    return acc;
  }, {});
  return cookies.token || null;
}

export default function QrLectureGroupPage() {
  const { id: subjectId, groupId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const subjectTeacherId = searchParams.get("subjectTeacherId");

  const [token, setToken] = useState(null);
  const [groupData, setGroupData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setToken(getTokenFromCookies());
  }, []);

  useEffect(() => {
    if (!token || !subjectTeacherId || !groupId) return;

    const fetchGroupData = async () => {
      try {
        const res = await fetch(
          `https://eng-mohamedkhalf.shop/api/QrSubSubjects/GetQrSubSubjects/${subjectTeacherId}`,
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
          setGroupData(group || null);
        }
      } catch (error) {
        console.error("خطأ في جلب بيانات مجموعة QR:", error);
        setGroupData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchGroupData();
  }, [token, subjectTeacherId, groupId]);

  if (loading) return <Spinner />;

  if (!groupData)
    return (
      <p className="text-center text-red-600 mt-10">لا توجد بيانات للمجموعة</p>
    );

  return (
    <div className="min-h-screen p-4 bg-gray-50" dir="rtl">
      <button
        onClick={() => router.back()}
        className="text-[#bf9916] text-3xl mb-4"
        title="رجوع"
      >
        &#8592;
      </button>

      <h1 className="text-2xl font-bold text-[#bf9916] mb-6">
        محاضرات QR - <span>{groupData.name}</span>
      </h1>

      <div className="flex flex-col gap-4">
        {groupData.qrLectures?.map((lecture) => (
          <Link
            key={lecture.id}
            href={`/subject/${subjectId}/qrlecture/${groupId}/video/${lecture.id}?subjectTeacherId=${subjectTeacherId}`}
            className="bg-white shadow-md rounded p-6 text-[#bf9916] font-semibold text-lg block"
          >
            {lecture.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
