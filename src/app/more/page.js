"use client";

import React, { useState, useEffect } from "react";
import BottomNav from "../(Main)/BottomNav";

const ProfileButton = ({ text, icon, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center cursor-pointer justify-between w-[95%] mx-auto px-4 py-3 rounded-xl text-xl bg-gray-100 hover:bg-gray-200 focus:outline-none"
  >
    <i className="fa-solid fa-chevron-left text-[#bf9916] text-sm"></i>
    <span className="flex flex-row-reverse items-center gap-x-4 text-[#bf9916]">
      {icon &&
        React.cloneElement(icon, {
          className: (icon.props.className || "") + " text-[#bf9916] w-6 h-6",
        })}
      <span>{text}</span>
    </span>
  </button>
);

export default function Page() {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [complaintModal, setComplaintModal] = useState(false);
  const [complaintText, setComplaintText] = useState("");
  const [complaintSuccess, setComplaintSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // دالة لجلب التوكين من الكوكيز
  const getToken = () => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; token=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  };

  const buttonsData = [
    { text: "الملف الشخصي", icon: <i className="fa-solid fa-user"></i> },
    { text: "الاشعارات", icon: <i className="fa-solid fa-bell"></i> },
    {
      text: "نتائج الاختبارات",
      icon: (
        <svg width="24" height="24" viewBox="0 0 64 64">
          <path
            d="M48 2H16C13.8 2 12 3.8 12 6v52c0 2.2 1.8 4 4 4h32c2.2 0 4-1.8 4-4V10L48 2z"
            fill="none"
            stroke="#bf9916"
            strokeWidth="2.5"
          />
          <polyline
            points="48,2 48,14 60,14"
            fill="none"
            stroke="#bf9916"
            strokeWidth="2.5"
          />
          <line
            x1="24"
            y1="20"
            x2="24"
            y2="44"
            stroke="#bf9916"
            strokeWidth="2"
          />
          <line
            x1="32"
            y1="20"
            x2="32"
            y2="44"
            stroke="#bf9916"
            strokeWidth="2"
          />
          <line
            x1="40"
            y1="20"
            x2="40"
            y2="44"
            stroke="#bf9916"
            strokeWidth="2"
          />
        </svg>
      ),
    },
    { text: "المحفظة", icon: <i className="fa-solid fa-credit-card"></i> },
    {
      text: "الشكاوى والاقتراحات",
      icon: <i className="fa-solid fa-circle-exclamation"></i>,
    },
    { text: "تواصل معنا", icon: <i className="fa-solid fa-phone"></i> },
    {
      text: "الطلبات",
      icon: (
        <svg width="24" height="24" viewBox="0 0 100 100">
          <polygon
            points="50,10 35,35 65,35"
            fill="none"
            stroke="#bf9916"
            strokeWidth="4"
          />
          <rect
            x="10"
            y="55"
            width="30"
            height="30"
            fill="none"
            stroke="#bf9916"
            strokeWidth="4"
          />
          <circle
            cx="80"
            cy="70"
            r="15"
            fill="none"
            stroke="#bf9916"
            strokeWidth="4"
          />
        </svg>
      ),
    },
    {
      text: "تسجيل الخروج",
      icon: <i className="fa-solid fa-right-from-bracket"></i>,
    },
    {
      text: "حذف الحساب",
      icon: <i className="fa-solid fa-user-slash"></i>,
    },
  ];

  const clearTokenCookie = () => {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        console.warn("لا يوجد توكن في الكوكيز، لا يمكن تسجيل الخروج");
        setLoading(false);
        return;
      }

      const res = await fetch(
        "https://eng-mohamedkhalf.shop/api/Users/logout",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        localStorage.clear();
        clearTokenCookie();
        window.location.href = "/rejester";
      } else {
        console.error("فشل تسجيل الخروج");
      }
    } catch (error) {
      console.error("حدث خطأ أثناء تسجيل الخروج:", error);
    }
    setLoading(false);
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        console.warn("لا يوجد توكن في الكوكيز، لا يمكن حذف الحساب");
        setLoading(false);
        return;
      }

      const userInfoRes = await fetch(
        "https://eng-mohamedkhalf.shop/api/Users/GetUserInfo",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!userInfoRes.ok) {
        console.error("فشل جلب بيانات المستخدم");
        setLoading(false);
        return;
      }

      const userInfo = await userInfoRes.json();

      const phoneNumber =
        userInfo.data?.phoneNumber ||
        userInfo.data?.phone ||
        userInfo.data?.Phone ||
        null;

      if (!phoneNumber) {
        console.error("رقم الهاتف غير موجود في بيانات المستخدم");
        setLoading(false);
        return;
      }

      const res = await fetch(
        "https://eng-mohamedkhalf.shop/api/Users/Forcelogout",
        {
          method: "PUT",
          headers: {
            accept: "text/plain",
            "Content-Type": "application/json-patch+json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ phoneNumber }),
        }
      );

      if (res.ok) {
        localStorage.clear();
        clearTokenCookie();
        setShowModal(false);
        setComplaintSuccess(true);
        setTimeout(() => {
          setComplaintSuccess(false);
          window.location.href = "/rejester";
        }, 4000);
      } else {
        console.error("فشل حذف الحساب");
      }
    } catch (err) {
      console.error("خطأ أثناء حذف الحساب:", err);
    }
    setLoading(false);
  };

  const handleComplaintSubmit = async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        console.warn("لا يوجد توكن في الكوكيز، لا يمكن إرسال الشكوى");
        setLoading(false);
        return;
      }

      const res = await fetch(
        "https://eng-mohamedkhalf.shop/api/Complaints/AddComplaint",
        {
          method: "POST",
          headers: {
            accept: "*/*",
            "Content-Type": "application/json-patch+json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ data: complaintText }),
        }
      );

      if (res.ok) {
        setComplaintModal(false);
        setComplaintSuccess(true);
        setComplaintText("");
        setTimeout(() => setComplaintSuccess(false), 3000);
      } else {
        console.error("فشل إرسال الشكوى");
      }
    } catch (err) {
      console.error("خطأ في إرسال الشكوى:", err);
    }
    setLoading(false);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="text-purple-700 font-bold text-xl animate-pulse">
          جاري التحميل...
        </span>
      </div>
    );

  return (
    <>
      <div className="flex flex-col gap-3 mt-5">
        {buttonsData.map((btn, i) => (
          <ProfileButton
            key={i}
            text={btn.text}
            icon={btn.icon}
            onClick={() => {
              if (btn.text === "حذف الحساب") {
                setModalType("delete");
                setShowModal(true);
              } else if (btn.text === "تسجيل الخروج") {
                setModalType("logout");
                setShowModal(true);
              } else if (btn.text === "الشكاوى والاقتراحات") {
                setComplaintModal(true);
              } else if (btn.text === "الملف الشخصي") {
                window.location.href = "/more/profile";
              } else if (btn.text === "الاشعارات") {
                window.location.href = "/more/notification";
              } else if (btn.text === "نتائج الاختبارات") {
                window.location.href = "/more/result";
              } else if (btn.text === "تواصل معنا") {
                window.location.href = "/more/contact";
              } else if (btn.text === "المحفظة") {
                window.location.href = "/more/wallet";
              } else if (btn.text === "الطلبات") {
                window.location.href = "/more/order";
              }
            }}
          />
        ))}

        {/* مودال التأكيد */}
        {showModal && (
          <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] flex items-center justify-center z-[9999]">
            <div className="bg-white p-6 rounded-2xl w-80 text-right shadow-xl space-y-4">
              <p className="text-2xl font-bold text-purple-900">
                {modalType === "delete" ? "حذف الحساب" : "تسجيل الخروج"}
              </p>
              <p className="text-lg font-medium text-gray-700">
                {modalType === "delete"
                  ? "هل أنت متأكد من حذف الحساب؟"
                  : "هل أنت متأكد من تسجيل الخروج؟"}
              </p>
              <div className="flex mt-4 gap-2 justify-end">
                <button
                  className="px-4 py-2 text-purple-950 font-semibold"
                  onClick={() => {
                    if (modalType === "delete") handleDeleteAccount();
                    else handleLogout();
                    setShowModal(false);
                  }}
                >
                  {modalType === "delete" ? "حذف الحساب" : "تسجيل الخروج"}
                </button>
                <button
                  className="px-4 py-2 text-gray-600"
                  onClick={() => setShowModal(false)}
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}

        {complaintModal && (
          <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] flex items-center justify-center z-[9999]">
            <div className="bg-white p-6 rounded-2xl w-80 text-center shadow-xl space-y-4">
              <p className="text-xl font-bold text-[#bf9916]">
                إرسال شكوى أو اقتراح
              </p>
              <textarea
                value={complaintText}
                onChange={(e) => setComplaintText(e.target.value)}
                placeholder="اكتب الاقتراح أو الشكوى هنا"
                className="w-full h-32 p-3 rounded-md border border-gray-300 text-center"
              />
              <button
                onClick={handleComplaintSubmit}
                className="bg-[#bf9916] text-white px-6 py-2 rounded-xl font-semibold"
              >
                إرسال
              </button>
            </div>
          </div>
        )}

        {complaintSuccess && (
          <div className="fixed bottom-4 right-1/2 translate-x-1/2 z-[9999] animate-zoom-in">
            <div className="bg-green-600 text-white px-6 py-3 rounded-xl shadow-xl text-lg font-semibold">
              سيتم حذف الحساب خلال ٤٨ ساعة، ثم سيتم تحويلك لصفحة التسجيل
            </div>
          </div>
        )}
      </div>

      <BottomNav isModalOpen={showModal || complaintModal} />

      <style jsx global>{`
        @keyframes zoom-in {
          from {
            transform: scale(0.3);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-zoom-in {
          animation: zoom-in 0.4s ease-out forwards;
        }
      `}</style>
    </>
  );
}
