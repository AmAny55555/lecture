"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Basic from "./basic/page";

export default function Home() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkStudentProfile = async () => {
      const token = localStorage.getItem("token");
      const isComplete = localStorage.getItem("studentDataComplete");

      if (token && isComplete === "true") {
        router.replace("/main");
        return;
      }

      if (token && isComplete !== "true") {
        try {
          const res = await fetch(
            "https://eng-mohamedkhalf.shop/api/Students/CheckStudentData",
            {
              headers: {
                Authorization: `Bearer ${token}`,
                accept: "application/json",
              },
            }
          );

          const result = await res.json();

          if (result?.data === true) {
            localStorage.setItem("studentDataComplete", "true");
            router.replace("/main");
          } else {
            localStorage.setItem("studentDataComplete", "false");
            router.replace("/more-info");
          }
        } catch (error) {
          router.replace("/login");
        }
      }

      setIsChecking(false);
    };

    checkStudentProfile();
  }, [router]);

  if (isChecking) return null;

  // ❗️لو مش مسجل دخول ولا حاجة → يعرض واجهة Basic
  return <Basic />;
}
