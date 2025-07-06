"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUser } from "../context/UserContext";
import NoItem from "../NoItem";

function Spinner() {
  return (
    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
  );
}

export default function CartPage() {
  const { token, cartCount, setCartCount } = useUser();
  const router = useRouter();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [address, setAddress] = useState("");
  const [addressError, setAddressError] = useState("");
  const [successMessage, setSuccessMessage] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [cartTotals, setCartTotals] = useState({ total: 0, deliveryFees: 0 });
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  useEffect(() => {
    if (!token) return;

    const fetchCart = async () => {
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
        const data = await res.json();
        if (data?.errorCode === 0 && Array.isArray(data.data.items)) {
          setCartItems(data.data.items);
          setCartTotals({
            total: data.data.total,
            deliveryFees: data.data.deliveryFees,
          });
          setCartCount(data.data.items.length);
        }
      } catch (err) {
        console.error("فشل في جلب السلة", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [token]);

  const handleConfirmOrder = async () => {
    if (!address.trim()) {
      setAddressError("برجاء كتابة العنوان");
      return;
    }
    setAddressError("");
    setConfirmLoading(true);

    try {
      const res = await fetch(
        "https://eng-mohamedkhalf.shop/api/Order/AddOrUpdateAddress",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            lang: "ar",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ OrderAddress: address }),
        }
      );
      const data = await res.json();

      if (data?.errorCode === 0) {
        const confirm = await fetch(
          "https://eng-mohamedkhalf.shop/api/Order/ConfirmOrder",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              lang: "ar",
            },
          }
        );
        const resData = await confirm.json();
        if (resData?.errorCode === 0) {
          setShowModal(false);
          setSuccessMessage(true);
          setCartItems([]);
          setCartCount(0);
          setOrderConfirmed(true);
          setTimeout(() => {
            setSuccessMessage(false);
            router.push("/main");
          }, 1500);
        } else {
          alert(resData.errorMessage || "حدث خطأ أثناء تأكيد الطلب");
        }
      } else {
        alert(data.errorMessage || "حدث خطأ أثناء حفظ العنوان");
      }
    } catch (err) {
      console.error("فشل تأكيد الطلب", err);
    } finally {
      setConfirmLoading(false);
    }
  };

  if (loading) return <Spinner />;

  if (!cartItems.length && !orderConfirmed)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <NoItem text="لا توجد كتب الان" />
      </div>
    );

  const totalAll = cartTotals.total + cartTotals.deliveryFees;

  return (
    <div
      className="min-h-screen p-4 flex flex-col justify-between"
      dir="rtl"
      lang="ar"
    >
      <div>
        <div className="flex justify-end fixed top-4 right-4 z-10">
          <button
            onClick={() => router.back()}
            className="text-[#bf9916] text-2xl hover:text-[#a77f14] transition"
            title="رجوع"
          >
            &#8594;
          </button>
        </div>

        <div>
          <p className="text-center text-[#bf9916] text-2xl font-semibold font-serif">
            عربة التسوق
          </p>
          <div className="bg-[#f0f0f0] shadow-md p-3 rounded-xl mt-12 flex items-center justify-between">
            <span className="text-xl font-bold text-[#bf9916]">
              عدد الكتب: {cartItems.length}
            </span>
            <button
              onClick={() => {
                setCartItems([]);
                setCartCount(0);
              }}
              className="text-red-500 text-2xl"
            >
              <i className="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>

        {cartItems.map((item) => (
          <div
            key={item.id}
            className="flex items-start justify-between gap-2 p-3"
          >
            {item.bookImag?.length ? (
              <Image
                src={`https://eng-mohamedkhalf.shop${item.bookImag}`}
                alt="book"
                width={100}
                height={140}
                className="rounded"
              />
            ) : (
              <div className="w-[190px] h-[100px] bg-gray-200 rounded-xl"></div>
            )}

            <div className="flex-1 text-right space-y-1">
              <p className="font-mono font-semibold text-lg">{item.bookName}</p>
              <p className="text-gray-800 mb-3">الكمية: {item.quantity}</p>
              <p className="text-gray-800">
                الإجمالى:{" "}
                <span className="text-green-700 font-semibold">
                  {item.subTotal} ج
                </span>
              </p>
            </div>

            <div className="text-left flex flex-col items-start justify-between h-full">
              <p className="text-gray-800">
                السعر:
                <span className="text-green-700 font-semibold">
                  {item.price} ج
                </span>
              </p>
              <button
                onClick={() => {
                  setCartItems((prev) => prev.filter((i) => i.id !== item.id));
                  setCartCount((prev) => Math.max(0, prev - 1));
                }}
                className="text-red-500 text-lg mt-3 relative -left-6"
              >
                <i className="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div>
        <div className="h-20"></div>
        <div className="bg-gray-100 p-4 rounded-xl mt-6 space-y-2 text-right text-lg">
          <div className="flex justify-between">
            <span className="text-[#bf9916] font-bold">الاجمالى</span>
            <span>{cartTotals.total} جنيه</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#bf9916] font-bold">التوصيل</span>
            <span>{cartTotals.deliveryFees} جنيه</span>
          </div>
          <div className="flex justify-between font-bold">
            <span className="text-[#bf9916]">الإجمالى الكلى</span>
            <span>{totalAll} جنيه</span>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-xl mt-4"
        >
          تكملة الطلب
        </button>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 bg-[rgba(0,0,0,0.4)] flex items-center justify-center z-[9999]"
          onClick={() => {
            setShowModal(false);
            setAddressError("");
          }}
        >
          <div
            className="bg-white p-6 rounded-2xl w-80 text-right shadow-xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-xl font-bold text-[#bf9916]">اكتب العنوان</p>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="اكتب العنوان هنا"
              className={`w-full p-2 rounded-md border text-right ${
                addressError ? "border-red-500" : "border-gray-300"
              }`}
            />
            {addressError && (
              <p className="text-red-600 text-sm mt-1">{addressError}</p>
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={handleConfirmOrder}
                className="bg-green-600 text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-2"
                disabled={confirmLoading}
              >
                {confirmLoading ? <Spinner /> : "تأكيد الطلب"}
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setAddressError("");
                }}
                className="text-gray-600 px-4 py-2"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="fixed bottom-4 right-1/2 translate-x-1/2 z-[9999] animate-zoom-in">
          <div className="bg-green-600 text-white px-6 py-3 rounded-xl shadow-xl text-lg font-semibold">
            تم تأكيد الطلب بنجاح ✅
          </div>
        </div>
      )}

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
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
