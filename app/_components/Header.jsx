"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Link from "next/link";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function Header() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navLinks = [
    {
      id: 2,
      name: "Add Doctor",
      path: "/addDoctor",
    },
    {
      id: 3,
      name: "Upload Prescription",
      path: "/prescriptions",
    },
  ];
  const handleMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };
  

  return (
    <nav className="p-3 flex justify-between bg-white items-center shadow-sm text-black">
      <a href="/dashboard" className="flex items-center gap-2">
        <Image
          src="/asset5.jpg"
          className="object-cover max-w-12 max-h-12"
          width={180}
          height={80}
          alt="logo"
        />
        <span className="text-lg font-medium font-display">Healthily</span>
      </a>
      <ul className="hidden md:flex gap-12 font-body font-medium">
        {navLinks.map((item, index) => (
          <Link href={item.path} key={item.id}>
            <li className="hover:scale-105 ease-in-out  hover:text-primary cursor-pointer">
              {item.name}
            </li>
          </Link>
        ))}
      </ul>
      <div className={`flex align-middle border-2 rounded-full`}>
        <Popover>
          <PopoverTrigger>
            <Image
              width={40}
              height={40}
              src="/profile.jpg" // Default profile image
              alt="profile-pic"
              className="rounded-full"
            />
          </PopoverTrigger>
          <PopoverContent className="w-44">
            <ul className="flex flex-col font-display">
             
              <Link href="/appointment-history"> 
                <li className="cursor-pointer hover:bg-slate-300 p-2 rounded-md">
                  Appointment History
                </li>
              </Link>
              <li className="cursor-pointer hover:bg-slate-300 p-2 rounded-md">
                
                Log Out
              </li>
            </ul>
          </PopoverContent>
        </Popover>

        <button className="p-2 md:hidden" onClick={handleMenu}>
          <i className="fa-solid fa-bars text-gray-500"></i>
        </button>
      </div>

      {showMobileMenu && (
        <div
          className={`fixed inset-0 bg-white z-50 transition-transform duration-300 ${
            showMobileMenu ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex justify-between items-center mb-4 shadow-sm p-3">
            <a href="/dashboard" className="flex items-center gap-2"> {/* Changed from "/" to "/dashboard" to match top logo */}
              <Image
                src="/asset5.jpg"
                className="object-cover max-w-12 max-h-12"
                width={180}
                height={80}
                alt="logo"
              />
              <span className="text-lg font-medium font-display">Healthily</span>
            </a>
            <button className="p-2" onClick={handleMenu}>
              <i className="fa-solid fa-xmark text-gray-500"></i>
            </button>
          </div>
          <ul className="flex flex-col gap-4 font-body font-medium mt-5 p-3">
            {navLinks.map((item) => (
              <Link href={item.path} key={item.id}>
                <li
                  className="hover:text-primary cursor-pointer"
                  onClick={handleMenu} 
                >
                  {item.name}
                </li>
              </Link>
            ))}
             \
            <Link href="/appointment-history">
                <li className="hover:text-primary cursor-pointer" onClick={handleMenu}>
                  Appointment History
                </li>
            </Link>
            <li className="hover:text-primary cursor-pointer" onClick={() => {  handleMenu(); }}>
                Log Out
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}

export default Header;