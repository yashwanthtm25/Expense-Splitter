import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

const CreateGroup = () => {
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("You must be logged in to create a group");
      navigate("/login");
    }
  }, [navigate]);

  const handleCreateGroup = async (e) => {
    e.preventDefault();

    if (!groupName.trim()) {
      toast.error("Group name is required");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/groups`,
        {
          groupName: groupName.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(response.data.message);

      setGroupName("");

      navigate("/groups");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create group"
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
    backLink: {
      display: "inline-block",
      marginBottom: "20px",
      color: "#6b7280",
      textDecoration: "none",
      fontSize: "14px",
    },
    heading: {
      textAlign: "center",
      marginBottom: "8px",
      color: "#1f2937",
      fontSize: "26px",
      fontWeight: 700,
    },
    description: {
      textAlign: "center",
      marginBottom: "28px",
      color: "#6b7280",
      fontSize: "14px",
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
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <Link to="/dashboard" style={styles.backLink}>
          ← Back to Dashboard
        </Link>

        <h1 style={styles.heading}>Create Group</h1>
        <p style={styles.description}>
          Give your group a name to get started
        </p>

        <form onSubmit={handleCreateGroup} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Group Name</label>
            <input
              type="text"
              placeholder="Enter group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
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
            {loading ? "Creating..." : "Create Group"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateGroup;