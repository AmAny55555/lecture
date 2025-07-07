"use client";

import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Spinner from "@/app/components/Spinner";
import NoItem from "@/app/NoItem";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { motion, AnimatePresence } from "framer-motion";
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

export default function BookLinksPage() {
  const { id: subjectId, bookId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const subjectTeacherId = searchParams.get("subjectTeacherId");
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [links, setLinks] = useState([]);
  const [bookData, setBookData] = useState(null);
  const [showMsg, setShowMsg] = useState(false);
  const [message, setMessage] = useState("");
  const [cartItems, setCartItems] = useState([]);

  const { setCartCount } = useUser();

  useEffect(() => {
    setToken(getTokenFromCookies());
  }, []);

  useEffect(() => {
    if (!token) return;

    const fetchCartItems = async () => {
      try {
        const res = await fetch(
          "https://eng-mohamedkhalf.shop/api/Order/GetCartItems",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              lang: "ar",
            },
          }
        );
        const json = await res.json();
        if (json.errorCode === 0 && Array.isArray(json.data.items)) {
          setCartItems(json.data.items);
        }
      } catch (err) {
        console.error("خطأ في جلب السلة:", err);
      }
    };

    fetchCartItems();
  }, [token]);

  useEffect(() => {
    if (!token || !bookId) return;

    async function fetchBookDetails() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `https://eng-mohamedkhalf.shop/api/Books/GetBookDetails/${bookId}`,
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
          setLinks([]);
          setBookData(null);
          setError("لا يوجد بيانات");
        } else {
          setLinks(json.data?.links || []);
          setBookData(json.data || null);
        }
      } catch (e) {
        console.error(e);
        setError("حدث خطأ أثناء جلب البيانات");
        setLinks([]);
        setBookData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchBookDetails();
  }, [token, bookId]);

  const handleAddToCart = async () => {
    if (!token || !bookId) return;

    try {
      const res = await fetch(
        "https://eng-mohamedkhalf.shop/api/Order/AddToCart",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json-patch+json",
            Authorization: `Bearer ${token}`,
            lang: "ar",
          },
          body: JSON.stringify({
            bookId: parseInt(bookId),
            quantity: 1,
          }),
        }
      );

      const json = await res.json();

      setMessage("تم إضافة المنتج");
      setShowMsg(true);

      const updatedRes = await fetch(
        "https://eng-mohamedkhalf.shop/api/Order/GetCartItems",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            lang: "ar",
          },
        }
      );
      const updatedJson = await updatedRes.json();
      const newCount = updatedJson?.data?.items?.length || 0;
      setCartCount(newCount);

      setTimeout(() => {
        setShowMsg(false);
        router.back();
      }, 2500);
    } catch (error) {
      console.error("خطأ أثناء الإضافة للسلة:", error);
    }
  };

  return (
    <div className="min-h-screen p-4 pt-10 relative" dir="rtl" lang="ar">
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => router.back()}
          className="text-[#bf9916] text-2xl hover:text-[#a77f14] transition"
          title="رجوع"
        >
          &#8594;
        </button>
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          {bookData?.photos?.length > 0 ? (
            <div className="w-full flex justify-center mt-6 items-center">
              <Swiper
                modules={[Autoplay]}
                autoplay={{ delay: 3000, disableOnInteraction: false }}
                loop={true}
                className="w-full max-w-[700px] mx-auto"
              >
                {bookData.photos.map((photo, i) => (
                  <SwiperSlide key={i} className="flex justify-center">
                    <img
                      src={`https://eng-mohamedkhalf.shop${photo.replace(
                        /\\/g,
                        "/"
                      )}`}
                      alt={`book-${i}`}
                      className="rounded-xl w-full h-[300px] object-cover"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          ) : (
            <div className="w-full h-[400px] bg-gray-200 rounded-xl flex items-center justify-center text-gray-500">
              لا توجد صورة
            </div>
          )}

          <div className="mt-8 max-w-[700px] w-full mx-auto px-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
              <h2 className="text-xl font-semibold text-[#bf9916]">
                {bookData?.name}
              </h2>
              <p className="text-green-600 font-bold text-lg">
                {bookData?.price === 0 ? "مجاني" : `${bookData?.price} جنيه`}
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span className="text-[#bf9916] text-base">👤</span>
              <span>{bookData?.fullName || "غير معروف"}</span>
            </div>

            <div className="flex items-center gap-2 text-yellow-500 text-lg font-bold">
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i}>
                  {i < (bookData?.evaluation ?? 0) ? "★" : "☆"}
                </span>
              ))}
              <span className="bg-[#bf9916] text-white px-2 py-0.5 text-sm rounded">
                5
              </span>
            </div>

            <div>
              <h3 className="text-[#bf9916] font-semibold text-lg mb-2">
                وصف الكتاب
              </h3>
              <div className="border-2 border-[#bf9916] p-4 rounded">
                <p className="text-sm text-gray-800">
                  {bookData?.description || "لا يوجد وصف"}
                </p>
              </div>
            </div>

            <div className="flex justify-center mt-6">
              <button
                onClick={handleAddToCart}
                className="bg-[#bf9916] text-white px-6 py-3 rounded-lg text-lg hover:bg-[#a77f14] transition w-full"
              >
                إضافة للسلة
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showMsg && (
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.8 }}
                transition={{ duration: 0.5 }}
                className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-green-600 text-white py-3 px-6 rounded-lg shadow-lg z-50 font-bold text-center"
              >
                {message}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
