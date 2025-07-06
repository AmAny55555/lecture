"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [userName, setUserName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [token, setToken] = useState("");
  const [money, setMoney] = useState(0);
  const [subscribedGroups, setSubscribedGroups] = useState([]);
  const [cartItems, setCartItems] = useState([]); // ✅ قائمة الكتب
  const [cartCount, setCartCount] = useState(0);

  // 🟢 تحميل البيانات المحفوظة عند تشغيل الموقع
  useEffect(() => {
    const savedMoney = localStorage.getItem("money");
    if (savedMoney !== null) setMoney(parseFloat(savedMoney));

    const savedSubscribedGroups = localStorage.getItem("subscribedGroups");
    if (savedSubscribedGroups) {
      setSubscribedGroups(JSON.parse(savedSubscribedGroups));
    }

    const savedUserName = localStorage.getItem("userName");
    if (savedUserName) setUserName(savedUserName);

    const savedPhone = localStorage.getItem("phoneNumber");
    if (savedPhone) setPhoneNumber(savedPhone);

    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);

      // 🟡 تحميل عدد السلة والعناصر
      fetch("https://eng-mohamedkhalf.shop/api/Order/GetCartItems", {
        headers: {
          Authorization: `Bearer ${savedToken}`,
          lang: "ar",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.errorCode === 0 && Array.isArray(data.data.items)) {
            setCartItems(data.data.items); // ✅ تخزين العناصر
            setCartCount(data.data.items.length);
          }
        })
        .catch((err) => console.error("فشل تحميل عدد السلة", err));
    }
  }, []);

  // 🟠 تحديث الرصيد من localStorage في الخلفية لو اتغير
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "money") {
        setMoney(parseFloat(event.newValue) || 0);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // ✅ تسجيل دخول + تحميل cart مباشرة
  function login({ userName, phoneNumber, token, money }) {
    setUserName(userName || "");
    setPhoneNumber(phoneNumber || "");
    setToken(token || "");
    setMoney(money !== undefined ? parseFloat(money) : 0);

    localStorage.setItem("userName", userName || "");
    localStorage.setItem("phoneNumber", phoneNumber || "");
    localStorage.setItem("token", token || "");
    localStorage.setItem("money", money !== undefined ? money.toString() : "0");

    fetch("https://eng-mohamedkhalf.shop/api/Order/GetCartItems", {
      headers: {
        Authorization: `Bearer ${token}`,
        lang: "ar",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.errorCode === 0 && Array.isArray(data.data.items)) {
          setCartItems(data.data.items); // ✅
          setCartCount(data.data.items.length);
        }
      })
      .catch((err) => console.error("فشل تحميل عدد السلة", err));
  }

  // ✅ تسجيل خروج
  function logout() {
    setUserName("");
    setPhoneNumber("");
    setToken("");
    setMoney(0);
    setSubscribedGroups([]);
    setCartCount(0);
    setCartItems([]); // ✅

    localStorage.removeItem("userName");
    localStorage.removeItem("phoneNumber");
    localStorage.removeItem("token");
    localStorage.removeItem("money");
    localStorage.removeItem("subscribedGroups");
    localStorage.removeItem("wallet_balance");
    localStorage.removeItem("studentId");
    localStorage.removeItem("studentDataComplete");
  }

  // ✅ إضافة اشتراك مجموعة
  function addSubscribedGroup(groupId) {
    const idStr = groupId.toString();
    if (!subscribedGroups.includes(idStr)) {
      const updated = [...subscribedGroups, idStr];
      setSubscribedGroups(updated);
      localStorage.setItem("subscribedGroups", JSON.stringify(updated));
    }
  }

  // ✅ دالة إضافة كتاب للسلة مع منع التكرار
  function addToCart(book) {
    const exists = cartItems.some((item) => item.id === book.id);
    if (!exists) {
      const updated = [...cartItems, book];
      setCartItems(updated);
      setCartCount(updated.length);
    }
  }

  return (
    <UserContext.Provider
      value={{
        userName,
        phoneNumber,
        token,
        money,
        setMoney,
        subscribedGroups,
        addSubscribedGroup,
        login,
        logout,
        cartCount,
        setCartCount,
        cartItems,
        addToCart, // ✅ جاهزة للاستخدام
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
