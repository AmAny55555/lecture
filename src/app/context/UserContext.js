"use client";

import { createContext, useState, useContext, useEffect } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userName, setUserName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [token, setToken] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("userName");
      const storedPhone = localStorage.getItem("phoneNumber");
      const storedToken = localStorage.getItem("token");
      const storedBalance = localStorage.getItem("wallet_balance");

      console.log("UserProvider loaded userName:", storedName);

      if (storedName) setUserName(storedName);
      if (storedPhone) setPhoneNumber(storedPhone);
      if (storedToken) setToken(storedToken);
      if (storedBalance) setWalletBalance(parseFloat(storedBalance));
    }
  }, []);

  const login = ({ userName, phoneNumber, token, walletBalance }) => {
    setUserName(userName || "");
    setPhoneNumber(phoneNumber || "");
    setToken(token || null);
    setWalletBalance(walletBalance !== undefined ? walletBalance : 0);

    if (typeof window !== "undefined") {
      if (userName) localStorage.setItem("userName", userName);
      if (phoneNumber) localStorage.setItem("phoneNumber", phoneNumber);
      if (token) localStorage.setItem("token", token);
      if (walletBalance !== undefined)
        localStorage.setItem("wallet_balance", walletBalance);
    }
  };

  const logout = () => {
    setUserName("");
    setPhoneNumber("");
    setToken(null);
    setWalletBalance(0);

    if (typeof window !== "undefined") {
      localStorage.removeItem("userName");
      localStorage.removeItem("phoneNumber");
      localStorage.removeItem("token");
      localStorage.removeItem("wallet_balance");
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
        walletBalance,
        setWalletBalance,
        login,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
