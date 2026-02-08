import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* TOP NAVBAR */}
      <nav className="fixed top-0 left-0 w-full h-16 z-50 bg-white/90 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">

          {/* Logo */}
          <h1 className="text-2xl font-bold text-orange-500">
            SwadBox
          </h1>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8 text-gray-700 font-medium">
            <a href="#home" className="hover:text-orange-500 transition">
              Home
            </a>
            <a href="#about" className="hover:text-orange-500 transition">
              About Us
            </a>
            <a href="#signup" className="hover:text-orange-500 transition">
              Sign Up
            </a>
            <a href="#logout" className="hover:text-orange-500 transition">
              Logout
            </a>
          </div>

          {/* Mobile Explore Button */}
          <button
            onClick={() => setOpen(true)}
            className="md:hidden text-gray-700 text-xl"
          >
            ☰
          </button>
        </div>
      </nav>

      {/* OVERLAY */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* SIDEBAR (MOBILE) */}
      <aside
        className={`fixed top-0 right-0 h-full w-64 bg-white z-50 shadow-lg transform transition-transform duration-300
        ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="p-6 flex flex-col h-full">

          {/* Close */}
          <button
            onClick={() => setOpen(false)}
            className="self-end text-2xl mb-6"
          >
            ✖
          </button>

          {/* Sidebar Menu */}
          <nav className="flex flex-col gap-6 text-lg font-medium text-gray-700">
            <a href="#home" className="hover:text-orange-500">
              Home
            </a>
            <a href="#about" className="hover:text-orange-500">
              About Us
            </a>
            <a href="#signup" className="hover:text-orange-500">
              Sign Up
            </a>
            <a href="#logout" className="hover:text-orange-500">
              Logout
            </a>
          </nav>

          {/* Footer */}
          <div className="mt-auto text-sm text-gray-400">
            © 2026 SwadBox
          </div>
        </div>
      </aside>
    </>
  );
}
