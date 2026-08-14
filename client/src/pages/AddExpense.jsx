import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";

const AddExpense = () => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");
  const [expenseName, setExpenseName] = useState("");

  // New states
  const [splitType, setSplitType] = useState("equal");
  const [members, setMembers] = useState([]);
  const [splits, setSplits] = useState({});

  const navigate = useNavigate();
  const { groupId } = useParams();

  // Check authentication and fetch group members
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("You must be logged in to add an expense");
      navigate("/login");
      return;
    }

    const fetchGroup = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/groups/${groupId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const groupMembers = response.data.group.members;

        setMembers(groupMembers);

        // Initialize split amounts
        const initialSplits = {};

        groupMembers.forEach((member) => {
          initialSplits[member._id] = "";
        });

        setSplits(initialSplits);
      } catch (error) {
        console.log("Fetch group error:", error);
        toast.error(
          error.response?.data?.message || "Failed to load group"
        );
      }
    };

    fetchGroup();
  }, [navigate, groupId]);

  // Handle unequal split amount
  const handleSplitChange = (userId, value) => {
    setSplits((prev) => ({
      ...prev,
      [userId]: value,
    }));
  };

  // Calculate total entered in unequal split
  const splitTotal = Object.values(splits).reduce(
    (total, value) => total + (parseFloat(value) || 0),
    0
  );

  const numericAmount = parseFloat(amount) || 0;

  const handleAddExpense = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (!expenseName.trim()) {
      toast.error("Expense name is required");
      return;
    }

    if (!amount.trim()) {
      toast.error("Amount is required");
      return;
    }

    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast.error("Please enter a valid positive number");
      return;
    }

    if (!description.trim()) {
      toast.error("Description is required");
      return;
    }

    // Validate unequal split
    if (splitType === "unequal") {
      if (members.length === 0) {
        toast.error("Group members not found");
        return;
      }

      const hasEmptySplit = members.some(
        (member) =>
          splits[member._id] === "" ||
          splits[member._id] === undefined
      );

      if (hasEmptySplit) {
        toast.error("Enter amount for every member");
        return;
      }

      if (Math.abs(splitTotal - numericAmount) > 0.01) {
        toast.error(
          `Split total must equal ₹${numericAmount}. Current total: ₹${splitTotal}`
        );
        return;
      }
    }

    try {
      setLoading(true);

      let requestData = {
        amount: numericAmount,
        description: description.trim(),
        expenseName: expenseName.trim(),
        splitType,
      };

      // Add unequal split data
      if (splitType === "unequal") {
        requestData.splits = members.map((member) => ({
          user: member._id,
          amount: parseFloat(splits[member._id]),
        }));
      }

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/expenses/${groupId}`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Expense added");

      setAmount("");
      setDescription("");
      setExpenseName("");
      setSplitType("equal");

      const resetSplits = {};
      members.forEach((member) => {
        resetSplits[member._id] = "";
      });

      setSplits(resetSplits);

      navigate("/expenses/" + groupId);
    } catch (error) {
      console.log("FULL ERROR:", error);
      console.log("RESPONSE:", error.response);
      console.log("DATA:", error.response?.data);

      toast.error(
        error.response?.data?.message || "Failed to add expense"
      );
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#f5f6fa",
      fontFamily: "'Segoe UI', Arial, sans-serif",
      padding: "40px 20px",
    },
    container: {
      maxWidth: "480px",
      margin: "0 auto",
    },
    backLink: {
      display: "inline-block",
      marginBottom: "20px",
      color: "#6b7280",
      textDecoration: "none",
      fontSize: "14px",
    },
    card: {
      background: "#fff",
      padding: "36px",
      borderRadius: "12px",
      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
    },
    heading: {
      margin: "0 0 24px 0",
      color: "#1f2937",
      fontSize: "24px",
      fontWeight: 700,
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "16px",
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
      width: "100%",
      boxSizing: "border-box",
    },
    splitTypeWrap: {
      background: "#f9fafb",
      borderRadius: "10px",
      padding: "14px 16px",
    },
    splitTypeTitle: {
      margin: "0 0 10px 0",
      fontSize: "14px",
      fontWeight: 600,
      color: "#374151",
    },
    radioRow: {
      display: "flex",
      gap: "20px",
    },
    radioLabel: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      fontSize: "14px",
      color: "#374151",
      cursor: "pointer",
    },
    unequalBox: {
      background: "#f9fafb",
      borderRadius: "10px",
      padding: "16px",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
    },
    unequalTitle: {
      margin: 0,
      fontSize: "14px",
      fontWeight: 600,
      color: "#374151",
    },
    memberSplitRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "12px",
    },
    memberSplitLabel: {
      fontSize: "14px",
      color: "#374151",
      flex: 1,
    },
    memberSplitInput: {
      width: "110px",
      padding: "8px 10px",
      borderRadius: "6px",
      border: "1px solid #d1d5db",
      fontSize: "14px",
      outline: "none",
      textAlign: "right",
    },
    splitSummary: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: "13px",
      color: "#6b7280",
      paddingTop: "8px",
      borderTop: "1px solid #e5e7eb",
    },
    statusMatch: {
      margin: 0,
      fontSize: "13px",
      fontWeight: 600,
      color: "#16a34a",
    },
    statusExceeds: {
      margin: 0,
      fontSize: "13px",
      fontWeight: 600,
      color: "#dc2626",
    },
    statusRemaining: {
      margin: 0,
      fontSize: "13px",
      fontWeight: 600,
      color: "#d97706",
    },
    button: {
      marginTop: "8px",
      padding: "13px 14px",
      borderRadius: "8px",
      border: "none",
      background: "#4f46e5",
      color: "#fff",
      fontSize: "15px",
      fontWeight: 600,
      cursor: "pointer",
    },
    buttonDisabled: {
      background: "#a5a6f0",
      cursor: "not-allowed",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <Link to={`/groups/${groupId}`} style={styles.backLink}>
          ← Back to Group
        </Link>

        <div style={styles.card}>
          <h2 style={styles.heading}>Add Expense</h2>

          <form onSubmit={handleAddExpense} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Expense Name</label>
              <input
                type="text"
                placeholder="Enter expense name"
                value={expenseName}
                onChange={(e) => setExpenseName(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Amount</label>
              <input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Description</label>
              <input
                type="text"
                placeholder="Enter description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={styles.input}
              />
            </div>

            {/* Split Type */}
            <div style={styles.splitTypeWrap}>
              <p style={styles.splitTypeTitle}>Split Type</p>

              <div style={styles.radioRow}>
                <label style={styles.radioLabel}>
                  <input
                    type="radio"
                    value="equal"
                    checked={splitType === "equal"}
                    onChange={(e) => setSplitType(e.target.value)}
                  />
                  Equal
                </label>

                <label style={styles.radioLabel}>
                  <input
                    type="radio"
                    value="unequal"
                    checked={splitType === "unequal"}
                    onChange={(e) => setSplitType(e.target.value)}
                  />
                  Unequal
                </label>
              </div>
            </div>

            {/* Unequal Split */}
            {splitType === "unequal" && (
              <div style={styles.unequalBox}>
                <p style={styles.unequalTitle}>Enter each person's share</p>

                {members.map((member) => (
                  <div key={member._id} style={styles.memberSplitRow}>
                    <label style={styles.memberSplitLabel}>
                      {member.name || member.username || member.email}
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Amount"
                      value={splits[member._id] || ""}
                      onChange={(e) =>
                        handleSplitChange(member._id, e.target.value)
                      }
                      style={styles.memberSplitInput}
                    />
                  </div>
                ))}

                <div style={styles.splitSummary}>
                  <span>Entered: ₹{splitTotal.toFixed(2)}</span>
                  <span>Total: ₹{numericAmount.toFixed(2)}</span>
                </div>

                {Math.abs(splitTotal - numericAmount) < 0.01 &&
                  numericAmount > 0 && (
                    <p style={styles.statusMatch}>✓ Split amounts match</p>
                  )}

                {splitTotal > numericAmount && (
                  <p style={styles.statusExceeds}>
                    ⚠ Split exceeds total by ₹
                    {(splitTotal - numericAmount).toFixed(2)}
                  </p>
                )}

                {splitTotal < numericAmount && splitTotal > 0 && (
                  <p style={styles.statusRemaining}>
                    Remaining: ₹{(numericAmount - splitTotal).toFixed(2)}
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.button,
                ...(loading ? styles.buttonDisabled : {}),
              }}
            >
              {loading ? "Adding..." : "Add Expense"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddExpense;