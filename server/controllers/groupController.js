const Group = require("../models/Group");
const User = require("../models/User");
const Expense = require("../models/Expense");
// Create a new group
exports.createGroup = async (req, res) => {
  try {
    const { groupName } = req.body;

    if (!groupName || groupName.trim() === "") {
      return res.status(400).json({
        message: "Group name is required",
      });
    }
    const exist = await Group.findOne({ groupName: groupName.trim() });
    if (exist) {
      return res.status(400).json({
        message: "Group name already exists",
      });
    }
    const group = await Group.create({
      groupName: groupName.trim(),
      createdBy: req.user._id,
      admin: req.user._id,
      members: [req.user._id],
    });

    res.status(201).json({
      message: "Group created successfully",
      group,
    });
  } catch (error) {
    console.error("Create group error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Get groups of logged-in user
exports.getMyGroups = async (req, res) => {
  try {
    const groups = await Group.find({
      members: req.user._id,
    }).populate("members", "name email")
    .populate("createdBy", "name email")
    .populate("admin", "name email");

    res.status(200).json({
      userId: req.user._id,
      groups,
    });
  } catch (error) {
    console.error("Get groups error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Add a member to a group
exports.addMember = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Member email is required",
      });
    }

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        message: "Group not found",
      });
    }

    if (group.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Only the group admin can add members",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const alreadyMember = group.members.some(
      (memberId) => memberId.toString() === user._id.toString()
    );

    if (alreadyMember) {
      return res.status(400).json({
        message: "User is already a member",
      });
    }

    group.members.push(user._id);

    await group.save();

    res.status(200).json({
      message: "Member added successfully",
      group,
    });
  } catch (error) {
    console.error("Add member error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};
exports.updateGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { groupName } = req.body;

    if (!groupName || groupName.trim() === "") {
      return res.status(400).json({
        message: "Group name is required",
      });
    }

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        message: "Group not found",
      });
    }

    // Only the admin can update the group
    if (
      group.admin.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Only the group admin can update the group",
      });
    }

    group.groupName = groupName.trim();

    await group.save();

    res.status(200).json({
      message: "Group updated successfully",
      group,
    });
  } catch (error) {
    console.error("Update group error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};
exports.transferAdmin = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { newAdminId } = req.body;

    if (!newAdminId) {
      return res.status(400).json({
        message: "New admin is required",
      });
    }

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        message: "Group not found",
      });
    }

    // Only current admin can transfer admin
    if (
      group.admin.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Only the group admin can transfer admin",
      });
    }

    // New admin must be a group member
    const isMember = group.members.some(
      (memberId) =>
        memberId.toString() === newAdminId.toString()
    );

    if (!isMember) {
      return res.status(400).json({
        message: "New admin must be a group member",
      });
    }

    // Don't transfer to yourself
    if (
      newAdminId.toString() === req.user._id.toString()
    ) {
      return res.status(400).json({
        message: "You are already the admin",
      });
    }

    group.admin = newAdminId;

    await group.save();

    res.status(200).json({
      message: "Admin transferred successfully",
      group,
    });
  } catch (error) {
    console.error("Transfer admin error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};
exports.leaveGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        message: "Group not found",
      });
    }

    // Check whether user is a member
    const isMember = group.members.some(
      (memberId) =>
        memberId.toString() === userId.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this group",
      });
    }

    // Admin must transfer admin before leaving
    if (
      group.admin.toString() === userId.toString()
    ) {
      return res.status(400).json({
        message: "Transfer admin before leaving the group",
      });
    }

    // Find expenses where this user has an unpaid split
    const pendingExpense = await Expense.findOne({
      group: groupId,
      splits: {
        $elemMatch: {
          user: userId,
          paid: false,
        },
      },
    });

    if (pendingExpense) {
      return res.status(400).json({
        message:
          "You cannot leave until all your payments are completed",
      });
    }

    // Remove user from group
    group.members = group.members.filter(
      (memberId) =>
        memberId.toString() !== userId.toString()
    );

    await group.save();

    res.status(200).json({
      message: "You left the group successfully",
    });
  } catch (error) {
    console.error("Leave group error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};
exports.removeMember = async (req, res) => {
  try {
    const { groupId, userId } = req.params;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        message: "Group not found",
      });
    }

    // Only admin can remove members
    if (
      group.admin.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Only the group admin can remove members",
      });
    }

    // Check whether target user is a member
    const isMember = group.members.some(
      (memberId) =>
        memberId.toString() === userId.toString()
    );

    if (!isMember) {
      return res.status(404).json({
        message: "User is not a member of this group",
      });
    }

    // Admin cannot remove themselves
    if (
      userId.toString() === req.user._id.toString()
    ) {
      return res.status(400).json({
        message: "Admin cannot remove themselves",
      });
    }

    // Check whether the member has any unpaid split
    const pendingExpense = await Expense.findOne({
      group: groupId,
      splits: {
        $elemMatch: {
          user: userId,
          paid: false,
        },
      },
    });

    if (pendingExpense) {
      return res.status(400).json({
        message:
          "Cannot remove member because they have pending payments",
      });
    }

    // Remove member
    group.members = group.members.filter(
      (memberId) =>
        memberId.toString() !== userId.toString()
    );

    await group.save();

    res.status(200).json({
      message: "Member removed successfully",
    });
  } catch (error) {
    console.error("Remove member error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};