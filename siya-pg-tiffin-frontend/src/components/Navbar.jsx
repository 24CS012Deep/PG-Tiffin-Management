import { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const navLink =
    "group relative text-gray-700 hover:text-orange-500 transition";

  return (
    <>
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 w-full h-16 z-50 bg-white/90 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          {/* LOGO */}
          <Link to="/" className="text-2xl font-bold text-orange-500">
            SwadBox
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center gap-10 font-medium">
            {/* HOME */}
            <Link to="/" className={navLink}>
              Home
              <span className="absolute left-0 bottom-[-5px] h-[2px] bg-orange-500 w-0 transition-all duration-300 group-hover:w-full"></span>
            </Link>

            {/* ABOUT */}
            <Link to="/about" className={navLink}>
              About Us
              <span className="absolute left-0 bottom-[-5px] h-[2px] bg-orange-500 w-0 transition-all duration-300 group-hover:w-full"></span>
            </Link>

            {/* SERVICES */}
            <a href="#services" className={navLink}>
              Services
              <span className="absolute left-0 bottom-[-5px] h-[2px] bg-orange-500 w-0 transition-all duration-300 group-hover:w-full"></span>
            </a>

            {/* SIGNUP FIRST */}
            <Link to="/signup" className={navLink}>
              Sign Up
               <span className="absolute left-0 bottom-[-5px] h-[2px] bg-orange-500 w-0 transition-all duration-300 group-hover:w-full"></span>
            </Link>

          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={() => setOpen(true)}
            className="md:hidden text-2xl text-gray-700"
          >
            <FaBars />
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

      {/* SIDEBAR */}
      <aside
        className={`fixed top-0 right-0 h-full w-64 bg-white z-50 shadow-lg transform transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 flex flex-col h-full">
          <button
            onClick={() => setOpen(false)}
            className="self-end text-2xl mb-6"
          >
            <FaTimes />
          </button>

          <nav className="flex flex-col gap-6 text-lg font-medium text-gray-700">
            <Link to="/" onClick={() => setOpen(false)}>
              Home
            </Link>
            <Link to="/about" onClick={() => setOpen(false)}>
              About Us
            </Link>
            <a href="#services" onClick={() => setOpen(false)}>
              Services
            </a>
            <Link to="/signin" onClick={() => setOpen(false)}>
              Sign In
            </Link>
          </nav>

          <div className="mt-auto text-sm text-gray-400">© 2026 SwadBox</div>
        </div>
      </aside>
    </>
  );
}
