import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";

import toast from "react-hot-toast";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

const Expense = () => {
  const [expenses, setExpenses] = useState([]);
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

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
    headerRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "16px",
      marginBottom: "24px",
    },
    heading: {
      fontSize: "26px",
      fontWeight: 700,
      color: "#1f2937",
      margin: 0,
    },
    addButton: {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      padding: "12px 20px",
      borderRadius: "10px",
      border: "none",
      background: "#4f46e5",
      color: "#fff",
      fontSize: "14px",
      fontWeight: 700,
      cursor: "pointer",
      whiteSpace: "nowrap",
      transition: "background 0.15s ease, transform 0.15s ease",
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
    },
    // Simple list card, matching the "My Groups" reference style
    expenseCard: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "18px",
      background: "#fff",
      borderRadius: "14px",
      padding: "22px 26px",
      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
      marginBottom: "16px",
      cursor: "pointer",
      textDecoration: "none",
      transition: "transform 0.15s ease, box-shadow 0.15s ease",
    },
    expenseTextWrap: {
      display: "flex",
      flexDirection: "column",
      gap: "6px",
      minWidth: 0,
      flex: 1,
    },
    expenseName: {
      margin: 0,
      fontSize: "18px",
      fontWeight: 700,
      color: "#1f2937",
      lineHeight: 1.3,
      letterSpacing: "-0.01em",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    expenseDescription: {
      margin: 0,
      fontSize: "14px",
      fontWeight: 400,
      color: "#8b93a1",
      lineHeight: 1.5,
      overflow: "hidden",
      textOverflow: "ellipsis",
      display: "-webkit-box",
      WebkitLineClamp: 2,
      WebkitBoxOrient: "vertical",
    },
    noDescription: {
      margin: 0,
      fontSize: "14px",
      fontWeight: 400,
      fontStyle: "italic",
      color: "#c1c6cf",
    },
    arrow: {
      flexShrink: 0,
      fontSize: "18px",
      color: "#9ca3af",
      transition: "transform 0.15s ease",
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

        {/* =========================
    HEADER
   ========================= */}

        <div style={styles.headerRow}>
          <h1 style={styles.heading}>Expenses</h1>

          <button
            style={styles.addButton}
            onClick={() => navigate(`/add-expense/${groupId}`)}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#4338ca";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#4f46e5";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            + Add Expense
          </button>
        </div>

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
          sortedExpenses.map((expense) => (
            <div
              key={expense._id}
              style={styles.expenseCard}
              onClick={() =>
                navigate(`/groups/${groupId}/expenses/${expense._id}`)
              }
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 12px 28px rgba(0, 0, 0, 0.12)";
                e.currentTarget.querySelector(
                  "[data-arrow]"
                ).style.transform = "translateX(3px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 8px 24px rgba(0, 0, 0, 0.08)";
                e.currentTarget.querySelector(
                  "[data-arrow]"
                ).style.transform = "translateX(0)";
              }}
            >
              <div style={styles.expenseTextWrap}>
                <p style={styles.expenseName}>{expense.expenseName}</p>
                {expense.description ? (
                  <p style={styles.expenseDescription}>
                    {expense.description}
                  </p>
                ) : (
                  <p style={styles.noDescription}>No description</p>
                )}
              </div>

              <span data-arrow style={styles.arrow}>
                →
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Expense;