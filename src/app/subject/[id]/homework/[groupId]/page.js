"use client";

import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Spinner from "@/app/components/Spinner";
import { FiArrowRight } from "react-icons/fi";

function getTokenFromCookies() {
  const cookieString = document.cookie;
  const cookies = cookieString.split("; ").reduce((acc, current) => {
    const [name, value] = current.split("=");
    acc[name] = value;
    return acc;
  }, {});
  return cookies.token || null;
}

export default function HomeworkGroupPage() {
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

    const fetchData = async () => {
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
        if (json.errorCode === 0) {
          const group = json.data.find((g) => g.id.toString() === groupId);
          setGroupData(group);
        }
      } catch (err) {
        console.error("Error fetching homework lectures:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, subjectTeacherId, groupId]);

  if (loading) return <Spinner />;
  if (!groupData)
    return <p className="text-center text-red-600 mt-10">لا توجد بيانات</p>;

  return (
    <div className="min-h-screen p-4 bg-gray-50" dir="rtl">
      {/* زر الرجوع */}
      <div className="flex justify-end mb-4 fixed top-4 right-4 sm:right-8 z-10">
        <button
          onClick={() => router.back()}
          className="text-[#bf9916] text-2xl hover:text-[#a77f14] transition"
          title="رجوع"
        >
          <FiArrowRight />
        </button>
      </div>

      <h1 className="text-2xl font-bold text-[#bf9916] mb-6">
        الواجبات - <span>{groupData.name}</span>
      </h1>

      <div className="flex flex-col gap-4">
        {groupData.homeWorks?.map((hw) => (
          <button
            key={hw.id}
            onClick={() =>
              router.push(
                `/subject/${subjectId}/homework/${groupId}/video/${hw.id}?subjectTeacherId=${subjectTeacherId}`
              )
            }
            className="bg-white shadow-md rounded p-6 text-[#bf9916] font-semibold text-lg text-right hover:bg-[#fdf8ee] transition"
          >
            {hw.name}
          </button>
        ))}
      </div>
    </div>
  );
}
