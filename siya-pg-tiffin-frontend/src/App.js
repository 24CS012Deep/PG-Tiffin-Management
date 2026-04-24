import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminLayout from "./components/AdminLayout";
import StudentLayout from "./components/StudentLayout";
import CustomerLayout from "./components/CustomerLayout";

// Public Pages
import Home from "./Pages/Home";
import Contact from "./Pages/Contact";
import SignUp from "./Pages/SignUp";
import SignIn from "./Pages/SignIn";
import ForgotPassword from "./Pages/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword";
import PGGallery from "./Pages/PGGallery";
import TodayMenu from "./Pages/TodayMenu";

// Admin Pages
import Dashboard from "./components/Dashboard";
import Rooms from "./Pages/admin/Rooms";
import Users from "./Pages/admin/Users";
import TiffinPlans from "./Pages/admin/TiffinPlans";
import Orders from "./Pages/admin/Orders";
import Billing from "./Pages/admin/Billing";
import GenerateBills from "./Pages/admin/GenerateBills";
import FoodTracker from "./Pages/admin/FoodTracker";
import Reports from "./Pages/admin/Reports";
import Queries from "./Pages/admin/Queries";
import Settings from "./Pages/admin/Settings";

// Student Pages
import StudentDashboard from "./Pages/student/StudentDashboard";
import MyRoom from "./Pages/student/MyRoom";
import RoomBills from "./Pages/student/RoomBills";
import RaiseQuery from "./Pages/student/RaiseQuery";
import Profile from "./Pages/student/Profile";
import StudentMyOrders from "./Pages/student/MyOrders";

// Customer Pages
import CustomerDashboard from "./Pages/customer/CustomerDashboard";
import CustomerMyOrders from "./Pages/customer/MyOrders";
import CustomerMyBills from "./Pages/customer/MyBills";
import CustomerTiffinPlans from "./Pages/customer/TiffinPlans";
import CustomerRaiseQuery from "./Pages/customer/RaiseQuery";
import CustomerProfile from "./Pages/customer/Profile";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/pg-gallery" element={<PGGallery />} />
        <Route path="/todays-menu" element={<TodayMenu />} />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="rooms" element={<Rooms />} />
          <Route path="users" element={<Users />} />
          <Route path="tiffin" element={<TiffinPlans />} />
          <Route path="orders" element={<Orders />} />
          <Route path="billing" element={<Billing />} />
          <Route path="generate-bills" element={<GenerateBills />} />
          <Route path="food-tracker" element={<FoodTracker />} />
          <Route path="reports" element={<Reports />} />
          <Route path="queries" element={<Queries />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Student Routes - FIXED */}
        <Route path="/student" element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentLayout />
          </ProtectedRoute>
        }>
          <Route index element={<StudentDashboard />} />
          <Route path="my-room" element={<MyRoom />} />
          <Route path="bills" element={<RoomBills />} />
          <Route path="raise-query" element={<RaiseQuery />} />
          <Route path="profile" element={<Profile />} />
          <Route path="orders" element={<StudentMyOrders />} />
        </Route>

        {/* Customer Routes */}
        <Route path="/customer" element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <CustomerLayout />
          </ProtectedRoute>
        }>
          <Route index element={<CustomerDashboard />} />
          <Route path="my-orders" element={<CustomerMyOrders />} />
          <Route path="my-bills" element={<CustomerMyBills />} />
          <Route path="tiffin-plans" element={<CustomerTiffinPlans />} />
          <Route path="raise-query" element={<CustomerRaiseQuery />} />
          <Route path="profile" element={<CustomerProfile />} />
        </Route>

        {/* Catch-all route for 404 */}
        <Route path="*" element={
          <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#fff7ed", fontFamily: "sans-serif", textAlign: "center", padding: "2rem" }}>
            <div style={{ fontSize: "6rem", fontWeight: "900", color: "#f97316", lineHeight: 1 }}>404</div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: "700", color: "#1f2937", margin: "1rem 0 0.5rem" }}>Page Not Found</h1>
            <p style={{ color: "#6b7280", marginBottom: "2rem", maxWidth: "360px" }}>The page you're looking for doesn't exist or has been moved.</p>
            <a href="/" style={{ background: "#f97316", color: "#fff", padding: "0.75rem 2rem", borderRadius: "0.75rem", fontWeight: "600", textDecoration: "none", fontSize: "0.95rem" }}>Go to Home</a>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;