import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

const Expense = () => {
  const [expenses, setExpenses] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedSplit, setSelectedSplit] = useState(null);

  const navigate = useNavigate();
  const { groupId } = useParams();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const fetchExpense = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/expenses/${groupId}`,
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

        toast.error(
          error.response?.data?.message ||
            "Failed to fetch expenses"
        );
      }
    };

    fetchExpense();
  }, [navigate, groupId]);

  const handleMarkPaid = async (expenseId, userId) => {
    try {
      const token = localStorage.getItem("token");

      await axios.patch(
        `http://localhost:5000/api/expenses/${expenseId}/pay/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Payment marked as paid");

      setSelectedSplit(null);

      // Refresh expenses
      const response = await axios.get(
        `http://localhost:5000/api/expenses/${groupId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setExpenses(response.data.expenses);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to mark payment as paid"
      );
    }
  };

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Expenses</h1>

      {expenses.length === 0 ? (
        <p>No expenses found</p>
      ) : (
        expenses.map((expense) => {
          const isPayer =
            expense.paidBy._id.toString() ===
            user._id.toString();

          return (
            <div key={expense._id}>
              <h2>{expense.expenseName}</h2>

              <h3>{expense.description}</h3>

              <p>Expense: ₹{expense.amount}</p>

              <p>
                Paid by: {expense.paidBy.name}
              </p>

              {/* =========================
                  PAYER VIEW
                 ========================= */}

              {isPayer ? (
                <>
                  <h4>People who need to pay you:</h4>

                  {expense.splits
                    .filter(
                      (split) =>
                        split.user._id.toString() !==
                        expense.paidBy._id.toString()
                    )
                    .map((split) => (
                      <div key={split.user._id}>
                        <span>
                          {split.user.name} - ₹
                          {split.amount}
                        </span>

                        {split.paid ? (
                          <span> ✓ Paid</span>
                        ) : (
                          <button
                            onClick={() =>
                              setSelectedSplit({
                                expenseId: expense._id,
                                userId: split.user._id,
                                userName: split.user.name,
                              })
                            }
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}

                  {/* Edit belongs to the expense,
                      not to each split */}

                  <button
                    onClick={() =>
                      navigate(
                        `/edit-expense/${expense._id}`
                      )
                    }
                  >
                    Edit
                  </button>

                  <h2>Payment History</h2>

                  {expense.splits
                    .filter(
                      (split) => split.paid && split.paidAt
                    )
                    .map((split) => (
                      <div
                        key={`${expense._id}-${split.user._id}`}
                      >
                        <p>
                          {split.user.name} paid ₹
                          {split.amount}
                        </p>

                        <p>
                          {new Date(
                            split.paidAt
                          ).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    ))}
                </>
              ) : (
                /* =========================
                   MEMBER VIEW
                   ========================= */

                <>
                  {expense.splits.map((split) => {
                    if (
                      split.user._id.toString() !==
                      user._id.toString()
                    ) {
                      return null;
                    }

                    return split.paid ? (
                      <p key={split.user._id}>
                        ✓ You have paid your share
                      </p>
                    ) : (
                      <p key={split.user._id}>
                        You need to pay: ₹
                        {split.amount}
                      </p>
                    );
                  })}

                  <h2>Payment History</h2>

                  {expense.splits
                    .filter(
                      (split) => split.paid && split.paidAt
                    )
                    .map((split) => (
                      <div
                        key={`${expense._id}-${split.user._id}`}
                      >
                        <p>
                          {split.user.name} paid ₹
                          {split.amount}
                        </p>

                        <p>
                          {new Date(
                            split.paidAt
                          ).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    ))}
                </>
              )}
            </div>
          );
        })
      )}

      {/* =========================
          PAYMENT CONFIRMATION
         ========================= */}

      {selectedSplit && (
        <div>
          <p>
            Has {selectedSplit.userName} paid you?
          </p>

          <button
            onClick={() => setSelectedSplit(null)}
          >
            Cancel
          </button>

          <button
            onClick={() =>
              handleMarkPaid(
                selectedSplit.expenseId,
                selectedSplit.userId
              )
            }
          >
            Confirm
          </button>
        </div>
      )}
    </div>
  );
};

export default Expense;