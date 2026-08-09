import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

const AddExpense = () => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");
  const [expenseName, setExpenseName] = useState("");

  const navigate = useNavigate();
  const { groupId } = useParams();

  // Check authentication when component loads
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("You must be logged in to add an expense");
      navigate("/login");
    }
  }, [navigate]);

  const handleAddExpense = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (!amount.trim()) {
      toast.error("Amount is required");
      return;
    }

    const numericAmount = parseFloat(amount);

    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast.error("Please enter a valid positive number");
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        `http://localhost:5000/api/expenses/${groupId}`,
        {
          amount: numericAmount,
          description: description.trim(),
          expenseName: expenseName.trim(),
        },
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

  return (
    <div>
      <h1>Add Expense</h1>

      <form onSubmit={handleAddExpense}>
        <input
          type="text"
          placeholder="Enter expense name"
          value={expenseName}
          onChange={(e) => setExpenseName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enter description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Expense"}
        </button>
      </form>
    </div>
  );
};

export default AddExpense;