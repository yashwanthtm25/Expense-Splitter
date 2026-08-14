import { useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

const ResetPassword = () => {
  const { token } = useParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/reset-password/${token}`,
        {
          password,
        }
      );

      toast.success(response.data.message);

      // Password has been successfully reset
      navigate("/login");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Invalid or expired reset link"
      );
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    page: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f5f6fa",
      fontFamily: "'Segoe UI', Arial, sans-serif",
    },
    card: {
      background: "#fff",
      padding: "40px 36px",
      borderRadius: "12px",
      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
      width: "100%",
      maxWidth: "380px",
    },
    heading: {
      textAlign: "center",
      marginBottom: "28px",
      color: "#1f2937",
      fontSize: "26px",
      fontWeight: 700,
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "18px",
    },
    field: {
      display: "flex",
      flexDirection: "column",
      gap: "6px",
    },
    label: {
      fontSize: "14px",
      fontWeight: 600,
      color: "#374151",
    },
    input: {
      padding: "12px 14px",
      borderRadius: "8px",
      border: "1px solid #d1d5db",
      fontSize: "15px",
      outline: "none",
      transition: "border-color 0.2s ease",
    },
    button: {
      marginTop: "8px",
      padding: "12px 14px",
      borderRadius: "8px",
      border: "none",
      background: "#4f46e5",
      color: "#fff",
      fontSize: "15px",
      fontWeight: 600,
      cursor: "pointer",
      transition: "background 0.2s ease",
    },
    buttonDisabled: {
      background: "#a5a6f0",
      cursor: "not-allowed",
    },
    footerText: {
      textAlign: "center",
      marginTop: "20px",
      fontSize: "14px",
      color: "#4b5563",
    },
    link: {
      color: "#4f46e5",
      textDecoration: "none",
      fontWeight: 600,
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.heading}>Reset Password</h1>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
              style={styles.input}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {}),
            }}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <p style={styles.footerText}>
          Remember your password?{" "}
          <Link to="/login" style={styles.link}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;