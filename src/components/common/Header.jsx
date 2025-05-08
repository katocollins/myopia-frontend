// src/components/common/Header.jsx
import React from "react";
import Logo from "../../assets/logo.png";

const Header = () => {
  return (
    <div className="flex flex-col items-center mb-16 mt-4">
      <div className="relative w-28 h-28 sm:w-32 sm:h-32 mb-4">
        <img
          src={Logo}
          alt="Myopia Detection Logo"
          className="object-contain w-full h-full"
        />
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-blue-500 uppercase text-center">
        Myopia Detection
      </h1>
    </div>
  );
};

export default Header;
