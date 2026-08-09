import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

const EditExpense = () => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [expenseName, setExpenseName] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { expenseId } = useParams();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const fetchExpense = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/expenses/single/${expenseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const expense = response.data.expense;

        setAmount(expense.amount);
        setDescription(expense.description);
        setExpenseName(expense.expenseName);
      } catch (error) {
        console.error(error);

        toast.error(
          error.response?.data?.message ||
            "Failed to fetch expense"
        );
      }
    };

    fetchExpense();
  }, [navigate, expenseId]);

  const handleUpdateExpense = async (e) => {
    e.preventDefault();

    if (!amount || Number(amount) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }

    if (!description.trim()) {
      toast.error("Description is required");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      await axios.put(
        `http://localhost:5000/api/expenses/edit/${expenseId}`,
        {
          amount: Number(amount),
          description: description.trim(),
          expenseName: expenseName.trim(),
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

  return (
    <div>
      <h1>Edit Expense</h1>

      <form onSubmit={handleUpdateExpense}>
        <div>
            <label>Expense Name</label>
            <input
              type="text"
              value={expenseName}
              onChange={(e) => setExpenseName(e.target.value)}
            />
          <label>Amount</label>

          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

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

        <button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update Expense"}
        </button>
      </form>
    </div>
  );
};

export default EditExpense;