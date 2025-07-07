"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useUser } from "@/app/context/UserContext";
import { motion, AnimatePresence } from "framer-motion";

const profileSchema = z.object({
  fullName: z.string().min(2).max(100),
  landLinePhone: z.string().min(5).max(15),
  email: z.string().email(),
  parentNumber: z.string().min(5).max(15),
});

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return "";
}

export default function UpdateProfile() {
  const router = useRouter();
  const { setUserName, setPhoneNumber } = useUser();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const getToken = () => {
    const token = getCookie("token");
    return `Bearer ${token}`;
  };

  useEffect(() => {
    async function fetchUserData() {
      try {
        const res = await fetch(
          "https://eng-mohamedkhalf.shop/api/Users/GetUserInfo",
          {
            headers: {
              Authorization: getToken(),
              Accept: "application/json",
            },
          }
        );

        const data = await res.json();

        if (data.errorCode === 0 && data.data) {
          setName(data.data.fullName || "");
          setPhone(data.data.landLinePhone || "");
          setEmail(data.data.email || "");
          setParentPhone(data.data.parentNumber || "");
          setPreviewImage(data.data.img || null);

          setUserName(data.data.fullName || "");
          setPhoneNumber(data.data.landLinePhone || "");
          localStorage.setItem("userName", data.data.fullName || "");
          localStorage.setItem("phoneNumber", data.data.landLinePhone || "");
        }
      } catch {}
    }

    fetchUserData();
  }, []);

  useEffect(() => {
    if (message) {
      const timeout = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timeout);
    }
  }, [message]);

  const handleUpdate = async () => {
    const validation = profileSchema.safeParse({
      fullName: name,
      landLinePhone: phone,
      email,
      parentNumber: parentPhone,
    });

    if (!validation.success) {
      setMessageType("error");
      setMessage("فشل في التحديث");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        fullName: name,
        parentNumber: parentPhone,
        email,
        landLinePhone: phone,
        cityId: 1,
        img: "",
        whatsAppNumber: "",
        telegramNumber: "",
        faceBookLink: "",
      };

      const res = await fetch(
        "https://eng-mohamedkhalf.shop/api/Users/UpdateProfile",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: getToken(),
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await res.json();

      if (res.ok && result.errorCode === 0) {
        setUserName(name);
        setPhoneNumber(phone);
        localStorage.setItem("userName", name);
        localStorage.setItem("phoneNumber", phone);
        setMessageType("success");
        setMessage("تم التحديث");
      } else {
        setMessageType("error");
        setMessage("فشل في التحديث");
      }
    } catch {
      setMessageType("error");
      setMessage("فشل في التحديث");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => router.back()}
        className="text-[#bf9916] text-2xl absolute top-2 right-5"
      >
        <i className="fa-solid fa-arrow-right"></i>
      </button>

      <div
        className="max-w-md mx-auto p-4 space-y-6 text-right relative"
        dir="rtl"
      >
        <div className="flex justify-center mb-6">
          <label className="cursor-pointer relative">
            <div className="w-[150px] h-[150px] rounded-full overflow-hidden flex items-center justify-center bg-gray-100">
              <Image
                src={previewImage || "/55.png"}
                alt="صورة المستخدم"
                width={150}
                height={150}
                className="object-cover"
                unoptimized
              />
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setPreviewImage(URL.createObjectURL(file));
                }
              }}
              className="hidden"
            />
          </label>
        </div>

        {[
          {
            id: "name",
            label: "الاسم",
            type: "text",
            value: name,
            onChange: setName,
          },
          {
            id: "phone",
            label: "رقم التليفون",
            type: "text",
            value: phone,
            onChange: setPhone,
          },
          {
            id: "email",
            label: "البريد الإلكتروني",
            type: "email",
            value: email,
            onChange: setEmail,
          },
          {
            id: "parentPhone",
            label: "رقم والدك",
            type: "text",
            value: parentPhone,
            onChange: setParentPhone,
          },
        ].map(({ id, label, type, value, onChange }) => (
          <div key={id} className="relative">
            <input
              id={id}
              type={type}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder=" "
              className="peer w-full p-3 border border-purple-900 rounded-xl focus:outline-none focus:border-purple-900 focus:border-2"
            />
            <label
              htmlFor={id}
              className="absolute top-0 right-4 transform -translate-y-1/2 bg-white px-2 text-sm text-black peer-focus:text-[#bf9916]"
            >
              {label}
            </label>
          </div>
        ))}

        <button
          onClick={handleUpdate}
          disabled={loading}
          className="w-full bg-[#bf9916] text-white py-3 rounded hover:bg-[#a78010] transition disabled:opacity-50"
        >
          {loading ? "جارٍ الحفظ..." : "تحديث البيانات"}
        </button>

        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`px-4 py-2 rounded-xl mt-4 text-sm text-white text-center ${
                messageType === "success" ? "bg-green-600" : "bg-red-600"
              }`}
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
