import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";

import toast from "react-hot-toast";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

const formatAmount = (value) => Number(value).toFixed(2);

const ExpenseDetails = () => {
  const [expense, setExpense] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedSplit, setSelectedSplit] = useState(null);
  const [confirmingRequest, setConfirmingRequest] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [markingPaid, setMarkingPaid] = useState(false);
  const [requestingPayment, setRequestingPayment] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [showPayers, setShowPayers] = useState(true);
  const [showAllShares, setShowAllShares] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  const navigate = useNavigate();
  const { groupId, expenseId } = useParams();

  // --------------------------------------------------
  // Fetch expense
  // --------------------------------------------------

  const fetchExpense = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoadError(false);

      const response = await axios.get(
        `${API_BASE_URL}/expenses/${groupId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const found = response.data.expenses.find(
        (item) => String(item._id) === String(expenseId)
      );

      if (!found) {
        setLoadError(true);
        toast.error("Expense not found");
      } else {
        setExpense(found);
      }

      setUser(response.data.user);
    } catch (error) {
      console.error(error);

      setLoadError(true);

      toast.error(
        error.response?.data?.message || "Failed to fetch expense"
      );
    } finally {
      setLoading(false);
    }
  }, [groupId, expenseId, navigate]);

  useEffect(() => {
    fetchExpense();
  }, [fetchExpense]);

  // --------------------------------------------------
  // Mark a split as paid
  // --------------------------------------------------

  const handleMarkPaid = async (userId) => {
    try {
      setMarkingPaid(true);

      const token = localStorage.getItem("token");

      await axios.patch(
        `${API_BASE_URL}/expenses/${expenseId}/pay/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Payment marked as paid");

      setSelectedSplit(null);

      await fetchExpense();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to mark payment as paid"
      );
    } finally {
      setMarkingPaid(false);
    }
  };

  // --------------------------------------------------
  // Report "I paid" (request payment confirmation)
  // --------------------------------------------------

  const handleRequestPayment = async () => {
    try {
      setRequestingPayment(true);

      const token = localStorage.getItem("token");

      await axios.patch(
        `${API_BASE_URL}/expenses/${expenseId}/request-payment`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Payment reported");

      setConfirmingRequest(false);

      await fetchExpense();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to report payment"
      );
    } finally {
      setRequestingPayment(false);
    }
  };

  // --------------------------------------------------
  // Delete expense
  // --------------------------------------------------

  const handleDeleteExpense = async () => {
    try {
      setDeleting(true);

      const token = localStorage.getItem("token");

      await axios.delete(`${API_BASE_URL}/expenses/${expenseId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Expense deleted");

      navigate(`/expenses/${groupId}`);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete expense"
      );
      setDeleting(false);
      setConfirmDelete(false);
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
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "12px",
      background: "#f5f6fa",
      fontFamily: "'Segoe UI', Arial, sans-serif",
      color: "#6b7280",
      fontSize: "16px",
    },
    retryButton: {
      padding: "10px 20px",
      borderRadius: "8px",
      border: "none",
      background: "#4f46e5",
      color: "#fff",
      fontSize: "14px",
      fontWeight: 600,
      cursor: "pointer",
    },
    container: {
      maxWidth: "680px",
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
      borderRadius: "12px",
      padding: "24px",
      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
    },
    headerRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      flexWrap: "wrap",
      gap: "8px",
    },
    expenseName: {
      margin: 0,
      fontSize: "24px",
      fontWeight: 700,
      color: "#1f2937",
    },
    expenseAmount: {
      margin: 0,
      fontSize: "22px",
      fontWeight: 700,
      color: "#4f46e5",
    },
    paidByText: {
      margin: "8px 0 0 0",
      fontSize: "13px",
      color: "#9ca3af",
    },
    descriptionBox: {
      background: "#f9fafb",
      borderLeft: "3px solid #c7d2fe",
      borderRadius: "8px",
      padding: "12px 16px 12px 18px",
      margin: "18px 0",
      fontSize: "14px",
      fontStyle: "normal",
      color: "#4b5563",
      lineHeight: 1.55,
    },
    sectionToggle: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      cursor: "pointer",
      userSelect: "none",
      padding: "4px 0",
      marginTop: "20px",
      borderTop: "1px solid #f3f4f6",
      paddingTop: "18px",
    },
    subheading: {
      margin: 0,
      fontSize: "13px",
      fontWeight: 700,
      color: "#374151",
      textTransform: "uppercase",
      letterSpacing: "0.03em",
    },
    sectionChevron: (open) => ({
      display: "inline-block",
      fontSize: "12px",
      color: "#9ca3af",
      transition: "transform 0.2s ease",
      transform: open ? "rotate(180deg)" : "rotate(0deg)",
    }),
    sectionContent: {
      marginTop: "10px",
    },
    splitRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "10px 0",
      borderBottom: "1px solid #f3f4f6",
    },
    splitPersonAmount: {
      fontSize: "14px",
      color: "#374151",
    },
    paidTag: {
      fontSize: "13px",
      fontWeight: 600,
      color: "#16a34a",
    },
    unpaidTag: {
      fontSize: "13px",
      fontWeight: 600,
      color: "#dc2626",
    },
    requestedTag: {
      fontSize: "13px",
      fontWeight: 600,
      color: "#c2410c",
    },
    removeButton: {
      padding: "6px 14px",
      borderRadius: "6px",
      border: "1px solid #d1d5db",
      background: "#fff",
      color: "#374151",
      fontSize: "13px",
      fontWeight: 600,
      cursor: "pointer",
    },
    editButton: {
      padding: "9px 18px",
      borderRadius: "8px",
      border: "1px solid #4f46e5",
      background: "#fff",
      color: "#4f46e5",
      fontSize: "13px",
      fontWeight: 600,
      cursor: "pointer",
    },
    actionButtonsRow: {
      display: "flex",
      gap: "10px",
      marginTop: "20px",
    },
    deleteButton: {
      padding: "9px 18px",
      borderRadius: "8px",
      border: "1px solid #dc2626",
      background: "#fff",
      color: "#dc2626",
      fontSize: "13px",
      fontWeight: 600,
      cursor: "pointer",
    },
    yourShareOwed: {
      fontSize: "15px",
      color: "#dc2626",
      fontWeight: 600,
      margin: "18px 0 0 0",
    },
    yourSharePaid: {
      fontSize: "15px",
      color: "#16a34a",
      fontWeight: 600,
      margin: "18px 0 0 0",
    },
    iPaidButton: {
      marginTop: "12px",
      padding: "9px 18px",
      borderRadius: "8px",
      border: "1px solid #d1d5db",
      background: "#fff",
      color: "#374151",
      fontSize: "13px",
      fontWeight: 600,
      cursor: "pointer",
    },
    paymentReportedBadge: {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      marginTop: "12px",
      padding: "8px 14px",
      borderRadius: "8px",
      background: "#fff7ed",
      color: "#c2410c",
      fontSize: "13px",
      fontWeight: 600,
    },
    historyEntry: {
      display: "flex",
      justifyContent: "space-between",
      padding: "8px 0",
      borderBottom: "1px solid #f3f4f6",
      fontSize: "13px",
      color: "#6b7280",
    },
    emptyHistory: {
      fontSize: "13px",
      color: "#9ca3af",
      margin: 0,
      padding: "6px 0",
    },
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(17, 24, 39, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      zIndex: 50,
    },
    modal: {
      background: "#fff",
      borderRadius: "14px",
      padding: "28px",
      maxWidth: "380px",
      width: "100%",
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
    },
    modalText: {
      margin: "0 0 22px 0",
      fontSize: "15px",
      color: "#1f2937",
    },
    modalActions: {
      display: "flex",
      gap: "10px",
    },
    modalCancelButton: {
      flex: 1,
      padding: "11px 16px",
      borderRadius: "8px",
      border: "1px solid #d1d5db",
      background: "#fff",
      color: "#374151",
      fontSize: "14px",
      fontWeight: 600,
      cursor: "pointer",
    },
    modalConfirmButton: {
      flex: 1,
      padding: "11px 16px",
      borderRadius: "8px",
      border: "none",
      background: "#4f46e5",
      color: "#fff",
      fontSize: "14px",
      fontWeight: 600,
      cursor: "pointer",
    },
  };

  // --------------------------------------------------
  // Loading / error states
  // --------------------------------------------------

  if (loading) {
    return <div style={styles.loadingWrap}>Loading...</div>;
  }

  if (loadError || !user || !expense) {
    return (
      <div style={styles.loadingWrap}>
        <p>Something went wrong loading this expense.</p>
        <button
          style={styles.retryButton}
          onClick={() => {
            setLoading(true);
            fetchExpense();
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  const isPayer = String(expense.paidBy._id) === String(user._id);

  const unpaidSplits = expense.splits.filter((split) => !split.paid);
  const paidHistory = expense.splits.filter(
    (split) => split.paid && split.paidAt
  );

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <Link to={`/expenses/${groupId}`} style={styles.backLink}>
          ← Back to Expenses
        </Link>

        <div style={styles.card}>
          {/* =========================
              HEADER
             ========================= */}

          <div style={styles.headerRow}>
            <h1 style={styles.expenseName}>{expense.expenseName}</h1>
            <p style={styles.expenseAmount}>
              ₹{formatAmount(expense.amount)}
            </p>
          </div>

          <p style={styles.paidByText}>
            Paid by {expense.paidBy.name} {isPayer ? "(You)" : ""}
          </p>

          {/* =========================
              DESCRIPTION
             ========================= */}

          {expense.description && (
            <div style={styles.descriptionBox}>{expense.description}</div>
          )}

          {/* =========================
              PAYER VIEW
             ========================= */}

          {isPayer ? (
            <>
              <div
                style={styles.sectionToggle}
                onClick={() => setShowPayers((prev) => !prev)}
              >
                <p style={styles.subheading}>
                  People who need to pay you
                  {unpaidSplits.length > 0 ? ` (${unpaidSplits.length})` : ""}
                </p>
                <span style={styles.sectionChevron(showPayers)}>▼</span>
              </div>

              {showPayers && (
                <div style={styles.sectionContent}>
                  {expense.splits.map((split) => {
                    const isSplitPayer = String(expense.paidBy._id) === String(split.user._id);
                    return (
                      <div key={split.user._id} style={styles.splitRow}>
                        <span style={styles.splitPersonAmount}>
                          {split.user.name}{isSplitPayer ? " (You)(Payer)" : ""} — ₹{formatAmount(split.amount)}
                        </span>

                        {split.paid ? (
                          <span style={styles.paidTag}>✓ Paid</span>
                        ) : (
                          <button
                            style={styles.removeButton}
                            onClick={() =>
                              setSelectedSplit({
                                userId: split.user._id,
                                userName: split.user.name,
                              })
                            }
                          >
                            Mark as Paid
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <div style={styles.actionButtonsRow}>
                <button
                  style={styles.editButton}
                  onClick={() => navigate(`/edit-expense/${expense._id}`)}
                >
                  Edit
                </button>

                <button
                  style={styles.deleteButton}
                  onClick={() => setConfirmDelete(true)}
                >
                  Delete
                </button>
              </div>
            </>
          ) : (
            /* =========================
               MEMBER VIEW
               ========================= */

            <>
              {expense.splits.map((split) => {
                if (String(split.user._id) !== String(user._id)) {
                  return null;
                }

                if (split.paid) {
                  return (
                    <p key={split.user._id} style={styles.yourSharePaid}>
                      ✓ You have paid your share
                    </p>
                  );
                }

                return (
                  <div key={split.user._id}>
                    <p style={styles.yourShareOwed}>
                      You need to pay: ₹{formatAmount(split.amount)}
                    </p>

                    {split.paymentRequested ? (
                      <span style={styles.paymentReportedBadge}>
                        ⏳ Payment reported — waiting for confirmation
                      </span>
                    ) : (
                      <button
                        style={styles.iPaidButton}
                        onClick={() => setConfirmingRequest(true)}
                      >
                        I Paid
                      </button>
                    )}
                  </div>
                );
              })}

              <div
                style={styles.sectionToggle}
                onClick={() => setShowAllShares((prev) => !prev)}
              >
                <p style={styles.subheading}>
                  Everyone's Share ({expense.splits.length})
                </p>
                <span style={styles.sectionChevron(showAllShares)}>▼</span>
              </div>

              {showAllShares && (
                <div style={styles.sectionContent}>
                  {expense.splits.map((split) => {
                    const isYou = String(split.user._id) === String(user._id);
                    const isSplitPayer = String(split.user._id) === String(expense.paidBy._id);
                    return (
                      <div key={split.user._id} style={styles.splitRow}>
                        <span style={styles.splitPersonAmount}>
                          {split.user.name}
                          {isYou ? " (You)" : ""}
                          {isSplitPayer ? " (Payer)": ""}
                          {" — ₹"}
                          {formatAmount(split.amount)}
                        </span>

                        {split.paid ? (
                          <span style={styles.paidTag}>✓ Paid</span>
                        ) : split.paymentRequested ? (
                          <span style={styles.requestedTag}>Reported</span>
                        ) : (
                          <span style={styles.unpaidTag}>Unpaid</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* =========================
              PAYMENT HISTORY (both views)
             ========================= */}

          <div
            style={styles.sectionToggle}
            onClick={() => setShowHistory((prev) => !prev)}
          >
            <p style={styles.subheading}>
              Payment History
              {paidHistory.length > 0 ? ` (${paidHistory.length})` : ""}
            </p>
            <span style={styles.sectionChevron(showHistory)}>▼</span>
          </div>

          {showHistory && (
            <div style={styles.sectionContent}>
              {paidHistory.length === 0 ? (
                <p style={styles.emptyHistory}>No payments yet</p>
              ) : (
                paidHistory.map((split) => {
                  const isYou = String(split.user._id) === String(user._id);

                  return (
                    <div
                      key={`${expense._id}-${split.user._id}`}
                      style={styles.historyEntry}
                    >
                      <span>
                        {split.user.name}
                        {isYou ? " (You)" : ""} paid ₹
                        {formatAmount(split.amount)}
                      </span>

                      <span>
                        {new Date(split.paidAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* =========================
          PAYMENT CONFIRMATION
         ========================= */}

      {selectedSplit && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <p style={styles.modalText}>
              Has <strong>{selectedSplit.userName}</strong> paid you?
            </p>

            <div style={styles.modalActions}>
              <button
                style={styles.modalCancelButton}
                onClick={() => setSelectedSplit(null)}
                disabled={markingPaid}
              >
                Cancel
              </button>

              <button
                style={{
                  ...styles.modalConfirmButton,
                  opacity: markingPaid ? 0.7 : 1,
                }}
                onClick={() => handleMarkPaid(selectedSplit.userId)}
                disabled={markingPaid}
              >
                {markingPaid ? "Confirming..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          REQUEST PAYMENT ("I PAID") CONFIRMATION
         ========================= */}

      {confirmingRequest && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <p style={styles.modalText}>
              Confirm you've paid <strong>{expense.paidBy.name}</strong> your
              share of this expense. They'll be notified to confirm receipt.
            </p>

            <div style={styles.modalActions}>
              <button
                style={styles.modalCancelButton}
                onClick={() => setConfirmingRequest(false)}
                disabled={requestingPayment}
              >
                Cancel
              </button>

              <button
                style={{
                  ...styles.modalConfirmButton,
                  opacity: requestingPayment ? 0.7 : 1,
                }}
                onClick={handleRequestPayment}
                disabled={requestingPayment}
              >
                {requestingPayment ? "Reporting..." : "Yes, I Paid"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          DELETE EXPENSE CONFIRMATION
         ========================= */}

      {confirmDelete && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <p style={styles.modalText}>
              Delete <strong>{expense.expenseName}</strong>? This cannot be
              undone and will remove it for everyone in the group.
            </p>

            <div style={styles.modalActions}>
              <button
                style={styles.modalCancelButton}
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                style={{
                  ...styles.modalConfirmButton,
                  background: "#dc2626",
                  opacity: deleting ? 0.7 : 1,
                }}
                onClick={handleDeleteExpense}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseDetails;