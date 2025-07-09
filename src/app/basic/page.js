"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Footer from "../Footer";
import Top from "../Top";

function Page() {
  const router = useRouter();

  const handleClick = () => {
    router.push("/rejester");
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Top />

      <main className="flex-grow flex items-center justify-center px-4 py-10 relative top-20">
        <div className="flex flex-col-reverse md:flex-row items-center justify-center gap-10 w-full max-w-7xl">
          <div
            dir="rtl"
            className="md:w-1/2 w-full text-center md:text-right space-y-6"
          >
            <p className="text-[rgb(95,88,84)] font-bold text-5xl md:text-7xl font-sans">
              م/ محمد خلف
            </p>
            <p className="text-[#eab308] font-bold text-2xl md:text-3xl font-sans">
              كلام -مؤرخين .. # ثانوية -عامة #
            </p>
            <p className="text-[rgb(95,88,84)] text-xl md:text-3xl font-serif leading-relaxed">
              <span className="font-bold">نبدا</span> من هنا ...عشان التاريخ{" "}
              <br />
              هو المفتاح لكل <span className="font-bold">حاجة</span>
            </p>

            <button
              onClick={handleClick}
              className="bg-[#78716c] text-white w-[180px] h-14 font-sans text-2xl font-medium mt-4 cursor-pointer"
            >
              انضم لعيلتنا
            </button>
          </div>

          <div className="md:w-1/2 w-full flex justify-center">
            <div className="w-full max-w-md rounded-xl overflow-hidden shadow-2xl border-[6px] border-[#b8860b]">
              <Image
                src="/22.png"
                alt="م/ محمد خلف"
                width={600}
                height={400}
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </main>

      <div className="relative top-40">
        <Footer />
      </div>
    </div>
  );
}

export default Page;
