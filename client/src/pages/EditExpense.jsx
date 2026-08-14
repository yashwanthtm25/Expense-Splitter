import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

const EditExpense = () => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [expenseName, setExpenseName] = useState("");

  const [splits, setSplits] = useState([]);
  const [originalSplits, setOriginalSplits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [paidBy, setPaidBy] = useState("");

  const navigate = useNavigate();
  const { expenseId } = useParams();

  // --------------------------------------------------
  // Fetch expense
  // --------------------------------------------------

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const fetchExpense = async () => {
      try {
        setFetching(true);

        const response = await axios.get(
          `http://localhost:5000/api/expenses/single/${expenseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const expense = response.data.expense;
        setPaidBy(
          typeof expense.paidBy === "object"
            ? expense.paidBy._id
            : expense.paidBy
        );

        setAmount(expense.amount);
        setDescription(expense.description || "");
        setExpenseName(expense.expenseName || "");

        /*
         * Store the existing splits.
         *
         * Example:
         *
         * [
         *   {
         *     user: {
         *       _id: "...",
         *       name: "Yashwanth"
         *     },
         *     amount: 300,
         *     paid: true
         *   },
         *   {
         *     user: {
         *       _id: "...",
         *       name: "Rahul"
         *     },
         *     amount: 300,
         *     paid: false
         *   }
         * ]
         */
        setSplits(
          expense.splits.map((split) => ({
            user: split.user,
            amount: split.amount,
            paid: split.paid,
            paidAt: split.paidAt,
          }))
        );
        setOriginalSplits(
          expense.splits.map((split) => ({
            user: split.user,
            amount: split.amount,
            paid: split.paid,
            paidAt: split.paidAt,
          }))
        );
      } catch (error) {
        console.error(error);

        toast.error(
          error.response?.data?.message ||
            "Failed to fetch expense"
        );
      } finally {
        setFetching(false);
      }
    };

    fetchExpense();
  }, [navigate, expenseId]);

  // --------------------------------------------------
  // Change split amount
  // --------------------------------------------------

  const handleSplitChange = (index, value) => {
    setSplits((previousSplits) =>
      previousSplits.map((split, i) =>
        i === index
          ? {
              ...split,
              amount: value,
            }
          : split
      )
    );
  };

  // --------------------------------------------------
  // Calculate split total
  // --------------------------------------------------

  const splitTotal = splits.reduce(
    (total, split) =>
      total + Number(split.amount || 0),
    0
  );

  // --------------------------------------------------
  // Update expense
  // --------------------------------------------------

  const handleUpdateExpense = async (e) => {
    e.preventDefault();

    const newAmount = Number(amount);

    if (!newAmount || newAmount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }

    if (!expenseName.trim()) {
      toast.error("Expense name is required");
      return;
    }

    if (!description.trim()) {
      toast.error("Description is required");
      return;
    }

    /*
     * Check whether another member has already paid.
     *
     * The payer's paid=true is intentionally ignored.
     */
    const anotherMemberPaid = originalSplits.some(
  (split) =>
    split.paid === true &&
    split.user?._id !== undefined &&
    String(split.user._id) !== String(paidBy) &&
    split.amount > 0
);

    /*
     * NOTE:
     * The backend is the final authority for this check.
     * The frontend should also prevent the update.
     */

    if (anotherMemberPaid) {
      toast.error(
        "Cannot edit expense because a member has already paid"
      );
      return;
    }

    /*
     * Validate every split amount.
     */
    const invalidSplit = splits.some(
      (split) =>
        split.amount === "" ||
        split.amount === null ||
        Number(split.amount) < 0
    );

    if (invalidSplit) {
      toast.error(
        "Every member must have a valid split amount"
      );
      return;
    }

    /*
     * The sum of all splits must equal
     * the expense amount.
     */
    if (Math.abs(splitTotal - newAmount) > 0.01) {
      toast.error(
        `Split total ₹${splitTotal.toFixed(
          2
        )} must equal expense amount ₹${newAmount.toFixed(
          2
        )}`
      );
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      /*
       * Send updated splits.
       *
       * We preserve paid and paidAt from the
       * existing expense.
       */
      const updatedSplits = splits.map((split) => ({
        user:
          typeof split.user === "object"
            ? split.user._id
            : split.user,

        amount: Number(split.amount),

        paid: split.paid,

        paidAt: split.paidAt || null,
      }));

      await axios.put(
        `http://localhost:5000/api/expenses/edit/${expenseId}`,
        {
          amount: newAmount,
          description: description.trim(),
          expenseName: expenseName.trim(),
          splits: updatedSplits,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Expense updated successfully");

      navigate(-1);
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to update expense"
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
    container: {
      maxWidth: "480px",
      margin: "0 auto",
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
    splitsBox: {
      background: "#f9fafb",
      borderRadius: "10px",
      padding: "16px",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
    },
    splitsTitle: {
      margin: 0,
      fontSize: "14px",
      fontWeight: 600,
      color: "#374151",
    },
    splitRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "12px",
    },
    splitLabelWrap: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      flex: 1,
    },
    splitLabel: {
      fontSize: "14px",
      color: "#374151",
    },
    paidTag: {
      fontSize: "12px",
      fontWeight: 600,
      color: "#16a34a",
    },
    splitInput: {
      width: "110px",
      padding: "8px 10px",
      borderRadius: "6px",
      border: "1px solid #d1d5db",
      fontSize: "14px",
      outline: "none",
      textAlign: "right",
    },
    splitInputDisabled: {
      background: "#f3f4f6",
      color: "#9ca3af",
      cursor: "not-allowed",
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
    statusDiff: {
      margin: 0,
      fontSize: "13px",
      fontWeight: 600,
      color: "#dc2626",
    },
    buttonRow: {
      display: "flex",
      gap: "10px",
      marginTop: "8px",
    },
    button: {
      flex: 1,
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
    cancelButton: {
      flex: 1,
      padding: "13px 14px",
      borderRadius: "8px",
      border: "1px solid #d1d5db",
      background: "#fff",
      color: "#374151",
      fontSize: "15px",
      fontWeight: 600,
      cursor: "pointer",
    },
  };

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (fetching) {
    return <div style={styles.loadingWrap}>Loading expense...</div>;
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.heading}>Edit Expense</h1>

          <form onSubmit={handleUpdateExpense} style={styles.form}>
            {/* ============================================
                EXPENSE NAME
            ============================================ */}

            <div style={styles.field}>
              <label style={styles.label}>Expense Name</label>

              <input
                type="text"
                value={expenseName}
                onChange={(e) => setExpenseName(e.target.value)}
                style={styles.input}
              />
            </div>

            {/* ============================================
                TOTAL AMOUNT
            ============================================ */}

            <div style={styles.field}>
              <label style={styles.label}>Amount</label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={styles.input}
              />
            </div>

            {/* ============================================
                DESCRIPTION
            ============================================ */}

            <div style={styles.field}>
              <label style={styles.label}>Description</label>

              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={styles.input}
              />
            </div>

            {/* ============================================
                UNEQUAL SPLITS
            ============================================ */}

            <div style={styles.splitsBox}>
              <p style={styles.splitsTitle}>Split Amounts</p>

              {splits.map((split, index) => {
                const memberName = split.user?.name || "Unknown member";
                const original = originalSplits[index];
                const isDisabled =
                  original?.paid &&
                  original.amount > 0 &&
                  String(
                    typeof split.user === "object" ? split.user._id : split.user
                  ) !== String(paidBy);

                return (
                  <div
                    key={split.user?._id || index}
                    style={styles.splitRow}
                  >
                    <div style={styles.splitLabelWrap}>
                      <span style={styles.splitLabel}>{memberName}</span>
                      {split.paid && (
                        <span style={styles.paidTag}>Paid</span>
                      )}
                    </div>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={split.amount}
                      onChange={(e) =>
                        handleSplitChange(index, e.target.value)
                      }
                      disabled={isDisabled}
                      style={{
                        ...styles.splitInput,
                        ...(isDisabled ? styles.splitInputDisabled : {}),
                      }}
                    />
                  </div>
                );
              })}

              {/* ==========================================
                  SPLIT TOTAL
              ========================================== */}

              <div style={styles.splitSummary}>
                <span>Split Total: ₹{splitTotal.toFixed(2)}</span>
                <span>Expense Amount: ₹{Number(amount || 0).toFixed(2)}</span>
              </div>

              {Math.abs(splitTotal - Number(amount || 0)) < 0.01 ? (
                <p style={styles.statusMatch}>✓ Split total matches</p>
              ) : (
                <p style={styles.statusDiff}>
                  Difference: ₹
                  {(Number(amount || 0) - splitTotal).toFixed(2)}
                </p>
              )}
            </div>

            {/* ============================================
                UPDATE
            ============================================ */}

            <div style={styles.buttonRow}>
              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={loading}
                style={styles.cancelButton}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.button,
                  ...(loading ? styles.buttonDisabled : {}),
                }}
              >
                {loading ? "Updating..." : "Update Expense"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditExpense;