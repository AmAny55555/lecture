import React from "react";
import { FaYoutube, FaFacebookF, FaUsers, FaWhatsapp } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-[#334155] text-white py-6 px-4">
      {/* social icons */}
      <div className="flex justify-center gap-6 flex-wrap flex-row-reverse">
        <div className="bg-[#f1414f] rounded-full p-3 cursor-pointer hover:bg-[#f14150b1] transition">
          <FaYoutube className="text-white text-2xl" />
        </div>

        <div className="bg-blue-600 rounded-full p-3 cursor-pointer hover:bg-blue-700 transition">
          <FaUsers className="text-white text-2xl" />
        </div>

        <div className="bg-blue-600 rounded-full p-3 cursor-pointer hover:bg-blue-700 transition">
          <FaFacebookF className="text-white text-2xl" />
        </div>
      </div>

      {/* separator */}
      <div className="bg-black max-w-[90%] h-[4px] mx-auto mt-4"></div>

      {/* description */}
      <p className="text-gray-200 text-center mt-3 mb-5 text-base sm:text-lg md:text-xl font-serif flex flex-wrap items-center justify-center gap-2 px-2">
        <span className="text-red-500">❤️</span>
        تم صنع هذه المنصة بهدف تهيئة الطالب لـ كامل جوانب الثانوية العامة و ما
        بعدها
        <span className="text-red-500">❤️</span>
      </p>

      {/* contact box */}
      <div className="contact bg-[#fef08a] text-black w-full max-w-[700px] mx-auto p-6 flex flex-col items-center gap-4 text-center font-serif font-semibold rounded-t-lg">
        <h1 className="flex items-center gap-2 text-lg sm:text-xl">
          للتواصل عبر الواتساب
          <FaWhatsapp className="text-green-600 text-xl sm:text-2xl" />
        </h1>
        <h1 className="text-sm sm:text-base md:text-lg">
          تواصل مع دعم الاونلاين
        </h1>
        <h1 className="text-sm sm:text-base md:text-lg">
          تواصل مع دعم السناتر
        </h1>
        <h1 className="text-sm sm:text-base md:text-lg">
          تواصل مع المادة العلمية
        </h1>
      </div>

      {/* footer note */}
      <h1 className="text-center text-gray-400 mt-3 mb-4 text-sm sm:text-base">
        All Copy Rights Reserved @2025
      </h1>
    </footer>
  );
}
