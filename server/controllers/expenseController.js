const Expense = require("../models/Expense");
const Group = require("../models/Group");
const Notification = require("../models/Notification");

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

    // =====================================
    // CREATE NOTIFICATIONS
    // =====================================

    const notifications = expense.splits
      .filter(
        (split) =>
          split.user.toString() !== req.user._id.toString() &&
          split.amount >= 0
      )
      .map((split) => ({
        recipient: split.user,
        sender: req.user._id,
        type: "EXPENSE_ADDED",
        message: `${req.user.name} added expense "${expense.expenseName}" of ₹${expense.amount} in group "${group.groupName}". Your share is ₹${split.amount.toFixed(2)}.`,
        group: groupId,
        expense: expense._id,
      }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    // =====================================
    // RESPONSE
    // =====================================

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

    const expense = await Expense.findById(expenseId).populate("group", "groupName");

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
    await Notification.create({
      recipient: userId,
      sender: req.user._id,
      type: "SPLIT_PAID",
      message: `${req.user.name} marked your share ₹${split.amount.toFixed(2)} of the expense "${expense.expenseName}" in group "${expense.group.groupName}" as paid.`,
      group: expense.group._id,
      expense: expense._id,
    });
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
    const {
      amount,
      description,
      expenseName,
      splits,
    } = req.body;

    const expense = await Expense.findById(expenseId).populate(
      "group",
      "groupName members"
    );

    if (!expense) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    // Only payer can edit
    if (
      expense.paidBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Only the payer can edit this expense",
      });
    }

    // -----------------------------------------
    // Check whether any member has already paid
    // -----------------------------------------

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

    // -----------------------------------------
    // Validation
    // -----------------------------------------

    if (amount !== undefined && amount <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than 0",
      });
    }

    if (
      description !== undefined &&
      description.trim() === ""
    ) {
      return res.status(400).json({
        message: "Description is required",
      });
    }

    if (
      expenseName !== undefined &&
      expenseName.trim() === ""
    ) {
      return res.status(400).json({
        message: "Expense name is required",
      });
    }

    // -----------------------------------------
    // Store OLD values before changing anything
    // -----------------------------------------

    const oldAmount = Number(expense.amount);
    const oldExpenseName = expense.expenseName;
    const oldDescription = expense.description;
    const oldSplits = expense.splits.map((split) => ({
      user: split.user.toString(),
      amount: Number(split.amount),
    }));

    // -----------------------------------------
    // Determine changes
    // -----------------------------------------

    const amountChanged =
      amount !== undefined &&
      Number(amount) !== oldAmount;

    const nameChanged =
      expenseName !== undefined &&
      expenseName.trim() !== oldExpenseName;

    const descriptionChanged =
      description !== undefined &&
      description.trim() !== oldDescription;

    let splitsChanged = false;

    if (splits !== undefined) {
      if (!Array.isArray(splits)) {
        return res.status(400).json({
          message: "Invalid splits",
        });
      }

      // Compare old and new splits
      splitsChanged =
        oldSplits.length !== splits.length ||
        oldSplits.some((oldSplit) => {
          const newSplit = splits.find(
            (split) =>
              split.user.toString() === oldSplit.user
          );

          if (!newSplit) return true;

          return (
            Number(newSplit.amount) !== oldSplit.amount
          );
        });
    }

    // -----------------------------------------
    // Update fields
    // -----------------------------------------

    if (amount !== undefined) {
      expense.amount = Number(amount);
    }

    if (description !== undefined) {
      expense.description = description.trim();
    }
    let oldExpense = undefined;
    if (expenseName !== undefined) {
      oldExpense = expense.expenseName;
    }

    if (expenseName !== undefined) {
      expense.expenseName = expenseName.trim();
    }

    // -----------------------------------------
    // Update splits
    // -----------------------------------------

    if (splits !== undefined) {
      expense.splits = splits.map((split) => ({
        user: split.user,
        amount: Number(split.amount),
        paid:
          Number(split.amount) === 0 ||
          split.user.toString() ===
            expense.paidBy.toString(),
      }));
    }

    await expense.save();

    // -----------------------------------------
    // Create notifications
    // -----------------------------------------

    const notifications = [];

    const members = expense.group.members;

    // Amount + shares changed
    if (amountChanged && splitsChanged) {
      for (const memberId of members) {
        if (
          memberId.toString() ===
          req.user._id.toString()
        ) {
          continue;
        }

        notifications.push({
          recipient: memberId,
          sender: req.user._id,
          type: "EXPENSE_AMOUNT_SPLIT_UPDATED",
          message: `${req.user.name} updated the amount and shares of the expense "${expense.expenseName}" in group "${expense.group.groupName}".`,
          group: expense.group._id,
          expense: expense._id,
        });
      }
    }

    // Amount changed only
    else if (amountChanged) {
      for (const memberId of members) {
        if (
          memberId.toString() ===
          req.user._id.toString()
        ) {
          continue;
        }

        notifications.push({
          recipient: memberId,
          sender: req.user._id,
          type: "EXPENSE_AMOUNT_UPDATED",
          message: `${req.user.name} changed the amount of the expense "${expense.expenseName}" in group "${expense.group.groupName}" from ₹${oldAmount.toFixed(
            2
          )} to ₹${expense.amount.toFixed(2)}.`,
          group: expense.group._id,
          expense: expense._id,
        });
      }
    }

    // Shares changed only
    else if (splitsChanged) {
      for (const memberId of members) {
        if (
          memberId.toString() ===
          req.user._id.toString()
        ) {
          continue;
        }

        const newSplit = expense.splits.find(
          (split) =>
            split.user.toString() ===
            memberId.toString()
        );

        const oldSplit = oldSplits.find(
          (split) => 
            split.user.toString() ===
            memberId.toString()
        );

        if(oldSplit.amount != newSplit.amount) {
        notifications.push({
          recipient: memberId,
          sender: req.user._id,
          type: "EXPENSE_SPLIT_UPDATED",
          message: `${req.user.name} updated your share of the expense "${expense.expenseName}" in group "${expense.group.groupName}" to ₹${Number(
            newSplit?.amount || 0
          ).toFixed(2)}.`,
          group: expense.group._id,
          expense: expense._id,
        });
      }
      }
    }

    // Name + description changed
    if (nameChanged && descriptionChanged) {
      for (const memberId of members) {
        if (
          memberId.toString() ===
          req.user._id.toString()
        ) {
          continue;
        }

        notifications.push({
          recipient: memberId,
          sender: req.user._id,
          type: "EXPENSE_DETAILS_UPDATED",
          message: `${req.user.name} updated the name and description of the expense "${oldExpense}" in group "${expense.group.groupName}".`,
          group: expense.group._id,
          expense: expense._id,
        });
      }
    }

    // Name changed only
    else if (nameChanged) {
      for (const memberId of members) {
        if (
          memberId.toString() ===
          req.user._id.toString()
        ) {
          continue;
        }

        notifications.push({
          recipient: memberId,
          sender: req.user._id,
          type: "EXPENSE_NAME_UPDATED",
          message: `${req.user.name} changed the expense name from "${oldExpenseName}" to "${expense.expenseName}".`,
          group: expense.group._id,
          expense: expense._id,
        });
      }
    }

    // Description changed only
    else if (descriptionChanged) {
      for (const memberId of members) {
        if (
          memberId.toString() ===
          req.user._id.toString()
        ) {
          continue;
        }

        notifications.push({
          recipient: memberId,
          sender: req.user._id,
          type: "EXPENSE_DESCRIPTION_UPDATED",
          message: `${req.user.name} updated the description of the expense "${expense.expenseName}" in group "${expense.group.groupName}".`,
          group: expense.group._id,
          expense: expense._id,
        });
      }
    }

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    // -----------------------------------------
    // Response
    // -----------------------------------------

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

exports.requestPayment = async (req, res) => {
  try {
    const { expenseId } = req.params;

    const expense = await Expense.findById(expenseId).populate("group", "groupName");

    if (!expense) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    const split = expense.splits.find(
      (split) =>
        split.user.toString() === req.user._id.toString()
    );

    if (!split) {
      return res.status(403).json({
        message: "You are not part of this expense",
      });
    }

    // Payer does not need to request payment
    if (
      expense.paidBy.toString() ===
      req.user._id.toString()
    ) {
      return res.status(400).json({
        message: "The payer does not need to request payment",
      });
    }

    if (split.paid) {
      return res.status(400).json({
        message: "Your share is already paid",
      });
    }

    if (split.paymentRequested) {
      return res.status(400).json({
        message: "Payment request already sent",
      });
    }

    split.paymentRequested = true;
    split.paymentRequestedAt = new Date();

    await expense.save();

    await Notification.create({
      recipient: expense.paidBy,
      sender: req.user._id,
      type: "PAYMENT_REQUESTED",
      message: `${req.user.name} says they paid ₹${split.amount.toFixed(
        2
      )} for the expense "${expense.expenseName}" of group "${expense.group.groupName}".`,
      group: expense.group._id,
      expense: expense._id,
    });

    res.status(200).json({
      message: "Payment request sent",
      expense,
    });
  } catch (error) {
    console.error("Request payment error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;

    const expense = await Expense.findById(expenseId)
      .populate("group", "groupName");

    if (!expense) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    // Only the payer can delete the expense
    if (
      expense.paidBy.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Only the payer can delete this expense",
      });
    }

    // Check whether another member has already paid
    const alreadyPaid = expense.splits.some(
      (split) =>
        split.user.toString() !== req.user._id.toString() &&
        split.paid === true &&
        split.amount > 0
    );

    if (alreadyPaid) {
      return res.status(400).json({
        message:
          "Expense cannot be deleted because a member has already paid",
      });
    }

    const alreadyReported = expense.splits.some(
      (split) =>
        split.user.toString() !== req.user._id.toString() &&
        split.paymentRequested === true &&
        split.amount > 0
    )

    if (alreadyReported) {
      return res.status(400).json({
        message:
          "Expense cannot be deleted because a member has already reported",
      });
    }

    // Store affected members before deleting the expense
    const affectedMembers = expense.splits.filter(
      (split) =>
        split.user.toString() !== req.user._id.toString() &&
        split.amount > 0
    );

    // Delete expense
    await Expense.findByIdAndDelete(expenseId);

    // Notify affected members
    const notifications = affectedMembers.map((split) => ({
      recipient: split.user,
      sender: req.user._id,
      type: "EXPENSE_DELETED",
      message: `${req.user.name} deleted the expense "${expense.expenseName}" from the group "${expense.group.groupName}".`,
      group: expense.group._id,
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(200).json({
      message: "Expense deleted successfully",
    });
  } catch (error) {
    console.error("Delete expense error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};