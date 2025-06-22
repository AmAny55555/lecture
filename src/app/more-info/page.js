"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

function getTokenFromCookies() {
  const cookieString = document.cookie;
  const cookies = cookieString.split("; ").reduce((acc, current) => {
    const [name, value] = current.split("=");
    acc[name] = value;
    return acc;
  }, {});
  return cookies.token || null;
}

function Page() {
  const router = useRouter();
  const [selected, setSelected] = useState("");
  const [stages, setStages] = useState([]);
  const [subStages, setSubStages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // اقرأ الاختيار المحفوظ لو موجود
  useEffect(() => {
    const savedType = localStorage.getItem("educationType");
    if (savedType) setSelected(savedType);
  }, []);

  useEffect(() => {
    const checkStudentData = async () => {
      try {
        const token = getTokenFromCookies();
        if (!token) return;

        const res = await fetch(
          "https://eng-mohamedkhalf.shop/api/Students/CheckStudentData",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              accept: "text/plain",
              lang: "ar",
            },
          }
        );

        const result = await res.json();

        if (result?.data === true) {
          router.replace("/main");
        }
      } catch (error) {
        console.error("❌ Error checking student data:", error);
      }
    };

    checkStudentData();
  }, [router]);

  useEffect(() => {
    const fetchStages = async () => {
      try {
        const token = getTokenFromCookies();
        if (!token) return;

        const res = await fetch(
          "https://eng-mohamedkhalf.shop/api/EducationalStages/GetEducationalStages",
          {
            headers: {
              accept: "text/plain",
              Authorization: `Bearer ${token}`,
              lang: "ar",
            },
          }
        );
        const data = await res.json();
        if (data?.data) setStages(data.data);
      } catch (error) {
        console.error("Error fetching stages:", error);
      }
    };
    fetchStages();
  }, []);

  useEffect(() => {
    const fetchAllSubStages = async () => {
      setLoading(true);
      try {
        const token = getTokenFromCookies();
        if (!token) return;

        const res = await fetch(
          "https://eng-mohamedkhalf.shop/api/SubEducationalStages/GetSubEducationalStages/1",
          {
            headers: {
              accept: "text/plain",
              Authorization: `Bearer ${token}`,
              lang: "ar",
            },
          }
        );
        const data = await res.json();
        setSubStages(data?.data || []);
      } catch (error) {
        console.error("Error fetching sub stages:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllSubStages();
  }, []);

  const createStudentData = async (body) => {
    try {
      const token = getTokenFromCookies();
      if (!token) {
        setErrorMessage("خطأ: لم يتم العثور على توكن الدخول");
        return null;
      }

      const res = await fetch(
        "https://eng-mohamedkhalf.shop/api/Students/CreateStudentData",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            lang: "ar",
          },
          body: JSON.stringify(body),
        }
      );
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Error in CreateStudentData:", err);
      setErrorMessage("حدث خطأ أثناء إرسال البيانات");
      return null;
    }
  };

  const showError = (msg) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(""), 3000);
  };

  // لما المستخدم يختار نوع المدرسة، خزنه في ال state وكمان في localStorage
  const handleSelect = (type) => {
    setSelected(type);
    localStorage.setItem("educationType", type);
  };

  const onSubmit = async (formData) => {
    const educationalStageId = parseInt(formData.educationalStageId);
    const subEducationalStageId = parseInt(formData.subEducationalStageId);

    if (!selected) {
      showError("من فضلك اختر نوع المدرسة");
      return;
    }

    if (isNaN(educationalStageId) || isNaN(subEducationalStageId)) {
      showError("تأكد من اختيار المرحلة التعليمية والصف الدراسي");
      return;
    }

    const fullData = {
      ...formData,
      educationType: selected,
      educationalStageId,
      subEducationalStageId,
    };

    const result = await createStudentData(fullData);

    if (result?.errorCode === 0 || result?.errorCode === 61) {
      router.push("/main");
    } else {
      showError("❌ فشل في إرسال البيانات");
      console.error("❌ السبب:", result);
    }
  };

  return (
    <div className="px-4 pt-10">
      <h1 className="text-2xl font-bold mb-2 text-right md:px-20">
        ! يجب اكمال البيانات
      </h1>
      <p className="text-sm text-right text-gray-500 mb-6  sm:px-15 md:px-20">
        ...قم باكمال بيانات حسابك واستمتع بالتعلم
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-lg mx-auto"
        dir="rtl"
      >
        <div className="flex justify-center mb-6">
          <Image
            src="/logo.jpg"
            width={330}
            height={200}
            alt="logo"
            className="rounded-xl"
          />
        </div>

        <div className="flex gap-4 mb-6">
          <div
            onClick={() => handleSelect("arabic")}
            className={`flex-1 h-40 rounded-2xl flex items-center justify-center border cursor-pointer ${
              selected === "arabic" ? "border-4 border-black" : "border"
            }`}
          >
            <p className="text-yellow-700 text-lg">مدارس عربي</p>
          </div>
          <div
            onClick={() => handleSelect("language")}
            className={`flex-1 h-40 rounded-2xl flex items-center justify-center border cursor-pointer ${
              selected === "language" ? "border-4 border-black" : "border"
            }`}
          >
            <p className="text-yellow-700 text-lg">مدارس لغات</p>
          </div>
        </div>

        <div className="mb-4 relative">
          <select
            {...register("educationalStageId", {
              required: "يجب اختيار المرحلة",
            })}
            defaultValue=""
            className="w-full border rounded-2xl px-4 h-10 text-black bg-white appearance-none pr-10 focus:outline-none"
          >
            <option value="" disabled hidden>
              اختر المرحلة التعليمية
            </option>
            {stages.map((stage) => (
              <option key={stage.id} value={stage.id}>
                {stage.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            ▼
          </div>
          {errors.educationalStageId && (
            <p className="text-red-500 text-sm mt-1">
              {errors.educationalStageId.message}
            </p>
          )}
        </div>

        <div className="mb-4 relative">
          <select
            {...register("subEducationalStageId", {
              required: "يجب اختيار الصف الدراسي",
            })}
            defaultValue=""
            className="w-full border rounded-2xl px-4 h-10 text-black bg-white appearance-none pr-10 focus:outline-none"
          >
            <option value="" disabled hidden>
              اختر الصف الدراسي
            </option>
            {subStages.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            ▼
          </div>
          {errors.subEducationalStageId && (
            <p className="text-red-500 text-sm mt-1">
              {errors.subEducationalStageId.message}
            </p>
          )}
        </div>

        {errorMessage && (
          <div className="bg-red-100 text-red-700 p-3 rounded-xl mb-4 text-center font-semibold shadow">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          className="bg-yellow-600 text-white w-full h-12 rounded-xl mt-6 font-bold text-xl"
          disabled={loading}
        >
          {loading ? "جاري التحميل..." : "إرسال البيانات"}
        </button>
      </form>
    </div>
  );
}

export default Page;
