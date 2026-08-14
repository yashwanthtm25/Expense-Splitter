import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const checkAuthentication = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      try {
        console.log(token);
        await axios.get(
          "http://localhost:5000/api/auth/getprofile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Token is valid
        navigate("/dashboard");
      } catch (error) {
        // Token is invalid/expired
        localStorage.removeItem("token");
      }
    };

    checkAuthentication();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email,
          password,
        }
      );

      localStorage.setItem("token", response.data.token);

      toast.success("Login successful");

      navigate("/dashboard");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Login failed"
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
    logoWrap: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      marginBottom: "24px",
    },
    logoIcon: {
      width: "52px",
      height: "52px",
      borderRadius: "14px",
      background: "linear-gradient(135deg, #4f46e5, #6366f1)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: "12px",
      boxShadow: "0 6px 16px rgba(79, 70, 229, 0.25)",
    },
    appName: {
      margin: 0,
      fontSize: "22px",
      fontWeight: 800,
      color: "#1f2937",
      letterSpacing: "-0.01em",
    },
    appNameAccent: {
      color: "#4f46e5",
    },
    appTagline: {
      margin: "4px 0 0 0",
      fontSize: "13px",
      color: "#9ca3af",
      fontWeight: 500,
    },
    heading: {
      textAlign: "center",
      marginBottom: "28px",
      color: "#1f2937",
      fontSize: "20px",
      fontWeight: 700,
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "16px",
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
    linksRow: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: "20px",
      fontSize: "14px",
    },
    link: {
      color: "#4f46e5",
      textDecoration: "none",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* =================================================
            LOGO / APP NAME
        ================================================= */}

        <div style={styles.logoWrap}>
          <div style={styles.logoIcon}>
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2v20M17 5.5c0-1.93-2.24-3.5-5-3.5S7 3.57 7 5.5 9.24 9 12 9s5 1.57 5 3.5-2.24 3.5-5 3.5-5-1.57-5-3.5"
                stroke="#ffffff"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h1 style={styles.appName}>
            Split<span style={styles.appNameAccent}>Ease</span>
          </h1>

          <p style={styles.appTagline}>Split bills. Settle up. Stay friends.</p>
        </div>

        <h2 style={styles.heading}>Log in to your account</h2>

        <form onSubmit={handleLogin} style={styles.form}>
          <input
            type="email"
            value={email}
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />

          <input
            type="password"
            value={password}
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />

          <button type="submit" style={styles.button}>
            Login
          </button>
        </form>

        <div style={styles.linksRow}>
          <Link to="/forgot-password" style={styles.link}>
            Forgot Password?
          </Link>
          <Link to="/register" style={styles.link}>
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;