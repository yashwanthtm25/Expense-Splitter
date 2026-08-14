import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await axios.post(
        "${import.meta.env.VITE_API_URL}/api/auth/forgot-password",
        {
          email,
        }
      );

      toast.success(response.data.message);
      setEmail("");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Something went wrong. Please try again."
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
      marginBottom: "12px",
      color: "#1f2937",
      fontSize: "26px",
      fontWeight: 700,
    },
    description: {
      textAlign: "center",
      marginBottom: "28px",
      color: "#6b7280",
      fontSize: "14px",
      lineHeight: 1.5,
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
        <h1 style={styles.heading}>Forgot Password</h1>

        <p style={styles.description}>
          Enter your registered email address and we will send you
          a password reset link.
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
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
            {loading ? "Sending..." : "Send Reset Link"}
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

export default ForgotPassword;