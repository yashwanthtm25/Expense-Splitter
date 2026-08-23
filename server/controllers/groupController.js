const Group = require("../models/Group");
const User = require("../models/User");
const Expense = require("../models/Expense");
const Notification = require("../models/Notification");
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
    
    await Notification.create({
      recipient: user._id,
      sender: req.user._id,
      type: "MEMBER_ADDED",
      message: `${req.user.name} added you to the group "${group.groupName}".`,
      group: group._id,
    });

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
    const oldGroupName = group.groupName;
    group.groupName = groupName.trim();

    await group.save();

    const notifications = group.members.filter(
      (member) => req.user._id.toString() !== member._id.toString()
    ).map((member) => ({
      recipient: member._id,
      sender: req.user._id,
      type: "GROUP_NAME_EDIT",
      message: `${req.user.name} changed the group name from "${oldGroupName}" to "${group.groupName}".`,
      group: group._id,
    }));
    await Notification.insertMany(notifications);
    res.status(200).json({
      message: "Group name updated successfully",
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

    await Notification.create({
      recipient: newAdminId,
      sender: req.user._id,
      type: "ADMIN_TRANSFERRED",
      message: `${req.user.name} transferred you admin rights of the group "${group.groupName}".`,
      group: group._id,
    });

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

    const isPayer = await Expense.find({
      group: groupId,
      "splits.user": userId,
    });

    const pendingPayer = isPayer.some((expense) =>
      expense.splits.some(
        (split) => split.paid === false)
    );

    if (pendingPayer) {
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

    const notifications = group.members.filter(
      (memberId) => req.user._id.toString() !== memberId.toString()
    ).map((memberId) => ({
      recipient: memberId,
      sender: req.user._id,
      type: "MEMBER_LEFT",
      message: `${req.user.name} left the group "${group.groupName}".`,
      group: group._id,
    }));

    await Notification.insertMany(notifications);
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
    await Notification.create({
      recipient: userId,
      sender: req.user._id,
      type: "MEMBER_REMOVED",
      message: `${req.user.name} removed you from the group "${group.groupName}".`,
      group: group._id,
    });
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

exports.getGroupById = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId)
      .populate("members", "name email")
      .populate("admin", "name email")
      .populate("createdBy", "name email");

    if (!group) {
      return res.status(404).json({
        message: "Group not found",
      });
    }

    // Check whether logged-in user belongs to group
    const isMember = group.members.some(
      (member) =>
        member._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this group",
      });
    }

    res.status(200).json({
      userId: req.user._id,
      group,
    });
  } catch (error) {
    console.error("Get group error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

exports.deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        message: "Group not found",
      });
    }

    // Only admin can delete the group
    if (group.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Only the admin can delete the group",
      });
    }

    const expenses = await Expense.find({ group: groupId });

    const hasUnpaid = expenses.some((expense) =>
      expense.splits.some((split) => !split.paid)
    );

    if (hasUnpaid) {
      return res.status(403).json({
        message: "Payments need to be settled.",
      });
    }
    await Group.findByIdAndDelete(groupId);
    await Promise.all(expenses.map((expense) => Expense.findByIdAndDelete(expense._id)));
    const notifications = group.members.filter((member) => req.user._id.toString() !== member.toString()).map((member) => ({
      recipient: member,
      sender: req.user._id,
      type: "GROUP_DELETED",
      message: `${req.user.name} deleted the group "${group.groupName}"and its expenses.`,
      group: groupId,
    }));
    Notification.insertMany(notifications);
    return res.status(200).json({
      message: "Group deleted successfully",
    });
  } catch (error) {
    console.error("Delete group error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};