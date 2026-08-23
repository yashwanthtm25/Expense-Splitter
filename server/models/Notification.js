const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    type: {
      type: String,
      enum: [
        "MEMBER_REMOVED",
        "EXPENSE_ADDED",
        "SPLIT_PAID",
        "ADMIN_TRANSFERRED",
        "MEMBER_ADDED",
        "GROUP_NAME_EDIT",
        "MEMBER_LEFT",
        "EXPENSE_NAME_UPDATED",
        "EXPENSE_DESCRIPTION_UPDATED",
        "EXPENSE_AMOUNT_UPDATED",
        "EXPENSE_SPLIT_UPDATED",
        "EXPENSE_AMOUNT_SPLIT_UPDATED",
        "EXPENSE_DETAILS_UPDATED",
        "PAYMENT_REQUESTED",
        "GROUP_DELETED",
        "EXPENSE_DELETED",
      ],
      required: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      default: null,
    },

    expense: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expense",
      default: null,
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", notificationSchema);