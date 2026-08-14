import { BrowserRouter, Routes, Route } from "react-router-dom";

import Register from "./pages/Register";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import CreateGroup from "./pages/CreateGroup";
import Group from "./pages/Group";
import AddMember from "./pages/AddMember";
import AddExpense from "./pages/AddExpense";
import Expense from "./pages/Expense";
import EditExpense from "./pages/EditExpense";
import GroupDetails from "./pages/GroupDetails";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />
        <Route
          path="/reset-password/:token"
          element={<ResetPassword />}
        />

        {/* Protected Route */}
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />
        <Route
      path="/create-group"
      element={<CreateGroup />}
    />
        <Route 
        path="/groups" 
        element={<Group />} />
        <Route
          path="/add-member/:groupId"
          element={<AddMember />}
        />
        <Route
          path="/add-expense/:groupId"
          element={<AddExpense />}
        />
        <Route
          path="/expenses/:groupId"
          element={<Expense />}
        />
        <Route
          path="/edit-expense/:expenseId"
          element={<EditExpense />}
        />
        <Route
          path="/groups/:groupId"
          element={<GroupDetails />}
        />
      </Routes>

    </BrowserRouter>
  );
}

export default App;