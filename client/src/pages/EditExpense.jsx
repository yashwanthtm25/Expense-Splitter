import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

const EditExpense = () => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [expenseName, setExpenseName] = useState("");

  const [splits, setSplits] = useState([]);

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
    const anotherMemberPaid = splits.some(
      (split) =>
        split.paid === true &&
        split.user?._id !== undefined &&
        String(split.user._id) !== String(paidBy)
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

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (fetching) {
    return <p>Loading expense...</p>;
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div>
      <h1>Edit Expense</h1>

      <form onSubmit={handleUpdateExpense}>
        {/* ============================================
            EXPENSE NAME
        ============================================ */}

        <div>
          <label>Expense Name</label>

          <input
            type="text"
            value={expenseName}
            onChange={(e) =>
              setExpenseName(e.target.value)
            }
          />
        </div>

        {/* ============================================
            TOTAL AMOUNT
        ============================================ */}

        <div>
          <label>Amount</label>

          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) =>
              setAmount(e.target.value)
            }
          />
        </div>

        {/* ============================================
            DESCRIPTION
        ============================================ */}

        <div>
          <label>Description</label>

          <input
            type="text"
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
          />
        </div>

        {/* ============================================
            UNEQUAL SPLITS
        ============================================ */}

        <div>
          <h2>Split Amounts</h2>

          {splits.map((split, index) => {
            const memberName =
              split.user?.name || "Unknown member";

            return (
              <div key={split.user?._id || index}>
                <label>
                  {memberName}
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={split.amount}
                  onChange={(e) =>
                    handleSplitChange(
                      index,
                      e.target.value
                    )
                  }
                  disabled={
                    split.paid &&
                    String(
                      typeof split.user === "object"
                        ? split.user._id
                        : split.user
                    ) !== String(paidBy)
                  }
                />

                {split.paid && (
                  <span>
                    {" "}
                    Paid
                  </span>
                )}
              </div>
            );
          })}

          {/* ==========================================
              SPLIT TOTAL
          ========================================== */}

          <p>
            Split Total: ₹
            {splitTotal.toFixed(2)}
          </p>

          <p>
            Expense Amount: ₹
            {Number(amount || 0).toFixed(2)}
          </p>

          {Math.abs(
            splitTotal - Number(amount || 0)
          ) < 0.01 ? (
            <p>✓ Split total matches</p>
          ) : (
            <p>
              Difference: ₹
              {(
                Number(amount || 0) - splitTotal
              ).toFixed(2)}
            </p>
          )}
        </div>

        {/* ============================================
            UPDATE
        ============================================ */}

        <button
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Updating..."
            : "Update Expense"}
        </button>

        <button
          type="button"
          onClick={() => navigate(-1)}
          disabled={loading}
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

export default EditExpense;