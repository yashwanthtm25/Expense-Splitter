import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

const Group = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const fetchGroups = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/groups",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setGroups(response.data.groups);
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            "Failed to fetch groups"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [navigate]);

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#f5f6fa",
      fontFamily: "'Segoe UI', Arial, sans-serif",
      padding: "40px 20px",
    },
    container: {
      maxWidth: "600px",
      margin: "0 auto",
    },
    backLink: {
      display: "inline-block",
      marginBottom: "20px",
      color: "#6b7280",
      textDecoration: "none",
      fontSize: "14px",
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
    createButton: {
      padding: "10px 18px",
      borderRadius: "8px",
      border: "none",
      background: "#4f46e5",
      color: "#fff",
      fontSize: "14px",
      fontWeight: 600,
      cursor: "pointer",
    },
    emptyState: {
      background: "#fff",
      borderRadius: "12px",
      padding: "40px 24px",
      textAlign: "center",
      color: "#6b7280",
      fontSize: "15px",
      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
    },
    groupList: {
      display: "flex",
      flexDirection: "column",
      gap: "12px",
    },
    groupCard: {
      background: "#fff",
      borderRadius: "12px",
      padding: "18px 22px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)",
      cursor: "pointer",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      transition: "box-shadow 0.2s ease, transform 0.2s ease",
    },
    groupName: {
      margin: 0,
      fontSize: "17px",
      fontWeight: 600,
      color: "#1f2937",
    },
    chevron: {
      color: "#9ca3af",
      fontSize: "18px",
    },
    loadingText: {
      textAlign: "center",
      color: "#6b7280",
      fontSize: "15px",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <Link to="/dashboard" style={styles.backLink}>
          ← Back to Dashboard
        </Link>

        <div style={styles.topRow}>
          <h1 style={styles.heading}>My Groups</h1>
          <button
            style={styles.createButton}
            onClick={() => navigate("/create-group")}
          >
            + Create Group
          </button>
        </div>

        {loading ? (
          <p style={styles.loadingText}>Loading groups...</p>
        ) : groups.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No groups found. Create one to get started!</p>
          </div>
        ) : (
          <div style={styles.groupList}>
            {groups.map((group) => (
              <div
                key={group._id}
                onClick={() => navigate(`/groups/${group._id}`)}
                style={styles.groupCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 6px 16px rgba(0, 0, 0, 0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(0, 0, 0, 0.06)";
                }}
              >
                <h2 style={styles.groupName}>{group.groupName}</h2>
                <span style={styles.chevron}>→</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Group;