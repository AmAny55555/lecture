"use client";

import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { FaVideo, FaQrcode, FaBook, FaPen } from "react-icons/fa";
import NoItem from "@/app/NoItem";
import Spinner from "@/app/components/Spinner";

const tabs = [
  {
    key: "online",
    label: "محاضرات أونلاين",
    icon: <FaVideo />,
    route: "lecture",
  },
  {
    key: "qr",
    label: "محاضرات QR",
    icon: <FaQrcode />,
    route: "qrlecture", // مهم جداً يكون كده
  },
  {
    key: "homework",
    label: "الواجبات",
    icon: <FaPen />,
    route: "homework",
  },
  {
    key: "books",
    label: "الكتب",
    icon: <FaBook />,
  },
];

function getTokenFromCookies() {
  const cookieString = document.cookie;
  const cookies = cookieString.split("; ").reduce((acc, current) => {
    const [name, value] = current.split("=");
    acc[name] = value;
    return acc;
  }, {});
  return cookies.token || null;
}

export default function DetailsPage() {
  const { id: subjectId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const subjectTeacherId = searchParams.get("subjectTeacherId");
  const [activeTab, setActiveTab] = useState("online");
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);

  useEffect(() => {
    setToken(getTokenFromCookies());
  }, []);

  useEffect(() => {
    if (!token || !subjectTeacherId) return;

    async function fetchData(url) {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            lang: "ar",
          },
        });
        const json = await res.json();
        if (json.errorCode !== 0) {
          setData([]);
        } else {
          setData(json.data || []);
        }
      } catch (e) {
        console.error(e);
        setError("خطأ أثناء جلب البيانات");
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    if (activeTab === "online") {
      fetchData(
        `https://eng-mohamedkhalf.shop/api/OnlineSubSubjects/GetOnlineSubSubjects/${subjectTeacherId}`
      );
    } else if (activeTab === "qr") {
      fetchData(
        `https://eng-mohamedkhalf.shop/api/QrSubSubjects/GetQrSubSubjects/${subjectTeacherId}`
      );
    } else if (activeTab === "homework") {
      fetchData(
        `https://eng-mohamedkhalf.shop/api/HomeWorks/GetHomeWorkLectures/${subjectTeacherId}`
      );
    } else if (activeTab === "books") {
      fetchData(
        `https://eng-mohamedkhalf.shop/api/Books/GetBooksTeacher/${subjectTeacherId}`
      );
    } else {
      setData([]);
    }
  }, [activeTab, subjectTeacherId, token]);

  return (
    <div className="flex flex-col min-h-screen" dir="rtl">
      <div className="bg-[#bf9916] p-4 rounded-b-3xl shadow-md">
        <button onClick={() => router.back()} className="text-white text-2xl">
          &#8592;
        </button>
        <h1 className="text-3xl text-white font-bold mt-2 mb-4">الرياضيات</h1>

        <div className="grid grid-cols-2 gap-8 place-items-center mt-4 w-[90%] mx-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex flex-col items-center rounded w-[80px] h-[80px] text-xs justify-center ${
                activeTab === tab.key
                  ? "bg-blue-600 text-white"
                  : "bg-blue-500 text-white"
              }`}
            >
              <div className="text-xl mb-1">{tab.icon}</div>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 p-4 bg-gray-50 overflow-visible">
        {loading ? (
          <Spinner />
        ) : (
          <>
            {data.length === 0 ? (
              <NoItem
                text="لا يوجد عناصر"
                className="bg-transparent shadow-none"
              />
            ) : (
              <GroupGrid
                data={data}
                type={activeTab}
                routePrefix={tabs.find((t) => t.key === activeTab)?.route || ""}
                subjectId={subjectId}
                subjectTeacherId={subjectTeacherId}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function GroupGrid({ data, type, routePrefix, subjectId, subjectTeacherId }) {
  const router = useRouter();

  if (!data || data.length === 0) return null; // NoItem يظهر في الأب

  return (
    <div className="grid grid-cols-2 gap-4 overflow-visible">
      {data.map((item) => (
        <div
          key={item.id}
          onClick={() =>
            router.push(
              type === "books"
                ? `/subject/${subjectId}/books/${item.id}?subjectTeacherId=${subjectTeacherId}`
                : `/subject/${subjectId}/${routePrefix}/${item.id}?subjectTeacherId=${subjectTeacherId}`
            )
          }
          className="cursor-pointer rounded bg-white p-3 shadow-sm"
        >
          <h3 className="text-sm font-semibold text-[#bf9916] mb-1">
            {item.name || item.title || "بدون عنوان"}
          </h3>

          {type === "online" && (
            <p className="text-sm text-[#bf9916] mb-1">
              عدد المحاضرات: {item.onlineLectures?.length ?? 0}
            </p>
          )}

          {type === "qr" && (
            <p className="text-sm text-[#bf9916] mb-1">
              عدد المحاضرات: {item.qrLectures?.length ?? 0}
            </p>
          )}

          {type === "homework" && (
            <p className="text-sm text-[#bf9916] mb-1">
              الوصف: {item.description || "لا يوجد وصف"}
            </p>
          )}

          {type === "books" && (
            <p className="text-sm text-[#bf9916] mb-1">
              السعر: {item.price ?? 0} جنيه
            </p>
          )}

          <p className="font-bold text-sm">
            <span className="text-[#bf9916]">السعر: </span>
            <span className="text-orange-500">{item.price ?? 0}</span> جنيه
          </p>
        </div>
      ))}
    </div>
  );
}
