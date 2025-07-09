"use client";

import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { FaVideo, FaQrcode, FaBook, FaPen } from "react-icons/fa";
import NoItem from "@/app/NoItem";
import Spinner from "@/app/components/Spinner";
import { motion, AnimatePresence } from "framer-motion";

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
    route: "qrLecture",
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
  const [showMsg, setShowMsg] = useState(false);
  const [msgText, setMsgText] = useState("");

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

  const handleNoLecturesClick = () => {
    setMsgText(
      activeTab === "online"
        ? "لا توجد محاضرات الآن"
        : activeTab === "qr"
        ? "لا توجد محاضرات QR الآن"
        : activeTab === "homework"
        ? "لا توجد واجبات الآن"
        : activeTab === "books"
        ? "لا توجد كتب لهذا المدرس"
        : "لا يوجد عناصر"
    );
    setShowMsg(true);

    setTimeout(() => {
      setShowMsg(false);
    }, 2500);
  };

  return (
    <div className="flex flex-col min-h-screen" dir="rtl">
      <div className="bg-[#bf9916] p-4 rounded-b-3xl shadow-md relative">
        <button
          onClick={() => router.back()}
          className="text-white text-2xl absolute right-4 top-4"
          title="رجوع"
        >
          &#8594;
        </button>
        <h1 className="text-3xl text-white font-bold mt-8 mb-4">الرياضيات</h1>

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

      <div className="flex-1 p-4 overflow-visible relative">
        {loading ? (
          <Spinner />
        ) : error ? (
          <p className="text-center text-red-600 font-bold">{error}</p>
        ) : data.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="text-center text-[#bf9916] font-bold text-xl mt-20"
          >
            {activeTab === "online"
              ? "لا توجد محاضرات الآن"
              : activeTab === "qr"
              ? "لا توجد محاضرات QR الآن"
              : activeTab === "homework"
              ? "لا توجد واجبات الآن"
              : activeTab === "books"
              ? "لا توجد كتب لهذا المدرس"
              : "لا يوجد عناصر"}
          </motion.div>
        ) : (
          <GroupGrid
            data={data}
            type={activeTab}
            routePrefix={tabs.find((t) => t.key === activeTab)?.route || ""}
            subjectId={subjectId}
            subjectTeacherId={subjectTeacherId}
            onNoLecturesClick={handleNoLecturesClick}
          />
        )}

        <AnimatePresence>
          {showMsg && (
            <motion.div
              key="msg"
              initial={{ opacity: 0, scale: 0.6, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.6, y: 20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-red-600 text-white py-3 px-6 rounded-lg shadow-lg font-bold z-50 select-none"
            >
              {msgText}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function GroupGrid({
  data,
  type,
  routePrefix,
  subjectId,
  subjectTeacherId,
  onNoLecturesClick,
}) {
  const router = useRouter();

  if (!data || data.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-4 overflow-visible">
      {data.map((item) => {
        const hasLectures =
          (type === "online" && item.onlineLectures?.length > 0) ||
          (type === "qr" && item.qrLectures?.length > 0) ||
          (type === "homework" && item.id != null) ||
          type === "books";

        const handleClick = () => {
          if (!hasLectures) {
            onNoLecturesClick();
            return;
          }
          if (type === "books") {
            router.push(
              `/subject/${subjectId}/books/${item.id}?subjectTeacherId=${subjectTeacherId}`
            );
          } else {
            router.push(
              `/subject/${subjectId}/${routePrefix}/${item.id}?subjectTeacherId=${subjectTeacherId}`
            );
          }
        };

        return (
          <div
            key={item.id}
            onClick={handleClick}
            className={`cursor-pointer ${
              type === "books"
                ? "bg-gray-100 w-60 rounded-xl shadow-md p-0"
                : "bg-white p-3 rounded shadow-sm"
            }`}
          >
            {type === "books" ? (
              <div className="space-y-2">
                {item.photos?.[0] ? (
                  <img
                    src={`https://eng-mohamedkhalf.shop${item.photos[0].replace(
                      /\\/g,
                      "/"
                    )}`}
                    alt={item.name}
                    className="w-full h-40 object-cover rounded-xl "
                  />
                ) : (
                  <div className="w-full h-40 rounded mb-2" />
                )}

                <h3 className="text-lg font-bold text-black">{item.name}</h3>

                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="text-[#bf9916] text-base">👤</span>
                  <span>{item.fullName || "غير معروف"}</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="text-[#bf9916] text-base">📅</span>
                  <span>
                    {new Date(item.createdAt).toLocaleDateString("ar-EG", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div className="flex justify-end px-1 gap-1 text-yellow-400 text-lg">
                  {Array.from({ length: 5 }, (_, i) => (
                    <span key={i}>{i < item.evaluation ? "★" : "☆"}</span>
                  ))}
                </div>

                <p className="text-sm font-bold mb-5">
                  {item.price === 0 ? (
                    <span className="text-gray-600 text-lg p-5">مجاني</span>
                  ) : (
                    <span className="text-gray-600">{item.price} جنيه</span>
                  )}
                </p>
              </div>
            ) : (
              <>
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

                <p className="font-bold text-sm flex justify-between">
                  <span className="text-[#bf9916]">السعر: </span>
                  <span className="text-green-600">
                    {type === "qr"
                      ? item.qrLectures?.[0]?.price === 0
                        ? "مجاني"
                        : `${item.qrLectures?.[0]?.price} جنيه`
                      : item.price === 0
                      ? "مجاني"
                      : `${item.price} جنيه`}
                  </span>
                </p>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
