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

  return (
    <div>
      <h1>Login</h1>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          value={email}
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          value={password}
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">
          Login
        </button>
      </form>
      <Link to="/forgot-password">
        Forgot Password?
      </Link>
      <br />
      <Link to="/register">
        Register
      </Link>
    </div>
  );
};

export default Login;