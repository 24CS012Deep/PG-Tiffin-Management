import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const isAuthenticated = user && token;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload(); // Force full reload to clear all states
  };

  const navLink = "group relative text-gray-700 font-semibold hover:text-orange-500 transition";

  return (
    <>
      <nav className="fixed top-0 left-0 w-full h-16 z-50 bg-white/90 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-orange-500">
            SwadBox
          </Link>

          <div className="hidden md:flex items-center gap-10 font-medium">
            <Link to="/" className={navLink}>
              Home
              <span className="absolute left-0 bottom-[-5px] h-[2px] bg-orange-500 w-0 transition-all duration-300 group-hover:w-full"></span>
            </Link>

            {/* CONTACT US */}
            <Link to="/contact" className={navLink}>
              Contact Us
              <span className="absolute left-0 bottom-[-5px] h-[2px] bg-orange-500 w-0 transition-all duration-300 group-hover:w-full"></span>
            </Link>

            {isAuthenticated ? (
              <>
                {/* DASHBOARD (when logged in) */}
                <Link to={`/${user.role === "admin" ? "admin" : user.role === "student" ? "student" : "customer"}`} className={navLink}>
                  Dashboard
                  <span className="absolute left-0 bottom-[-5px] h-[2px] bg-orange-500 w-0 transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-orange-500 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-orange-600 transition shadow-lg shadow-orange-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center">
                <Link to="/signin" className="bg-orange-500 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-orange-600 transition shadow-[0_4px_15px_rgba(249,115,22,0.3)] hover:-translate-y-0.5">
                  Sign In
                </Link>
              </div>
            )}
          </div>

          <button onClick={() => setOpen(true)} className="md:hidden text-2xl text-gray-700">
            <FaBars />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {open && <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setOpen(false)} />}

      {/* Mobile Menu Sidebar */}
      <aside className={`fixed top-0 right-0 h-full w-64 bg-white z-50 shadow-lg transform transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="p-6 flex flex-col h-full">
          <button onClick={() => setOpen(false)} className="self-end text-2xl mb-6">
            <FaTimes />
          </button>

          <nav className="flex flex-col gap-6 text-lg font-medium text-gray-700">
            <Link to="/" onClick={() => setOpen(false)}>Home</Link>
            <Link to="/contact" onClick={() => setOpen(false)}>Contact Us</Link>
            {isAuthenticated ? (
              <>
                <Link to={`/${user.role === "admin" ? "admin" : user.role === "student" ? "student" : "customer"}`} onClick={() => setOpen(false)} className="text-gray-700 hover:text-orange-500 font-semibold">Dashboard</Link>
                <button onClick={handleLogout} className="text-left text-red-500 font-bold hover:text-red-600 mt-2">Logout</button>
              </>
            ) : (
              <div className="pt-4 border-t border-gray-100">
                <Link to="/signin" onClick={() => setOpen(false)} className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition shadow-lg block text-center mt-2">Sign In</Link>
              </div>
            )}
          </nav>

          <div className="mt-auto text-sm text-gray-400 text-center font-medium">© 2026 SwadBox</div>
        </div>
      </aside>
    </>
  );
}