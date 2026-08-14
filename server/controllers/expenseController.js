const Expense = require("../models/Expense");
const Group = require("../models/Group");

// Add an expense
exports.addExpense = async (req, res) => {
  try {
    const { groupId } = req.params;
    const {
      amount,
      description,
      expenseName,
      splitType = "equal",
      splits,
    } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than 0",
      });
    }

    // Validate description
    if (!description || description.trim() === "") {
      return res.status(400).json({
        message: "Description is required",
      });
    }

    // Validate expense name
    if (!expenseName || expenseName.trim() === "") {
      return res.status(400).json({
        message: "Expense name is required",
      });
    }

    // Validate split type
    if (!["equal", "unequal"].includes(splitType)) {
      return res.status(400).json({
        message: "Invalid split type",
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
      (memberId) =>
        memberId.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this group",
      });
    }

    let finalSplits;

    // =====================================
    // EQUAL SPLIT
    // =====================================
    if (splitType === "equal") {
      const share = amount / group.members.length;

      finalSplits = group.members.map((memberId) => ({
        user: memberId,
        amount: share,
        paid:
          memberId.toString() === req.user._id.toString(),
      }));
    }

    // =====================================
    // UNEQUAL SPLIT
    // =====================================
    else {
      // Check splits were provided
      if (!splits || !Array.isArray(splits)) {
        return res.status(400).json({
          message: "Splits are required for unequal splitting",
        });
      }

      // Every group member must have a split
      if (splits.length !== group.members.length) {
        return res.status(400).json({
          message: "Split must be provided for every group member",
        });
      }

      // Check that all users belong to the group
      for (const split of splits) {
        const isGroupMember = group.members.some(
          (memberId) =>
            memberId.toString() === split.user.toString()
        );

        if (!isGroupMember) {
          return res.status(400).json({
            message: "Invalid user in splits",
          });
        }

        if (
          split.amount === undefined ||
          split.amount === null ||
          split.amount < 0
        ) {
          return res.status(400).json({
            message: "Split amount cannot be negative",
          });
        }
      }

      // Check for duplicate users
      const userIds = splits.map((split) =>
        split.user.toString()
      );

      const uniqueUserIds = new Set(userIds);

      if (uniqueUserIds.size !== splits.length) {
        return res.status(400).json({
          message: "Duplicate users are not allowed in splits",
        });
      }

      // Calculate total split amount
      const splitTotal = splits.reduce(
        (total, split) => total + Number(split.amount),
        0
      );

      // Handle floating-point precision
      if (Math.abs(splitTotal - Number(amount)) > 0.01) {
        return res.status(400).json({
          message: `Split amounts must equal the total expense amount. Total: ${amount}, Split: ${splitTotal}`,
        });
      }

      // Create final splits
      finalSplits = splits.map((split) => ({
        user: split.user,
        amount: Number(split.amount),
        paid:
          split.user.toString() === req.user._id.toString() || split.amount === 0,
      }));
    }

    // =====================================
    // CREATE EXPENSE
    // =====================================

    const expense = await Expense.create({
      group: groupId,
      paidBy: req.user._id,
      splits: finalSplits,
      amount,
      description: description.trim(),
      expenseName: expenseName.trim(),
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
    split.paidAt = new Date();
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
    const { amount, description, expenseName, splits} = req.body;

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

    const otherSplits = expense.splits.filter(
      (split) =>
        split.user.toString() !== expense.paidBy.toString()
    );

    const alreadyPaid = otherSplits.some(
      (split) => split.paid === true && split.amount > 0
    );

    if (alreadyPaid) {
      return res.status(400).json({
        message:
          "Expense cannot be edited because a member has already paid",
      });
    }

    // Amount validation
    if (amount !== undefined) {
      if (amount <= 0) {
        return res.status(400).json({
          message: "Amount must be greater than 0",
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

    // Update other fields
    if (description !== undefined) {
      expense.description = description.trim();
    }

    if (expenseName !== undefined) {
      expense.expenseName = expenseName.trim();
    }
    splits.map((split) => {
      if(split.amount  > 0 ) {
        split.paid = false;
      }
      if(split.amount === 0) {
        split.paid = true;
      }
      if(split.user === expense.paidBy.toString()) {
        split.paid = true;
      }
    });
    expense.splits = splits;
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
exports.getGroupBalance = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    // Check group
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        message: "Group not found",
      });
    }

    // Check membership
    const isMember = group.members.some(
      (memberId) =>
        memberId.toString() === userId.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this group",
      });
    }

    const expenses = await Expense.find({
      group: groupId,
    });

    let totalPaid = 0;
    let totalOwe = 0;
    let totalReceive = 0;

    expenses.forEach((expense) => {
      const isPayer =
        expense.paidBy.toString() === userId.toString();

      // Amount actually paid by the user
      if (isPayer) {
        totalPaid += expense.amount;
      }

      expense.splits.forEach((split) => {
        const isMySplit =
          split.user.toString() === userId.toString();

        // User owes money
        if (
          isMySplit &&
          !split.paid &&
          !isPayer
        ) {
          totalOwe += split.amount;
        }

        // Other members owe money to the user
        if (
          isPayer &&
          split.user.toString() !== userId.toString() &&
          !split.paid
        ) {
          totalReceive += split.amount;
        }
      });
    });

    const netBalance =
      totalReceive - totalOwe;

    res.status(200).json({
      totalPaid,
      totalOwe,
      totalReceive,
      netBalance,
    });
  } catch (error) {
    console.error("Get group balance error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};


// Get overall balance of logged-in user
exports.getMyBalance = async (req, res) => {
  try {
    const userId = req.user._id;

    const expenses = await Expense.find({
      $or: [
        { paidBy: userId },
        { "splits.user": userId },
      ],
    });

    let amountOwed = 0;
    let amountReceive = 0;
    let netBalance = 0;
    expenses.forEach((expense) => {
      
      if (expense.paidBy.toString() === userId.toString()) {
        expense.splits.forEach((split) => {
          if (
            split.user.toString() !== userId.toString() &&
            !split.paid
          ) {
            amountReceive += split.amount;
          }
        });
      }

      expense.splits.forEach((split) => {
        if (
          split.user.toString() === userId.toString() &&
          expense.paidBy.toString() !== userId.toString() &&
          !split.paid
        ) {
          amountOwed += split.amount;
        }
      });
    });
    netBalance = amountReceive - amountOwed;
    res.status(200).json({
      amountOwed,
      amountReceive,
      netBalance,
    });
  } catch (error) {
    console.error("Get balance error:", error);

    res.status(500).json({
      message: "Failed to fetch balance",
    });
  }
};
