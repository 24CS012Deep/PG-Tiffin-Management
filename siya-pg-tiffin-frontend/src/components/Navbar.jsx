import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const navLink = "group relative text-gray-700 hover:text-orange-500 transition";

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

            {user ? (
              <>
                {/* DASHBOARD (when logged in) */}
                <Link to={`/${user.role}`} className={navLink}>
                  Dashboard
                  <span className="absolute left-0 bottom-[-5px] h-[2px] bg-orange-500 w-0 transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                {/* SIGN UP */}
                <Link to="/signup" className={navLink}>
                  Sign Up
                  <span className="absolute left-0 bottom-[-5px] h-[2px] bg-orange-500 w-0 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </>
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
            
            {user ? (
              <>
                <Link to={`/${user.role}`} onClick={() => setOpen(false)}>Dashboard</Link>
                <button onClick={handleLogout} className="text-left text-red-500">Logout</button>
              </>
            ) : (
              <Link to="/signup" onClick={() => setOpen(false)}>Sign Up</Link>
            )}
          </nav>

          <div className="mt-auto text-sm text-gray-400">© 2026 SwadBox</div>
        </div>
      </aside>
    </>
  );
}