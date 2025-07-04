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
  }

  function logout() {
    setUserName("");
    setPhoneNumber("");
    setToken("");
    setMoney(0);
    setSubscribedGroups([]);
    localStorage.clear();
  }

  function addSubscribedGroup(groupId) {
    const idStr = groupId.toString();
    if (!subscribedGroups.includes(idStr)) {
      setSubscribedGroups((prev) => [...prev, idStr]);
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
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
