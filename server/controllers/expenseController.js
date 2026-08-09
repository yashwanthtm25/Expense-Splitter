const Expense = require("../models/Expense");
const Group = require("../models/Group");

// Add an expense
exports.addExpense = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { amount, description, expenseName } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than 0",
      });
    }
    if(!description || description.trim() === "") {
      return res.status(400).json({
        message: "Description is required",
      });
    }
    if(!expenseName || expenseName.trim() === "") {
      return res.status(400).json({
        message: "Expense name is required",
      });
    }
    // Check whether group exists
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        message: "Group not found",
      });
    }

    // Check whether logged-in user belongs to the group
    const isMember = group.members.some(
      (memberId) => memberId.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this group",
      });
    }
        // Calculate equal share
    const share = amount / group.members.length;

    // Create split for every group member
    const splits = group.members.map((memberId) => ({
      user: memberId,
      amount: share,
      paid: memberId.toString() === req.user._id.toString(),
    }));
    const expense = await Expense.create({
      group: groupId,
      paidBy: req.user._id,
      splits,
      amount,
      description,
      expenseName,
    });

    res.status(201).json({
      message: "Expense added successfully",
      expense,
    });
  } catch (error) {
  console.error("Add expense error:", error);

  res.status(500).json({
    message: error.message,
  });
}
};


// Get all expenses of a group
exports.getGroupExpenses = async (req, res) => {
  try {
    const { groupId } = req.params;

    // Check whether group exists
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        message: "Group not found",
      });
    }

    // Check whether logged-in user belongs to the group
    const isMember = group.members.some(
      (memberId) => memberId.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this group",
      });
    }

    const expenses = await Expense.find({
      group: groupId,
    }).populate("paidBy", "name email")
    .populate("splits.user", "name email");
    res.status(200).json({
      user: req.user,
      expenses,
    });
  } catch (error) {
    console.error("Get expenses error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};
exports.markSplitPaid = async (req, res) => {
  try {
    const { expenseId, userId } = req.params;

    const expense = await Expense.findById(expenseId);

    if (!expense) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    // Only the person who paid the expense can mark someone as paid
    if (expense.paidBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Only the payer can mark a payment as paid",
      });
    }

    const split = expense.splits.find(
      (split) => split.user.toString() === userId
    );

    if (!split) {
      return res.status(404).json({
        message: "User is not part of this expense",
      });
    }

    if (split.paid) {
      return res.status(400).json({
        message: "Payment is already marked as paid",
      });
    }

    split.paid = true;

    await expense.save();

    res.status(200).json({
      message: "Payment marked as paid",
      expense,
    });
  } catch (error) {
    console.error("Mark split paid error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};
exports.getExpenseById = async (req, res) => {
  try {
    const { expenseId } = req.params;

    const expense = await Expense.findById(expenseId)
      .populate("paidBy", "name email")
      .populate("splits.user", "name email");

    if (!expense) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    // Only members of the group can view the expense
    const group = await Group.findById(expense.group);

    if (!group) {
      return res.status(404).json({
        message: "Group not found",
      });
    }

    const isMember = group.members.some(
      (memberId) =>
        memberId.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this group",
      });
    }

    res.status(200).json({
      expense,
    });
  } catch (error) {
    console.error("Get expense error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};
exports.editExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const { amount, description, expenseName } = req.body;

    const expense = await Expense.findById(expenseId);

    if (!expense) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    // Only the payer can edit the expense
    if (
      expense.paidBy.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Only the payer can edit this expense",
      });
    }

    // Check whether any split has already been paid
    const hasPaidSplit = expense.splits.some(
      (split) => split.paid
    );

    // Amount validation
    if (amount !== undefined) {
      if (amount <= 0) {
        return res.status(400).json({
          message: "Amount must be greater than 0",
        });
      }

      // Don't change amount after payment has started
      if (hasPaidSplit && amount !== expense.amount) {
        return res.status(400).json({
          message:
            "Amount cannot be changed after a payment has been made",
        });
      }
    }

    // Description validation
    if (
      description !== undefined &&
      description.trim() === ""
    ) {
      return res.status(400).json({
        message: "Description is required",
      });
    }

    // Expense name validation
    if (
      expenseName !== undefined &&
      expenseName.trim() === ""
    ) {
      return res.status(400).json({
        message: "Expense name is required",
      });
    }

    // Update amount and recalculate splits
    if (
      amount !== undefined &&
      amount !== expense.amount
    ) {
      const share = amount / expense.splits.length;

      expense.splits.forEach((split) => {
        split.amount = share;
      });

      expense.amount = amount;
    }

    // Update other fields
    if (description !== undefined) {
      expense.description = description.trim();
    }

    if (expenseName !== undefined) {
      expense.expenseName = expenseName.trim();
    }

    await expense.save();

    res.status(200).json({
      message: "Expense updated successfully",
      expense,
    });
  } catch (error) {
    console.error("Update expense error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};