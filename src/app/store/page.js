"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Spinner from "../components/Spinner";
import { motion } from "framer-motion";
import NoItem from "../NoItem";

export default function StorePage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  const router = useRouter();

  useEffect(() => {
    const cookieString = document.cookie;
    const cookies = cookieString.split("; ").reduce((acc, current) => {
      const [name, value] = current.split("=");
      acc[name] = value;
      return acc;
    }, {});
    const tokenFromCookie = cookies.token || null;
    setToken(tokenFromCookie);
  }, []);

  // ✅ جلب الكتب
  useEffect(() => {
    if (!token) return;

    const fetchBooks = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://eng-mohamedkhalf.shop/api/Books/GetAllBooks?PageNumber=1&PageSize=100`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
              lang: "ar",
            },
          }
        );

        const json = await res.json();
        console.log("📚 Books response:", json);

        setBooks(json.data?.items || []);
      } catch (error) {
        console.error("❌ Error fetching books:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [token]);

  if (loading) return <Spinner />;

  if (books.length === 0) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <NoItem text="لا توجد كتب الآن" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4" dir="rtl">
      <h1 className="text-3xl font-bold text-[#bf9916] mb-6 text-center">
        المتجر
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 justify-center">
        {books.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            onClick={() =>
              router.push(`/subject/${item.subjectTeacherId}/books/${item.id}`)
            }
            className="cursor-pointer bg-gray-100 w-60 rounded-xl shadow-md p-0"
          >
            <div className="space-y-2">
              {item.photos?.[0] ? (
                <img
                  src={`https://eng-mohamedkhalf.shop${item.photos[0].replace(
                    /\\/g,
                    "/"
                  )}`}
                  alt={item.name}
                  className="w-full h-40 object-cover rounded-xl"
                />
              ) : (
                <div className="w-full h-40 rounded bg-gray-200" />
              )}

              <h3 className="text-lg font-bold text-black px-2">{item.name}</h3>

              <div className="flex items-center gap-2 text-xs text-gray-600 px-2">
                <span className="text-[#bf9916] text-base">👤</span>
                <span>{item.fullName || "غير معروف"}</span>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500 px-2">
                <span className="text-[#bf9916] text-base">📅</span>
                <span>
                  {new Date(item.createdAt).toLocaleDateString("ar-EG", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>

              <div className="flex justify-end px-3 gap-1 text-yellow-400 text-lg">
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i}>{i < item.evaluation ? "★" : "☆"}</span>
                ))}
              </div>

              <p className="text-sm font-bold px-2 pb-4">
                {item.price === 0 ? (
                  <span className="text-gray-600 text-lg">مجاني</span>
                ) : (
                  <span className="text-green-600">{item.price} جنيه</span>
                )}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
