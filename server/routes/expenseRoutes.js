const express = require("express");

const {
  addExpense,
  getGroupExpenses,
  markSplitPaid,
  getExpenseById,
  editExpense,
  getGroupBalance,
  getMyBalance,
} = require("../controllers/expenseController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
router.get("/getmybalance", authMiddleware, getMyBalance);
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
router.get("/:groupId/balance", authMiddleware, getGroupBalance);
module.exports = router;