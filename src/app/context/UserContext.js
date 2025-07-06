"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [userName, setUserName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [token, setToken] = useState("");
  const [money, setMoney] = useState(0);
  const [subscribedGroups, setSubscribedGroups] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);

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

      fetch("https://eng-mohamedkhalf.shop/api/Order/GetCartItems", {
        headers: {
          Authorization: `Bearer ${savedToken}`,
          lang: "ar",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.errorCode === 0 && Array.isArray(data.data.items)) {
            setCartItems(data.data.items);
            setCartCount(data.data.items.length);
          }
        })
        .catch((err) => console.error("فشل تحميل عدد السلة", err));
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "money") {
        setMoney(parseFloat(event.newValue) || 0);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

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
          setCartItems(data.data.items);
          setCartCount(data.data.items.length);
        }
      })
      .catch((err) => console.error("فشل تحميل عدد السلة", err));
  }

  function logout() {
    setUserName("");
    setPhoneNumber("");
    setToken("");
    setMoney(0);
    setSubscribedGroups([]);
    setCartCount(0);
    setCartItems([]);

    localStorage.removeItem("userName");
    localStorage.removeItem("phoneNumber");
    localStorage.removeItem("token");
    localStorage.removeItem("money");
    localStorage.removeItem("subscribedGroups");
    localStorage.removeItem("wallet_balance");
    localStorage.removeItem("studentId");
    localStorage.removeItem("studentDataComplete");
  }

  function addSubscribedGroup(groupId) {
    const idStr = groupId.toString();
    if (!subscribedGroups.includes(idStr)) {
      const updated = [...subscribedGroups, idStr];
      setSubscribedGroups(updated);
      localStorage.setItem("subscribedGroups", JSON.stringify(updated));
    }
  }

  function addToCart(book) {
    if (!token) {
      alert("يجب تسجيل الدخول أولاً");
      return;
    }

    const alreadyInCart = cartItems.some(
      (item) => item.bookId === book.id || item.id === book.id
    );

    if (alreadyInCart) {
      alert("الكتاب موجود بالفعل في السلة");
      return;
    }

    fetch("https://eng-mohamedkhalf.shop/api/Order/AddBookToCart", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        lang: "ar",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bookId: book.id,
        quantity: 1,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.errorCode === 0) {
          return fetch("https://eng-mohamedkhalf.shop/api/Order/GetCartItems", {
            headers: {
              Authorization: `Bearer ${token}`,
              lang: "ar",
            },
          });
        } else {
          throw new Error(data.errorMessage || "فشل في إضافة الكتاب");
        }
      })
      .then((res) => res.json())
      .then((data) => {
        if (data?.errorCode === 0 && Array.isArray(data.data.items)) {
          setCartItems(data.data.items);
          setCartCount(data.data.items.length);
        } else {
          throw new Error("لم يتم جلب السلة بنجاح");
        }
      })
      .catch((err) => {
        console.error("خطأ أثناء إضافة الكتاب للسلة:", err);
        alert("حدث خطأ أثناء إضافة الكتاب للسلة");
      });
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
        addToCart,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
