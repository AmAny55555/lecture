"use client";
import React from "react";
import Select from "react-select";

function SelectWrapper({ field, options, placeholder, loading = false }) {
  const customStyles = {
    menu: (provided) => ({
      ...provided,
      backgroundColor: "white",
      color: "black",
      zIndex: 9999,
    }),
    control: (provided, state) => ({
      ...provided,
      borderRadius: "12px",
      borderColor: state.isFocused ? "black" : "#ddd",
      minHeight: "40px",
      boxShadow: state.isFocused ? "0 0 0 1px black" : null,
      backgroundColor: "white",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "black",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#999",
      textAlign: "right",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? "#eee" : "white",
      color: "black",
      textAlign: "right",
      cursor: "pointer",
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: "gray",
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
  };

  return (
    <Select
      {...field}
      options={options}
      styles={customStyles}
      isRtl
      placeholder={placeholder}
      isLoading={loading}
      onChange={(val) => field.onChange(val)}
    />
  );
}

export default SelectWrapper;
