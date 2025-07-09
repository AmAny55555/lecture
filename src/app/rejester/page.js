"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useUser } from "@/app/context/UserContext";
import {
  FaPen,
  FaUser,
  FaPhone,
  FaLock,
  FaEnvelope,
  FaChevronDown,
} from "react-icons/fa";

const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(3, "الاسم الكامل مطلوب")
      .transform((val) => val.trim()),
    studentPhone: z
      .string()
      .min(10, "رقم الهاتف غير صالح")
      .transform((val) => val.trim()),
    parentPhone: z
      .string()
      .min(10, "رقم ولي الأمر غير صالح")
      .transform((val) => val.trim()),
    email: z
      .string()
      .email("البريد الإلكتروني غير صالح")
      .transform((val) => val.trim()),
    password: z.string().min(6, "كلمة السر يجب أن تكون 6 أحرف على الأقل"),
    confirmPassword: z.string(),
    cityId: z.string().min(1, "يجب اختيار المدينة"),
    image: z.any().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "كلمتا السر غير متطابقتين",
    path: ["confirmPassword"],
  });

function RegisterPage() {
  const [cities, setCities] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [cityId, setCityId] = useState("");
  const router = useRouter();
  const { logout } = useUser();

  const methods = useForm({
    resolver: zodResolver(registerSchema),
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = methods;

  useEffect(() => {
    Cookies.remove("token");
    Cookies.remove("userName");
    Cookies.remove("studentId");
    Cookies.remove("studentDataComplete");
    localStorage.removeItem("wallet_balance");
    localStorage.removeItem("money");
    logout();
  }, []);

  useEffect(() => {
    async function fetchCities() {
      try {
        const res = await fetch("https://eng-mohamedkhalf.shop/api/cities");
        const json = await res.json();
        setCities(json.data);
      } catch (error) {
        console.error("Error fetching cities:", error);
      }
    }
    fetchCities();
  }, []);

  const onSubmit = async (data) => {
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const payload = {
        fullName: data.fullName,
        phoneNumber: data.studentPhone,
        parentNumber: data.parentPhone,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        landLinePhone: "",
        cityId: parseInt(cityId),
        img: "",
        whatsAppNumber: data.studentPhone,
        telegramNumber: "@student",
        faceBookLink: "https://facebook.com/student.profile",
      };

      const res = await fetch(
        "https://eng-mohamedkhalf.shop/api/Users/StudentRegister",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json-patch+json",
            lang: "ar",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await res.json();
      if (result.errorCode !== 0) {
        setErrorMessage(result.errorMessage || "فشل في إنشاء الحساب");
        return;
      }

      setSuccessMessage("تم إنشاء الحساب بنجاح ✅");
      setTimeout(() => router.push("/login"), 1500);
    } catch (err) {
      setErrorMessage(err.message || "حدث خطأ");
    }
  };

  const imageWatch = watch("image");
  useEffect(() => {
    if (imageWatch && imageWatch[0]) {
      const file = imageWatch[0];
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);
    }
  }, [imageWatch]);

  const FloatingInput = ({ icon, placeholder, name, type = "text" }) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <div className="relative mb-4 w-full">
        <input
          type={type}
          {...register(name)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full px-10 h-12 rounded outline-none transition-all duration-300
            ${errors[name] ? "border-red-500" : "border-gray-300"}
            focus:border-purple-800 focus:border-2 placeholder-gray-400 text-right border`}
          placeholder={placeholder}
        />
        <span className="absolute right-3 top-3 text-gray-700">{icon}</span>

        {isFocused && (
          <span className="absolute right-10 -top-3 text-xs text-[#bf9916] bg-white px-1">
            {placeholder}
          </span>
        )}

        {errors[name] && (
          <p className="text-red-500 text-sm mt-1">{errors[name].message}</p>
        )}
      </div>
    );
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen flex justify-center items-center bg-white p-4"
    >
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white p-6 rounded-xl shadow-md w-full max-w-md"
        >
          <h1 className="text-xl font-bold text-center mb-4 text-[#bf9916]">
            إنشاء حساب جديد
          </h1>

          <div className="relative flex items-center justify-center mb-4 rounded-full">
            <Image
              src={previewImage || "/56.png"}
              width={40}
              height={40}
              alt="user"
              className="rounded-full object-fill  w-30 h-30"
            />
            <label
              className="absolute bottom-1 right-24 sm:right-24 md:right-36 bg-purple-200 p-1.5 rounded-full cursor-pointer shadow-md transition"
              title="تغيير الصورة"
            >
              <FaPen className="text-purple-950 text-xs" />
              <input
                type="file"
                accept="image/*"
                {...register("image")}
                className="hidden"
              />
            </label>
          </div>

          <FloatingInput
            name="fullName"
            placeholder="الاسم"
            icon={<FaUser className="text-gray-700" />}
          />
          <FloatingInput
            name="studentPhone"
            placeholder="رقم هاتف الطالب"
            icon={<FaPhone className="text-gray-700" />}
          />
          <FloatingInput
            name="parentPhone"
            placeholder="رقم هاتف الوالد"
            icon={<FaPhone className="text-gray-700" />}
          />
          <FloatingInput
            name="email"
            placeholder="البريد الإلكتروني"
            icon={<FaEnvelope className="text-gray-700" />}
          />
          <FloatingInput
            name="password"
            placeholder="كلمة السر"
            type="password"
            icon={<FaLock className="text-gray-700" />}
          />
          <FloatingInput
            name="confirmPassword"
            placeholder="تأكيد كلمة السر"
            type="password"
            icon={<FaLock className="text-gray-700" />}
          />

          <div className="relative mb-4">
            <select
              className={`w-full h-12 px-10 rounded border appearance-none bg-white text-right
                ${cityId ? "text-black" : "text-gray-400"}
                focus:outline-none focus:border-purple-800 focus:border-2 transition-all duration-300
              `}
              value={cityId}
              onChange={(e) => {
                setCityId(e.target.value);
                setValue("cityId", e.target.value);
              }}
            >
              <option value="" disabled hidden>
                المدينة
              </option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute top-1/2 transform -translate-y-1/2 right-3 text-gray-500">
              <FaChevronDown />
            </div>
            {errors.cityId && (
              <p className="text-red-500 text-sm mt-1">
                {errors.cityId.message}
              </p>
            )}
          </div>

          {errorMessage && (
            <p className="text-red-500 text-sm text-center mb-2">
              {errorMessage}
            </p>
          )}
          {successMessage && (
            <p className="text-green-600 text-sm text-center mb-2">
              {successMessage}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-[#cda824] text-white py-2 rounded-xl mt-3 h-13"
          >
            انشاء حساب
          </button>

          <p className="text-center text-gray-600 mt-2  font-medium">
            هل لديك حساب؟{" "}
            <Link href="/login" className="text-purple-900  font-medium pr-2">
              تسجيل دخول
            </Link>
          </p>
        </form>
      </FormProvider>
    </div>
  );
}

export default RegisterPage;
