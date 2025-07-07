"use client";

import React, { useEffect, useState } from "react";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Cookies from "js-cookie";
import { useUser } from "@/app/context/UserContext";
import { FaPhone, FaLock } from "react-icons/fa";
import Spinner from "../components/Spinner";

const loginSchema = z.object({
  phone: z
    .string()
    .min(10, "رقم الهاتف يجب أن لا يقل عن 10 أرقام")
    .max(15, "رقم الهاتف طويل جدًا"),
  password: z.string().min(6, "كلمة السر يجب أن لا تقل عن 6 حروف"),
});

const InputField = ({ name, type = "text", placeholder, icon }) => {
  const [isFocused, setIsFocused] = useState(false);
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext();
  const value = watch(name);

  return (
    <div className="relative mb-4 w-full">
      <input
        {...register(name)}
        type={type}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={isFocused ? "" : placeholder}
        className={`w-full px-10 h-12 rounded-xl border bg-white text-right transition-all duration-300
          ${errors[name] ? "border-red-500" : "border-gray-300"}
          focus:outline-none focus:border-purple-800 focus:border-2`}
      />
      <span className="absolute right-3 top-3 text-gray-700">{icon}</span>
      {(isFocused || value) && (
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

export default function Login() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const { login, logout } = useUser();

  const methods = useForm({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    logout();
  }, []);

  useEffect(() => {
    async function checkLogin() {
      const token = Cookies.get("token");
      if (!token) return setCheckingAuth(false);

      try {
        const res = await fetch(
          "https://eng-mohamedkhalf.shop/api/Students/CheckStudentData",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await res.json();

        if (data.errorCode === 0 && data.data === true) {
          router.replace("/main");
        } else {
          router.replace("/more-info");
        }
      } catch {
        router.replace("/more-info");
      }
    }

    checkLogin();
  }, [router]);

  const onSubmit = async (data) => {
    setErrorMessage("");

    const payload = {
      phoneNumber: data.phone,
      password: data.password,
      isPersist: true,
      deviceToken: null,
    };

    try {
      const res = await fetch("https://eng-mohamedkhalf.shop/api/Users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", lang: "ar" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      console.log("📦 Login response:", result);

      if (result.errorCode !== 0)
        throw new Error(result.errorMessage || "فشل تسجيل الدخول");

      const { token, fullName, userId, money } = result.data;

      if (token) {
        Cookies.set("token", token, { expires: 7, path: "/", sameSite: "Lax" });
        localStorage.setItem("token", token); // <=== مهم تحفظ التوكن في localStorage كمان
        Cookies.remove("studentDataComplete");
      }

      if (userId) Cookies.set("studentId", userId, { expires: 7 });
      if (money !== undefined) localStorage.setItem("money", money);

      if (fullName) {
        localStorage.setItem("userName", fullName);
      }

      login({
        userName: fullName,
        phoneNumber: data.phone,
        token,
        money,
      });

      const checkRes = await fetch(
        "https://eng-mohamedkhalf.shop/api/Students/CheckStudentData",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const checkData = await checkRes.json();

      Cookies.set(
        "studentDataComplete",
        checkData.data === true ? "true" : "false",
        { expires: 7 }
      );

      router.replace(checkData.data === true ? "/main" : "/more-info");
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  if (checkingAuth) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen flex flex-col px-4 py-8 bg-white items-center"
    >
      <div className="w-full text-right pr-4 sm:pr-10 lg:pr-20">
        <h1 className="text-3xl font-medium mb-2">أهلاً بكم من جديد!</h1>
        <p className="text-gray-500 mb-4">
          قم بتسجيل الدخول إلى حسابك واستمتع بالتعلم
        </p>
      </div>

      <div className="flex justify-center items-center flex-col w-full">
        <div className="mb-6">
          <Image
            src="/logo.jpg"
            alt="logo"
            width={300}
            height={200}
            className="object-fill"
          />
        </div>

        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(onSubmit)}
            className="w-full max-w-md"
          >
            <InputField
              name="phone"
              placeholder="رقم الهاتف"
              icon={<FaPhone className="text-gray-700" />}
            />
            <InputField
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="كلمة السر"
              icon={<FaLock className="text-gray-700" />}
            />

            {errorMessage && (
              <p className="text-red-500 text-sm text-center mb-2">
                {errorMessage}
              </p>
            )}

            <div className="flex flex-col items-center gap-2">
              <button
                type="submit"
                className="bg-[#bf9916] w-full text-white h-11 rounded-xl"
              >
                تسجيل الدخول
              </button>

              <p className="text-[#9d9d9d] font-bold text-center text-sm w-[240px] mt-2">
                باستخدام خدماتنا فإنك توافق على الشروط والسياسات الخاصة بنا
              </p>

              <p className="text-[#645394] text-center mt-5">
                <span className="text-gray-800 font-medium">
                  ليس لديك حساب ؟
                </span>{" "}
                <Link href="/rejester">اشترك</Link>
              </p>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
