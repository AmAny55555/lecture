"use client";
import React, { useEffect, useState } from "react";
import Spinner from "../components/Spinner";
import NoItem from "@/app/NoItem";

function getTokenFromCookies() {
  const cookieString = document.cookie;
  const cookies = cookieString.split("; ").reduce((acc, current) => {
    const [name, value] = current.split("=");
    acc[name] = value;
    return acc;
  }, {});
  return cookies.token || null;
}

export default function BooksList() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const tokenFromCookie = getTokenFromCookies();
    if (tokenFromCookie) {
      setToken(tokenFromCookie);
    }
  }, []);

  useEffect(() => {
    if (!token) return;

    const fetchBooks = async () => {
      try {
        const res = await fetch(
          "https://eng-mohamedkhalf.shop/api/Books/GetAllBooks",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
              lang: "ar",
            },
          }
        );

        const json = await res.json();
        console.log("رد السيرفر:", json);

        if (json.errorCode === 0 && json.data) {
          const booksArray =
            typeof json.data === "string" ? JSON.parse(json.data) : json.data;

          setBooks(Array.isArray(booksArray) ? booksArray : []);
        } else {
          setBooks([]);
        }
      } catch (err) {
        console.error("فشل في جلب الكتب:", err);
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [token]);

  if (loading) return <Spinner />;

  if (!books || books.length === 0) {
    return <NoItem text="لا يوجد كتب الآن" />;
  }

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4"
      dir="rtl"
    >
      {books.map((book, index) => (
        <div
          key={index}
          className="bg-white shadow-md rounded-xl p-3 hover:shadow-lg transition"
        >
          {book.photos?.[0] ? (
            <img
              src={`https://eng-mohamedkhalf.shop${book.photos[0].replace(
                /\\/g,
                "/"
              )}`}
              alt={book.name}
              className="w-full h-40 object-cover rounded-xl mb-3"
            />
          ) : (
            <div className="w-full h-40 bg-gray-200 rounded-xl mb-3 flex items-center justify-center text-gray-500">
              لا توجد صورة
            </div>
          )}

          <h3 className="text-lg font-bold text-black mb-1">{book.name}</h3>

          <div className="flex items-center gap-2 text-sm text-gray-700 mb-1">
            <span className="text-[#bf9916]">👤</span>
            <span>{book.fullName || "غير معروف"}</span>
          </div>

          <div className="flex justify-between items-center mb-2">
            <div className="flex gap-1 text-yellow-400 text-lg">
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i}>{i < book.evaluation ? "★" : "☆"}</span>
              ))}
            </div>
            <span className="text-green-600 font-bold text-sm">
              {book.price === 0 ? "مجاني" : `${book.price} جنيه`}
            </span>
          </div>

          <p className="text-sm text-gray-600">
            {book.description
              ? book.description.slice(0, 70) +
                (book.description.length > 70 ? "..." : "")
              : "لا يوجد وصف"}
          </p>
        </div>
      ))}
    </div>
  );
}
