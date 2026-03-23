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

// Admin Pages
import Dashboard from "./components/Dashboard";
import Rooms from "./Pages/admin/Rooms";
import Users from "./Pages/admin/Users";
import TiffinPlans from "./Pages/admin/TiffinPlans";
import Orders from "./Pages/admin/Orders";
import Billing from "./Pages/admin/Billing";
import GenerateBills from "./Pages/admin/GenerateBills";
import Reports from "./Pages/admin/Reports";
import Queries from "./Pages/admin/Queries";
import Settings from "./Pages/admin/Settings";

// Student Pages
import StudentDashboard from "./Pages/student/StudentDashboard";
import MyRoom from "./Pages/student/MyRoom";
import RoomBills from "./Pages/student/RoomBills";
import MessMenu from "./Pages/student/MessMenu";
import RaiseQuery from "./Pages/student/RaiseQuery";
import Profile from "./Pages/student/Profile";

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
          <Route path="mess-menu" element={<MessMenu />} />
          <Route path="raise-query" element={<RaiseQuery />} />
          <Route path="profile" element={<Profile />} />
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
        <Route path="*" element={<div>Page Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;