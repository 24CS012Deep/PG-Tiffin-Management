import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./Pages/Home";
import SignIn from "./Pages/SignIn";
import SignUp from "./Pages/SignUp";
import ForgotPassword from "./Pages/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword";

/* Layout Component */
function Layout() {
  const location = useLocation();

  // Pages where navbar should NOT show
  const hideNavbarRoutes = ["/signin", "/signup", "/forgot"];

  const hideNavbar = hideNavbarRoutes.includes(location.pathname) ||
    location.pathname.startsWith("/reset-password");

  return (
    <>
      {!hideNavbar && <Navbar />}

      <div className={!hideNavbar ? "pt-20" : ""}>
        <Routes>
          <Route path="/" element={<Home />} />

          {/* AUTH ROUTES */}
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/forgot" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;
