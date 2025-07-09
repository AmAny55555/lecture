"use client";

import React, { useEffect, useState } from "react";
import NoItem from "../../NoItem";
import { useRouter } from "next/navigation";

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

function Spinner() {
  return (
    <div className="flex justify-center items-center h-screen relative">
      <div className="w-10 h-10 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

function formatArabicDate(dateStr) {
  const months = [
    "يناير",
    "فبراير",
    "مارس",
    "أبريل",
    "مايو",
    "يونيو",
    "يوليو",
    "أغسطس",
    "سبتمبر",
    "أكتوبر",
    "نوفمبر",
    "ديسمبر",
  ];
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

export default function Orders() {
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = getCookie("token");
    if (!token) {
      setOrders([]);
      setLoading(false);
      return;
    }

    fetch("https://eng-mohamedkhalf.shop/api/Order/GetOrders", {
      method: "GET",
      headers: {
        accept: "text/plain",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.data || []);
      })
      .catch(() => {
        setOrders([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  if (!orders || orders.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen relative">
        <button
          onClick={() => router.back()}
          className="text-[#bf9916] text-3xl absolute top-5 right-5 hover:text-yellow-600 transition"
          aria-label="الرجوع للخلف"
        >
          <i className="fa-solid fa-arrow-right"></i>
        </button>
        <NoItem text="لا توجد طلبات حتى الان" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-[#f9f9f9]" dir="rtl" lang="ar">
      <button
        onClick={() => router.back()}
        className="text-[#bf9916] text-3xl absolute top-5 right-5  hover:text-yellow-600 transition"
        aria-label="الرجوع للخلف"
      >
        <i className="fa-solid fa-arrow-right"></i>
      </button>

      <div className="max-w-3xl mx-auto space-y-5 mt-10">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white shadow-md rounded-xl p-4 flex justify-between items-center"
          >
            <div className="text-right space-y-1">
              <p className="text-lg font-bold text-[#bf9916]">
                {order.orderNumber}
              </p>
              <p className="text-gray-600 text-sm">
                {formatArabicDate(order.createdOn)}
              </p>
              <p className="text-gray-800 font-semibold">
                الإجمالي:{" "}
                <span className="text-green-700">{order.total} ج</span>
              </p>
            </div>
            <div className="text-left">
              <span className="text-green-600 font-semibold">
                {order.orderStatus === "In Progress"
                  ? "قيد التنفيذ"
                  : order.orderStatus}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
