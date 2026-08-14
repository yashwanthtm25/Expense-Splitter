import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";

import toast from "react-hot-toast";

const API_BASE_URL = "http://localhost:5000/api";

const formatAmount = (value) => Number(value).toFixed(2);

const Expense = () => {
  const [expenses, setExpenses] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedSplit, setSelectedSplit] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [markingPaid, setMarkingPaid] = useState(false);

  // Per-card dropdown state (keyed by expense id)
  const [expandedCards, setExpandedCards] = useState({});
  const [expandedPayers, setExpandedPayers] = useState({});
  const [expandedHistory, setExpandedHistory] = useState({});

  const navigate = useNavigate();
  const { groupId } = useParams();

  // --------------------------------------------------
  // Fetch expenses
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

      setExpenses(response.data.expenses);
      setUser(response.data.user);
    } catch (error) {
      console.error(error);

      setLoadError(true);

      toast.error(
        error.response?.data?.message || "Failed to fetch expenses"
      );
    } finally {
      setLoading(false);
    }
  }, [groupId, navigate]);

  useEffect(() => {
    fetchExpense();
  }, [fetchExpense]);

  // --------------------------------------------------
  // Mark a split as paid
  // --------------------------------------------------

  const handleMarkPaid = async (expenseId, userId) => {
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
  // Dropdown toggles
  // --------------------------------------------------

  const toggleCard = (id) =>
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));

  const togglePayers = (id, e) => {
    e.stopPropagation();
    setExpandedPayers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleHistory = (id, e) => {
    e.stopPropagation();
    setExpandedHistory((prev) => ({ ...prev, [id]: !prev[id] }));
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
    heading: {
      fontSize: "26px",
      fontWeight: 700,
      color: "#1f2937",
      margin: "0 0 24px 0",
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
    emptyStateAction: {
      marginTop: "12px",
      background: "none",
      border: "none",
      color: "#4f46e5",
      fontSize: "14px",
      fontWeight: 600,
      cursor: "pointer",
      padding: 0,
    },
    expenseCard: {
      background: "#fff",
      borderRadius: "12px",
      padding: "20px 24px",
      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
      marginBottom: "18px",
    },
    cardHeaderRow: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: "12px",
      cursor: "pointer",
      userSelect: "none",
    },
    expenseHeader: {
      display: "flex",
      flex: 1,
      justifyContent: "space-between",
      alignItems: "flex-start",
      flexWrap: "wrap",
      gap: "8px",
    },
    expenseName: {
      margin: 0,
      fontSize: "19px",
      fontWeight: 700,
      color: "#1f2937",
    },
    expenseAmount: {
      margin: 0,
      fontSize: "19px",
      fontWeight: 700,
      color: "#4f46e5",
    },
    cardChevron: (open) => ({
      display: "inline-block",
      marginTop: "3px",
      fontSize: "13px",
      color: "#9ca3af",
      transition: "transform 0.2s ease",
      transform: open ? "rotate(180deg)" : "rotate(0deg)",
      flexShrink: 0,
    }),
    cardBody: {
      marginTop: "14px",
      paddingTop: "14px",
      borderTop: "1px solid #f3f4f6",
    },
    descriptionBox: {
      position: "relative",
      background: "#f9fafb",
      borderLeft: "3px solid #c7d2fe",
      borderRadius: "8px",
      padding: "12px 16px 12px 18px",
      margin: "0 0 18px 0",
      fontSize: "14px",
      fontStyle: "italic",
      color: "#4b5563",
      lineHeight: 1.55,
    },
    paidByText: {
      margin: "8px 0 0 0",
      fontSize: "13px",
      color: "#9ca3af",
    },
    sectionToggle: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      cursor: "pointer",
      userSelect: "none",
      padding: "4px 0",
      marginTop: "16px",
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
      marginTop: "8px",
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
      marginTop: "14px",
      padding: "8px 16px",
      borderRadius: "8px",
      border: "1px solid #4f46e5",
      background: "#fff",
      color: "#4f46e5",
      fontSize: "13px",
      fontWeight: 600,
      cursor: "pointer",
    },
    yourShareOwed: {
      fontSize: "14px",
      color: "#dc2626",
      fontWeight: 600,
      margin: "16px 0 0 0",
    },
    yourSharePaid: {
      fontSize: "14px",
      color: "#16a34a",
      fontWeight: 600,
      margin: "16px 0 0 0",
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
    searchContainer: {
      marginBottom: "14px",
    },

    searchInput: {
      width: "100%",
      boxSizing: "border-box",
      padding: "11px 14px",
      borderRadius: "8px",
      border: "1px solid #d1d5db",
      fontSize: "14px",
      outline: "none",
    },

    filterContainer: {
      display: "flex",
      gap: "8px",
      flexWrap: "wrap",
      marginBottom: "24px",
    },

    filterButton: {
      padding: "8px 13px",
      borderRadius: "7px",
      border: "1px solid #d1d5db",
      background: "#fff",
      color: "#374151",
      fontSize: "13px",
      fontWeight: 600,
      cursor: "pointer",
    },

    activeFilterButton: {
      padding: "8px 13px",
      borderRadius: "7px",
      border: "1px solid #4f46e5",
      background: "#4f46e5",
      color: "#fff",
      fontSize: "13px",
      fontWeight: 600,
      cursor: "pointer",
    },
    sortContainer: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      marginBottom: "24px",
    },

    sortLabel: {
      fontSize: "13px",
      fontWeight: 600,
      color: "#6b7280",
      textTransform: "uppercase",
      letterSpacing: "0.03em",
    },

    sortSelect: {
      padding: "9px 34px 9px 14px",
      borderRadius: "8px",
      border: "1px solid #d1d5db",
      background:
        "#fff url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path d='M1 1l4 4 4-4' stroke='%236b7280' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/></svg>\") no-repeat right 12px center",
      fontSize: "14px",
      fontWeight: 500,
      color: "#374151",
      outline: "none",
      cursor: "pointer",
      appearance: "none",
      WebkitAppearance: "none",
      MozAppearance: "none",
      transition: "border-color 0.15s ease, box-shadow 0.15s ease",
    },
  };

  // --------------------------------------------------
  // Loading / error states
  // --------------------------------------------------

  if (loading) {
    return <div style={styles.loadingWrap}>Loading...</div>;
  }

  if (loadError || !user) {
    return (
      <div style={styles.loadingWrap}>
        <p>Something went wrong loading expenses.</p>
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

  const hasActiveFilters = search.trim() !== "" || filter !== "all";

  const filteredExpenses = expenses.filter((expense) => {
    // -----------------------------
    // SEARCH
    // -----------------------------

    const searchText = search.toLowerCase().trim();

    const matchesSearch =
      expense.expenseName?.toLowerCase().includes(searchText) ||
      expense.description?.toLowerCase().includes(searchText);

    if (!matchesSearch) {
      return false;
    }

    // -----------------------------
    // CURRENT USER'S SPLIT
    // -----------------------------

    const currentUserSplit = expense.splits.find(
      (split) => String(split.user._id) === String(user._id)
    );

    // -----------------------------
    // FILTER
    // -----------------------------

    if (filter === "all") {
      return true;
    }

    if (filter === "youPaid") {
      return String(expense.paidBy._id) === String(user._id);
    }

    if (filter === "youOwe") {
      return (
        String(expense.paidBy._id) !== String(user._id) &&
        currentUserSplit &&
        currentUserSplit.paid === false
      );
    }

    if (filter === "youReceived") {
      return (
        String(expense.paidBy._id) === String(user._id) &&
        expense.splits.some(
          (split) =>
            String(split.user._id) !== String(user._id) &&
            split.paid === true
        )
      );
    }

    if (filter === "paid") {
      return currentUserSplit?.paid === true;
    }

    return true;
  });

  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    if (sort === "newest") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }

    if (sort === "oldest") {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }

    if (sort === "highest") {
      return Number(b.amount) - Number(a.amount);
    }

    if (sort === "lowest") {
      return Number(a.amount) - Number(b.amount);
    }

    return 0;
  });

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <Link to={`/groups/${groupId}`} style={styles.backLink}>
          ← Back to Group
        </Link>

        <h1 style={styles.heading}>Expenses</h1>

        {/* =========================
    SEARCH
   ========================= */}

        <div style={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search expenses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        {/* =========================
    FILTER
   ========================= */}

        <div style={styles.filterContainer}>
          <button
            style={
              filter === "all" ? styles.activeFilterButton : styles.filterButton
            }
            onClick={() => setFilter("all")}
          >
            All
          </button>

          <button
            style={
              filter === "youPaid"
                ? styles.activeFilterButton
                : styles.filterButton
            }
            onClick={() => setFilter("youPaid")}
          >
            You Paid
          </button>

          <button
            style={
              filter === "youOwe"
                ? styles.activeFilterButton
                : styles.filterButton
            }
            onClick={() => setFilter("youOwe")}
          >
            You Owe
          </button>

          <button
            style={
              filter === "youReceived"
                ? styles.activeFilterButton
                : styles.filterButton
            }
            onClick={() => setFilter("youReceived")}
          >
            You Received
          </button>

          <button
            style={
              filter === "paid" ? styles.activeFilterButton : styles.filterButton
            }
            onClick={() => setFilter("paid")}
          >
            Paid
          </button>
        </div>

        <div style={styles.sortContainer}>
          <label style={styles.sortLabel}>Sort by</label>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            style={styles.sortSelect}
            onFocus={(e) => {
              e.target.style.borderColor = "#4f46e5";
              e.target.style.boxShadow = "0 0 0 3px rgba(79, 70, 229, 0.15)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#d1d5db";
              e.target.style.boxShadow = "none";
            }}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="highest">Highest amount</option>
            <option value="lowest">Lowest amount</option>
          </select>
        </div>

        {sortedExpenses.length === 0 ? (
          <div style={styles.emptyState}>
            <p>
              {expenses.length === 0
                ? "No expenses yet"
                : "No expenses match your search or filter"}
            </p>

            {hasActiveFilters && expenses.length > 0 && (
              <button
                style={styles.emptyStateAction}
                onClick={() => {
                  setSearch("");
                  setFilter("all");
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          sortedExpenses.map((expense) => {
            const isPayer = String(expense.paidBy._id) === String(user._id);

            const isCardOpen = !!expandedCards[expense._id];
            const isPayersOpen = !!expandedPayers[expense._id];
            const isHistoryOpen = !!expandedHistory[expense._id];

            const unpaidSplits = expense.splits.filter(
              (split) => !split.paid
            );
            const paidHistory = expense.splits.filter(
              (split) => split.paid && split.paidAt
            );

            return (
              <div key={expense._id} style={styles.expenseCard}>
                {/* =========================
                    CARD HEADER (click to expand/collapse)
                   ========================= */}

                <div
                  style={styles.cardHeaderRow}
                  onClick={() => toggleCard(expense._id)}
                >
                  <div style={styles.expenseHeader}>
                    <h2 style={styles.expenseName}>{expense.expenseName}</h2>
                    <p style={styles.expenseAmount}>
                      ₹{formatAmount(expense.amount)}
                    </p>
                  </div>

                  <span style={styles.cardChevron(isCardOpen)}>▼</span>
                </div>

                <p style={styles.paidByText}>
                  Paid by {expense.paidBy.name} {isPayer ? "(You)" : ""}
                </p>

                {isCardOpen && (
                  <div style={styles.cardBody}>
                    {/* =========================
                        DESCRIPTION
                       ========================= */}

                    {expense.description && (
                      <div style={styles.descriptionBox}>
                        {expense.description}
                      </div>
                    )}

                    {/* =========================
                        PAYER VIEW
                       ========================= */}

                    {isPayer ? (
                      <>
                        <div
                          style={styles.sectionToggle}
                          onClick={(e) => togglePayers(expense._id, e)}
                        >
                          <p style={styles.subheading}>
                            People who need to pay you
                            {unpaidSplits.length > 0
                              ? ` (${unpaidSplits.length})`
                              : ""}
                          </p>
                          <span style={styles.sectionChevron(isPayersOpen)}>
                            ▼
                          </span>
                        </div>

                        {isPayersOpen && (
                          <div style={styles.sectionContent}>
                            {expense.splits.map((split) => (
                              <div
                                key={split.user._id}
                                style={styles.splitRow}
                              >
                                <span style={styles.splitPersonAmount}>
                                  {split.user.name} — ₹
                                  {formatAmount(split.amount)}
                                </span>

                                {split.paid ? (
                                  <span style={styles.paidTag}>✓ Paid</span>
                                ) : (
                                  <button
                                    style={styles.removeButton}
                                    onClick={() =>
                                      setSelectedSplit({
                                        expenseId: expense._id,
                                        userId: split.user._id,
                                        userName: split.user.name,
                                      })
                                    }
                                  >
                                    Mark as Paid
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Edit belongs to the expense,
                            not to each split */}

                        <button
                          style={styles.editButton}
                          onClick={() =>
                            navigate(`/edit-expense/${expense._id}`)
                          }
                        >
                          Edit
                        </button>
                      </>
                    ) : (
                      /* =========================
                         MEMBER VIEW
                         ========================= */

                      expense.splits.map((split) => {
                        if (String(split.user._id) !== String(user._id)) {
                          return null;
                        }

                        return split.paid ? (
                          <p
                            key={split.user._id}
                            style={styles.yourSharePaid}
                          >
                            ✓ You have paid your share
                          </p>
                        ) : (
                          <p
                            key={split.user._id}
                            style={styles.yourShareOwed}
                          >
                            You need to pay: ₹{formatAmount(split.amount)}
                          </p>
                        );
                      })
                    )}

                    {/* =========================
                        PAYMENT HISTORY (both views)
                       ========================= */}

                    <div
                      style={styles.sectionToggle}
                      onClick={(e) => toggleHistory(expense._id, e)}
                    >
                      <p style={styles.subheading}>
                        Payment History
                        {paidHistory.length > 0
                          ? ` (${paidHistory.length})`
                          : ""}
                      </p>
                      <span style={styles.sectionChevron(isHistoryOpen)}>
                        ▼
                      </span>
                    </div>

                    {isHistoryOpen && (
                      <div style={styles.sectionContent}>
                        {paidHistory.length === 0 ? (
                          <p style={styles.emptyHistory}>No payments yet</p>
                        ) : (
                          paidHistory.map((split) => (
                            <div
                              key={`${expense._id}-${split.user._id}`}
                              style={styles.historyEntry}
                            >
                              <span>
                                {split.user.name} paid ₹
                                {formatAmount(split.amount)}
                              </span>

                              <span>
                                {new Date(split.paidAt).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
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
                onClick={() =>
                  handleMarkPaid(selectedSplit.expenseId, selectedSplit.userId)
                }
                disabled={markingPaid}
              >
                {markingPaid ? "Confirming..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expense;