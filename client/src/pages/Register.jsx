import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/register`,
        {
          name,
          email,
          password,
        }
      );

      toast.success(response.data.message);

      // Store JWT
      localStorage.setItem("token", response.data.token);

      // Go to dashboard
      navigate("/dashboard");

    } catch (error) {
      toast.error(
        error.response?.data?.message || "Registration failed"
      );
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
        <h1 style={styles.heading}>Register</h1>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
              style={styles.input}
            />
          </div>

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

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              style={styles.input}
            />
          </div>

          <button type="submit" style={styles.button}>
            Register
          </button>
        </form>

        <p style={styles.footerText}>
          Already have an account?{" "}
          <Link to="/login" style={styles.link}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;