import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Dashboard = () => {
  const [user, setUser] = useState(null);

  const [balance, setBalance] = useState({
    amountOwed: 0,
    amountReceive: 0,
    netBalance: 0,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // -----------------------------
      // Fetch user profile
      // -----------------------------
      try {
        const response = await axios.get(
          "http://localhost:5000/api/auth/getprofile",
          config
        );

        setUser(response.data.user);
      } catch (error) {
        console.error("Profile error:", error);

        localStorage.removeItem("token");

        toast.error(
          error.response?.data?.message || "Authentication failed"
        );

        navigate("/login");
        return;
      }

      // -----------------------------
      // Fetch balance
      // -----------------------------
      try {
        const response = await axios.get(
          "http://localhost:5000/api/expenses/getmybalance",
          config
        );

        console.log("Balance response:", response.data);

        setBalance({
          amountOwed: response.data.amountOwed || 0,
          amountReceive: response.data.amountReceive || 0,
          netBalance: response.data.netBalance || 0,
        });
      } catch (error) {
        console.error("Balance error:", error);

        toast.error(
          error.response?.data?.message || "Failed to load balance"
        );

      }
    };

    fetchDashboardData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Dashboard</h1>

      <h2>Welcome, {user.name}</h2>

      <p>Email: {user.email}</p>

      {/* Balance Summary */}
      <div>
        <h2>Balance Summary</h2>

        <div>
          <h3>Amount Owed</h3>
          <p>₹{balance.amountOwed.toFixed(2)}</p>
        </div>

        <div>
          <h3>Amount to Receive</h3>
          <p>₹{balance.amountReceive.toFixed(2)}</p>
        </div>

        <div>
          <h3>Net Balance</h3>
          <p>₹{balance.netBalance.toFixed(2)}</p>
        </div>
      </div>

      <button onClick={() => navigate("/create-group")}>
        Create Group
      </button>

      <button onClick={() => navigate("/groups")}>
        View My Groups
      </button>

      <button onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default Dashboard;