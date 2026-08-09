const express = require("express");

const {
  createGroup,
  getMyGroups,
  addMember,
  updateGroup,
  transferAdmin,
  leaveGroup,
  removeMember,
} = require("../controllers/groupController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Create a new group
router.post("/", authMiddleware, createGroup);

// Get groups of logged-in user
router.get("/", authMiddleware, getMyGroups);

// Add a member to a group
router.post("/:groupId/members", authMiddleware, addMember);

// Update group details
router.patch("/:groupId", authMiddleware, updateGroup);

// Transfer admin rights
router.patch("/:groupId/admin", authMiddleware, transferAdmin);

// Leave a group
router.delete("/:groupId/leave", authMiddleware, leaveGroup);

// Remove a member from a group
router.delete("/:groupId/members/:userId", authMiddleware, removeMember);

module.exports = router;