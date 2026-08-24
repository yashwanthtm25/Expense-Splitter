import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Notifications from "../components/Notifications.jsx";

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
          `${import.meta.env.VITE_API_URL}/api/auth/getprofile`,
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
          `${import.meta.env.VITE_API_URL}/api/expenses/getmybalance`,
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

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#f5f6fa",
      fontFamily: "'Segoe UI', Arial, sans-serif",
      padding: "40px 20px",
    },
    container: {
      maxWidth: "720px",
      margin: "0 auto",
    },
    topRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "24px",
    },
    heading: {
      color: "#1f2937",
      fontSize: "26px",
      fontWeight: 700,
      margin: 0,
    },
    logoutButton: {
      padding: "10px 18px",
      borderRadius: "8px",
      border: "1px solid #d1d5db",
      background: "#fff",
      color: "#374151",
      fontSize: "14px",
      fontWeight: 600,
      cursor: "pointer",
    },
    welcomeCard: {
      background: "#fff",
      padding: "24px 28px",
      borderRadius: "12px",
      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
      marginBottom: "20px",
    },
    welcomeTitle: {
      margin: "0 0 6px 0",
      fontSize: "20px",
      color: "#1f2937",
    },
    emailText: {
      margin: 0,
      fontSize: "14px",
      color: "#6b7280",
    },
    balanceCard: {
      background: "#fff",
      padding: "24px 28px",
      borderRadius: "12px",
      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
      marginBottom: "20px",
    },
    balanceTitle: {
      margin: "0 0 18px 0",
      fontSize: "18px",
      color: "#1f2937",
    },
    balanceGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
      gap: "16px",
    },
    balanceBox: {
      background: "#f9fafb",
      borderRadius: "10px",
      padding: "16px",
      textAlign: "center",
    },
    balanceLabel: {
      margin: "0 0 8px 0",
      fontSize: "13px",
      color: "#6b7280",
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.03em",
    },
    balanceValueOwed: {
      margin: 0,
      fontSize: "22px",
      fontWeight: 700,
      color: "#dc2626",
    },
    balanceValueReceive: {
      margin: 0,
      fontSize: "22px",
      fontWeight: 700,
      color: "#16a34a",
    },
    balanceValueNet: {
      margin: 0,
      fontSize: "22px",
      fontWeight: 700,
      color: "#1f2937",
    },
    actionsRow: {
      display: "flex",
      gap: "14px",
      flexWrap: "wrap",
    },
    primaryButton: {
      flex: "1 1 160px",
      padding: "14px 18px",
      borderRadius: "8px",
      border: "none",
      background: "#4f46e5",
      color: "#fff",
      fontSize: "15px",
      fontWeight: 600,
      cursor: "pointer",
    },
    secondaryButton: {
      flex: "1 1 160px",
      padding: "14px 18px",
      borderRadius: "8px",
      border: "1px solid #4f46e5",
      background: "#fff",
      color: "#4f46e5",
      fontSize: "15px",
      fontWeight: 600,
      cursor: "pointer",
    },
    loadingWrap: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f5f6fa",
      fontFamily: "'Segoe UI', Arial, sans-serif",
      color: "#6b7280",
      fontSize: "16px",
    },
  };

  if (!user) {
    return <div style={styles.loadingWrap}>Loading...</div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.topRow}>
          <h1 style={styles.heading}>Dashboard</h1>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Notifications />
            <button style={styles.logoutButton} onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        <div style={styles.welcomeCard}>
          <h2 style={styles.welcomeTitle}>Welcome, {user.name}</h2>
          <p style={styles.emailText}>{user.email}</p>
        </div>

        <div style={styles.balanceCard}>
          <h3 style={styles.balanceTitle}>Balance Summary</h3>

          <div style={styles.balanceGrid}>
            <div style={styles.balanceBox}>
              <p style={styles.balanceLabel}>Amount Owed</p>
              <p style={styles.balanceValueOwed}>
                ₹{balance.amountOwed.toFixed(2)}
              </p>
            </div>

            <div style={styles.balanceBox}>
              <p style={styles.balanceLabel}>Amount to Receive</p>
              <p style={styles.balanceValueReceive}>
                ₹{balance.amountReceive.toFixed(2)}
              </p>
            </div>

            <div style={styles.balanceBox}>
              <p style={styles.balanceLabel}>Net Balance</p>
              <p style={styles.balanceValueNet}>
                ₹{balance.netBalance.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div style={styles.actionsRow}>
          <button
            style={styles.primaryButton}
            onClick={() => navigate("/create-group")}
          >
            Create Group
          </button>

          <button
            style={styles.secondaryButton}
            onClick={() => navigate("/groups")}
          >
            View My Groups
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;