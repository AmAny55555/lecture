"use client";

import { createContext, useState, useContext, useEffect } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userName, setUserName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [token, setToken] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("userName");
      const storedPhone = localStorage.getItem("phoneNumber");
      const storedToken = localStorage.getItem("token");

      if (storedName) setUserName(storedName);
      if (storedPhone) setPhoneNumber(storedPhone);
      if (storedToken) setToken(storedToken);
    }
  }, []);

  // دالة لحفظ كل البيانات في localStorage وتحديث ال state دفعة واحدة
  const login = ({ userName, phoneNumber, token }) => {
    setUserName(userName);
    setPhoneNumber(phoneNumber);
    setToken(token);

    if (typeof window !== "undefined") {
      localStorage.setItem("userName", userName);
      localStorage.setItem("phoneNumber", phoneNumber);
      localStorage.setItem("token", token);
    }
  };

  // دالة لتسجيل الخروج ومسح البيانات
  const logout = () => {
    setUserName("");
    setPhoneNumber("");
    setToken(null);

    if (typeof window !== "undefined") {
      localStorage.removeItem("userName");
      localStorage.removeItem("phoneNumber");
      localStorage.removeItem("token");
      localStorage.removeItem("student_data");
    }
  };

  return (
    <UserContext.Provider
      value={{
        userName,
        setUserName,
        phoneNumber,
        setPhoneNumber,
        token,
        setToken,
        login,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
