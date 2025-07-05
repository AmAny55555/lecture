"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [userName, setUserName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [token, setToken] = useState("");
  const [money, setMoney] = useState(0);
  const [subscribedGroups, setSubscribedGroups] = useState([]);
  const [loadingUserName, setLoadingUserName] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  const fetchUserNameFromServer = async (token, localName) => {
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
      if (data.errorCode === 0 && data.data?.fullName) {
        const realName = data.data.fullName;
        if (realName !== localName) {
          setUserName(realName);
          localStorage.setItem("userName", realName);
        }
      }
    } catch (err) {
      console.error("❌ فشل في جلب بيانات المستخدم:", err);
    } finally {
      setLoadingUserName(false);
    }
  };

  const fetchCartCountFromAPI = async (token) => {
    try {
      const res = await fetch(
        "https://eng-mohamedkhalf.shop/api/Order/GetCartItems",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            lang: "ar",
          },
        }
      );
      const data = await res.json();
      if (data.errorCode === 0 && Array.isArray(data.data)) {
        setCartCount(data.data.length);
      } else {
        setCartCount(0);
      }
    } catch (err) {
      console.error("❌ فشل في جلب عدد عناصر السلة:", err);
      setCartCount(0);
    }
  };

  useEffect(() => {
    const savedName = localStorage.getItem("userName");
    if (savedName) setUserName(savedName);

    const savedPhone = localStorage.getItem("phoneNumber");
    if (savedPhone) setPhoneNumber(savedPhone);

    const savedMoney = localStorage.getItem("money");
    if (savedMoney !== null) setMoney(parseFloat(savedMoney));

    const savedGroups = localStorage.getItem("subscribedGroups");
    if (savedGroups) {
      try {
        setSubscribedGroups(JSON.parse(savedGroups));
      } catch {
        setSubscribedGroups([]);
      }
    }

    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
      fetchUserNameFromServer(savedToken, savedName);
      fetchCartCountFromAPI(savedToken);
    } else {
      setLoadingUserName(false);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("subscribedGroups", JSON.stringify(subscribedGroups));
  }, [subscribedGroups]);

  function login({ userName, phoneNumber, token, money }) {
    setUserName(userName || "");
    setPhoneNumber(phoneNumber || "");
    setToken(token || "");
    setMoney(money !== undefined ? parseFloat(money) : 0);

    localStorage.setItem("userName", userName || "");
    localStorage.setItem("phoneNumber", phoneNumber || "");
    localStorage.setItem("token", token || "");
    localStorage.setItem("money", money !== undefined ? money.toString() : "0");

    // جلب عدد السلة بعد تسجيل الدخول
    fetchCartCountFromAPI(token);
  }

  function logout() {
    setUserName("");
    setPhoneNumber("");
    setToken("");
    setMoney(0);
    setSubscribedGroups([]);
    setCartCount(0);
    localStorage.clear();
  }

  function addSubscribedGroup(groupId) {
    const idStr = groupId.toString();
    if (!subscribedGroups.includes(idStr)) {
      setSubscribedGroups((prev) => [...prev, idStr]);
    }
  }

  // ✅ الإضافة إلى السلة عن طريق API
  async function addToCartAPI({ bookId, quantity = 1 }) {
    if (!token) return;

    try {
      const res = await fetch(
        "https://eng-mohamedkhalf.shop/api/Order/AddToCart",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            lang: "ar",
          },
          body: JSON.stringify({ bookId, quantity }),
        }
      );
      const data = await res.json();

      if (data.errorCode === 0) {
        fetchCartCountFromAPI(token);
        return { success: true, message: "تمت الإضافة للسلة" };
      } else {
        return { success: false, message: data.errorMessage || "حدث خطأ" };
      }
    } catch (err) {
      console.error("❌ فشل الإضافة للسلة:", err);
      return { success: false, message: "فشل الاتصال بالسيرفر" };
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
        loadingUserName,
        cartCount,
        setCartCount,
        addToCartAPI,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
