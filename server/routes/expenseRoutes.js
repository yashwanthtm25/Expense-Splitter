const express = require("express");

const {
  addExpense,
  getGroupExpenses,
  markSplitPaid,
  getExpenseById,
  editExpense,
} = require("../controllers/expenseController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Add an expense to a group
router.post("/:groupId", authMiddleware, addExpense);

// Get all expenses of a group
router.get("/:groupId", authMiddleware, getGroupExpenses);

router.patch(
  "/:expenseId/pay/:userId",
  authMiddleware,
  markSplitPaid
);
router.get("/single/:expenseId", authMiddleware, getExpenseById);
router.put("/edit/:expenseId", authMiddleware, editExpense);
module.exports = router;