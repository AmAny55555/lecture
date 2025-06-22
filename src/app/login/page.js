"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import Image from "next/image";
import Spinner from "../components/Spinner";
import Cookies from "js-cookie";

const loginSchema = z.object({
  phone: z
    .string()
    .min(10, "رقم الهاتف يجب أن لا يقل عن 10 أرقام")
    .max(15, "رقم الهاتف طويل جدًا"),
  password: z.string().min(6, "كلمة السر يجب أن لا تقل عن 6 حروف"),
});

export default function Login() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    async function checkLogin() {
      const token = Cookies.get("token");

      if (!token) {
        setCheckingAuth(false);
        return;
      }

      try {
        const res = await fetch(
          "https://eng-mohamedkhalf.shop/api/Students/CheckStudentData",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (data.errorCode === 0 && data.data?.isProfileComplete) {
          router.replace("/main");
        } else {
          router.replace("/more-info");
        }
      } catch (error) {
        router.replace("/more-info");
      }
    }

    checkLogin();
  }, [router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

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

      if (result.errorCode !== 0) {
        throw new Error(result.errorMessage || "فشل تسجيل الدخول");
      }

      const token = result.data?.token;
      const fullName = result.data?.fullName;
      const studentId = result.data?.userId;

      if (token) {
        Cookies.set("token", token, { expires: 7 });
        Cookies.remove("studentDataComplete");
      }

      if (fullName) Cookies.set("userName", fullName, { expires: 7 });
      if (studentId) Cookies.set("studentId", studentId, { expires: 7 });

      const checkRes = await fetch(
        "https://eng-mohamedkhalf.shop/api/Students/CheckStudentData",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const checkData = await checkRes.json();

      if (checkData.errorCode === 0 && checkData.data?.isProfileComplete) {
        Cookies.set("studentDataComplete", "true", { expires: 7 });
        router.replace("/main");
      } else {
        Cookies.set("studentDataComplete", "false", { expires: 7 });
        router.replace("/more-info");
      }
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
    <div dir="rtl" className="min-h-screen flex flex-col px-6 pt-4 bg-white">
      <div className="text-right">
        <h1 className="text-2xl font-bold mb-2">أهلاً بكم من جديد!</h1>
        <p className="text-[#cdcdcd] mb-4">
          قم بتسجيل الدخول إلى حسابك واستمتع بالتعلم
        </p>
      </div>

      <div className="flex justify-center items-center flex-col">
        <div className="logo mb-6">
          <Image
            src="/logo.jpg"
            alt="logo"
            width={300}
            height={200}
            className="object-fill"
          />
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="-mt-6 flex flex-col items-center w-full"
        >
          <div className="relative mb-4 w-[300px]">
            <input
              type="text"
              placeholder="رقم الهاتف"
              {...register("phone")}
              className="bg-white border border-[#e7e7e7] w-full px-9 h-10 rounded-xl focus:outline-none"
            />
            <i className="fa-solid fa-phone absolute right-3 top-3 text-black text-sm pointer-events-none"></i>
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div className="relative mb-4 w-[300px]">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="كلمة السر"
              {...register("password")}
              className="bg-white border border-[#e7e7e7] w-full px-10 h-10 rounded-xl focus:outline-none"
            />
            <i className="fa-solid fa-lock absolute right-3 top-1/2 -translate-y-1/2 text-black text-sm pointer-events-none"></i>
            <i
              className={`fa-regular ${
                showPassword ? "fa-eye-slash" : "fa-eye"
              } absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm cursor-pointer`}
              onClick={() => setShowPassword((prev) => !prev)}
            ></i>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {errorMessage && (
            <p className="text-red-500 text-sm mb-2">{errorMessage}</p>
          )}

          <div className="flex flex-col items-center gap-2">
            <button
              type="submit"
              className="bg-[#bf9916] w-[300px] text-white h-10 rounded-xl"
            >
              تسجيل الدخول
            </button>

            <p className="text-[#9d9d9d] font-bold text-center text-sm w-[240px]">
              باستخدام خدماتنا فإنك توافق على الشروط والسياسات الخاصة بنا
            </p>

            <p className="text-[#645394] text-center text-sm">
              <span className="text-[#4a4a4c] font-medium">
                ليس لديك حساب ؟
              </span>{" "}
              <Link href="/rejester">اشترك</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
