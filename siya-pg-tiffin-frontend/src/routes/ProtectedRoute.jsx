import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, role }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  // Not logged in
  if (!user || !token) return <Navigate to="/signin" />;

  // Role check
  if (role && user.role !== role)
    return <Navigate to="/signin" />;

  return children;
};

export default ProtectedRoute;