"use client";

import React from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "./context/UserContext";

function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const { userName, loadingUserName, cartCount } = useUser();

  const hiddenRoutes = [
    "/login",
    "/rejester",
    "/more-info",
    "/more/profile",
    "/more/notification",
    "/more/result",
    "/more/contact",
    "/more/wallet",
    "/more/order",
    "/cart",
  ];

  const shouldHideNavbar =
    hiddenRoutes.includes(pathname) || pathname.startsWith("/subject/");

  if (shouldHideNavbar || loadingUserName) return null;

  return (
    <div className="nav flex justify-between items-center px-4 sm:px-10 py-2">
      <div className="icon flex gap-7 text-xl text-[#bf9916]">
        <div
          className="relative cursor-pointer"
          onClick={() => router.push("/cart")}
        >
          <i className="fa-solid fa-cart-shopping text-xl"></i>
          <span className="absolute bg-red-500 -top-3 left-5 text-white w-5 h-5 flex items-center justify-center rounded-full text-xs">
            {cartCount}
          </span>
        </div>
        <div>
          <i className="fa-regular fa-bell"></i>
        </div>
      </div>

      <div className="right flex items-center justify-center gap-2">
        <div>
          <h1 className="sm:text-sm md:font-semibold md:text-2xl">
            {userName ? `أهلاً بك ${userName}` : "أهلاً بك"}
          </h1>
          <h1 className="font-medium text-right pt-2">... لنبدأ التعلم</h1>
        </div>
        <div className="img">
          <Image
            src="/56.png"
            width={60}
            height={60}
            alt="logo"
            className="object-fill rounded-full"
          />
        </div>
      </div>
    </div>
  );
}

export default Nav;
