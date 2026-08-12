import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
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
          `http://localhost:5000/api/groups/${groupId}`,
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
        `http://localhost:5000/api/expenses/${groupId}`,
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

  return (
    <div>
      <h2>Add Expense</h2>

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

        {/* Split Type */}
        <div>
          <p>Split Type</p>

          <label>
            <input
              type="radio"
              value="equal"
              checked={splitType === "equal"}
              onChange={(e) => setSplitType(e.target.value)}
            />
            Equal
          </label>

          <label>
            <input
              type="radio"
              value="unequal"
              checked={splitType === "unequal"}
              onChange={(e) => setSplitType(e.target.value)}
            />
            Unequal
          </label>
        </div>

        {/* Unequal Split */}
        {splitType === "unequal" && (
          <div>
            <h3>Enter each person's share</h3>

            {members.map((member) => (
              <div key={member._id}>
                <label>
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
                />
              </div>
            ))}

            <p>
              Entered: ₹{splitTotal.toFixed(2)}
            </p>

            <p>
              Total: ₹{numericAmount.toFixed(2)}
            </p>

            {Math.abs(splitTotal - numericAmount) < 0.01 &&
              numericAmount > 0 && (
                <p>✓ Split amounts match</p>
              )}

            {splitTotal > numericAmount && (
              <p>
                ⚠ Split exceeds total by ₹
                {(splitTotal - numericAmount).toFixed(2)}
              </p>
            )}

            {splitTotal < numericAmount &&
              splitTotal > 0 && (
                <p>
                  Remaining: ₹
                  {(numericAmount - splitTotal).toFixed(2)}
                </p>
              )}
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Expense"}
        </button>
      </form>
    </div>
  );
};

export default AddExpense;