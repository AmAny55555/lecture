"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

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
        cityId: parseInt(data.cityId),
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
      console.log("Register response:", result);

      if (result.errorCode !== 0) {
        setErrorMessage(result.errorMessage || "فشل في إنشاء الحساب");
        return;
      }

      setSuccessMessage("تم إنشاء الحساب بنجاح ✅");

      // ✅ تحويل المستخدم إلى صفحة تسجيل الدخول
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (err) {
      setErrorMessage(err.message || "حدث خطأ أثناء رفع البيانات");
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

  return (
    <div
      dir="rtl"
      className="min-h-screen flex justify-center items-center bg-white p-4"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-xl shadow-md w-full max-w-md"
      >
        <h1 className="text-xl font-bold text-center mb-4 text-[#bf9916]">
          إنشاء حساب جديد
        </h1>

        <div className="flex items-center justify-center mb-5">
          <label className="cursor-pointer">
            <Image
              src={previewImage || "/55.png"}
              width={150}
              height={150}
              alt="user"
              className="rounded-full"
            />
            <input
              type="file"
              accept="image/*"
              {...register("image")}
              className="hidden"
            />
          </label>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="الاسم"
            {...register("fullName")}
            className="w-full border px-4 h-10 rounded"
          />
          {errors.fullName && (
            <p className="text-red-500 text-sm mt-1">
              {errors.fullName.message}
            </p>
          )}
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="رقم الطالب"
            {...register("studentPhone")}
            className="w-full border px-4 h-10 rounded"
          />
          {errors.studentPhone && (
            <p className="text-red-500 text-sm mt-1">
              {errors.studentPhone.message}
            </p>
          )}
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="رقم ولي الأمر"
            {...register("parentPhone")}
            className="w-full border px-4 h-10 rounded"
          />
          {errors.parentPhone && (
            <p className="text-red-500 text-sm mt-1">
              {errors.parentPhone.message}
            </p>
          )}
        </div>

        <div className="mb-4">
          <input
            type="email"
            placeholder="البريد الإلكتروني"
            {...register("email")}
            className="w-full border px-4 h-10 rounded"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="mb-4">
          <select
            {...register("cityId")}
            className="w-full border px-4 h-10 rounded"
          >
            <option value="">اختر المدينة</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
          {errors.cityId && (
            <p className="text-red-500 text-sm mt-1">{errors.cityId.message}</p>
          )}
        </div>

        <div className="mb-4">
          <input
            type="password"
            placeholder="كلمة السر"
            {...register("password")}
            className="w-full border px-4 h-10 rounded"
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="mb-4">
          <input
            type="password"
            placeholder="تأكيد كلمة السر"
            {...register("confirmPassword")}
            className="w-full border px-4 h-10 rounded"
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">
              {errors.confirmPassword.message}
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
          className="w-full bg-[#bf9916] text-white py-2 rounded-xl mt-3"
        >
          تسجيل جديد
        </button>

        <p className="text-xs text-center text-gray-600 mt-2">
          لديك حساب؟{" "}
          <Link href="/" className="text-[#bf9916] font-semibold">
            تسجيل الدخول
          </Link>
        </p>
      </form>
    </div>
  );
}

export default RegisterPage;
