"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [userName, setUserName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [token, setToken] = useState("");
  const [money, setMoney] = useState(0);
  const [subscribedGroups, setSubscribedGroups] = useState([]);

  useEffect(() => {
    const savedName = localStorage.getItem("userName");
    if (savedName) {
      setUserName(savedName);
    }

    const savedMoney = localStorage.getItem("money");
    if (savedMoney !== null) {
      setMoney(parseFloat(savedMoney));
    }

    const savedSubscribedGroups = localStorage.getItem("subscribedGroups");
    if (savedSubscribedGroups) {
      try {
        setSubscribedGroups(JSON.parse(savedSubscribedGroups));
      } catch {
        setSubscribedGroups([]);
      }
    }

    const savedPhone = localStorage.getItem("phoneNumber");
    if (savedPhone) {
      setPhoneNumber(savedPhone);
    }

    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
      fetchUserNameFromServer(savedToken, savedName);
    }
  }, []);

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
      console.error("فشل في جلب بيانات المستخدم:", err);
    }
  };

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "money") {
        setMoney(parseFloat(event.newValue) || 0);
      }
      if (event.key === "subscribedGroups") {
        try {
          const newGroups = JSON.parse(event.newValue);
          if (Array.isArray(newGroups)) {
            setSubscribedGroups(newGroups);
          }
        } catch {
          // ignore parse errors
        }
      }
      if (event.key === "userName") {
        setUserName(event.newValue || "");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
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
  }

  function addSubscribedGroup(groupId) {
    const idStr = groupId.toString();
    if (!subscribedGroups.includes(idStr)) {
      setSubscribedGroups((prev) => [...prev, idStr]);
    }
  }

  function logout() {
    setUserName("");
    setPhoneNumber("");
    setToken("");
    setMoney(0);
    setSubscribedGroups([]);

    localStorage.removeItem("userName");
    localStorage.removeItem("phoneNumber");
    localStorage.removeItem("token");
    localStorage.removeItem("money");
    localStorage.removeItem("subscribedGroups");
    localStorage.removeItem("wallet_balance");
    localStorage.removeItem("studentId");
    localStorage.removeItem("studentDataComplete");
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
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
