
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Group = () => {
  const [groups, setGroups] = useState([]);

  const [editingGroup, setEditingGroup] = useState(null);
  const [groupName, setGroupName] = useState("");

  const [loading, setLoading] = useState(false);

  const [responseuser, setResponseUser] = useState(null);

  // Used for two-step confirmation
  const [confirmAction, setConfirmAction] = useState(null);

  // Used when transferring admin
  const [selectedAdmin, setSelectedAdmin] = useState({});

  const navigate = useNavigate();

  const fetchGroups = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await axios.get(
        "http://localhost:5000/api/groups",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setGroups(response.data.groups);
      setResponseUser(response.data.userId);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to fetch groups"
      );
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    fetchGroups();
  }, [navigate]);

  // =========================
  // EDIT GROUP
  // =========================

  const handleEditClick = (group) => {
    setEditingGroup(group._id);
    setGroupName(group.groupName);
  };

  const handleUpdateGroup = async (groupId) => {
    if (!groupName.trim()) {
      toast.error("Group name is required");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      await axios.patch(
        `http://localhost:5000/api/groups/${groupId}`,
        {
          groupName: groupName.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Group updated successfully");

      setEditingGroup(null);
      setGroupName("");

      await fetchGroups();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to update group"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // REMOVE MEMBER
  // =========================

  const handleRemoveMember = async (groupId, userId) => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      await axios.delete(
        `http://localhost:5000/api/groups/${groupId}/members/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Member removed successfully");

      setConfirmAction(null);

      await fetchGroups();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to remove member"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LEAVE GROUP
  // =========================

  const handleLeaveGroup = async (groupId) => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      await axios.delete(
        `http://localhost:5000/api/groups/${groupId}/leave`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("You left the group");

      setConfirmAction(null);

      await fetchGroups();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to leave group"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // TRANSFER ADMIN
  // =========================

  const handleTransferAdmin = async (
    groupId,
    newAdminId
  ) => {
    if (!newAdminId) {
      toast.error("Select a member");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      await axios.patch(
        `http://localhost:5000/api/groups/${groupId}/admin`,
        {
          newAdminId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Admin transferred successfully");

      setSelectedAdmin((prev) => ({
        ...prev,
        [groupId]: "",
      }));

      await fetchGroups();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to transfer admin"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>My Groups</h1>

      {groups.length === 0 ? (
        <p>No groups found</p>
      ) : (
        groups.map((group) => {
          const isAdmin =
            String(group.admin?._id) ===
            String(responseuser);

          const isCreator =
            String(group.createdBy?._id) ===
            String(responseuser);

          const currentUserMember = group.members.find(
            (member) =>
              String(member._id) === String(responseuser)
          );

          return (
            <div key={group._id}>
              {editingGroup === group._id ? (
                <>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) =>
                      setGroupName(e.target.value)
                    }
                  />

                  <button
                    onClick={() =>
                      handleUpdateGroup(group._id)
                    }
                    disabled={loading}
                  >
                    {loading
                      ? "Updating..."
                      : "Save"}
                  </button>

                  <button
                    onClick={() => {
                      setEditingGroup(null);
                      setGroupName("");
                    }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <h2>{group.groupName}</h2>

                  <p>
                    Members: {group.members.length}
                  </p>

                  <p>
                    Members:{" "}
                    {group.members
                      .map((member) => member.name)
                      .join(", ")}
                  </p>

                  <p> Created By: {group.createdBy?.name}</p>
                  <p> Admin: {group.admin?.name}</p>
                  {/* =========================
                      EDIT
                      Only creator can see it
                     ========================= */}

                  {isAdmin && (
                    <button
                      onClick={() =>
                        handleEditClick(group)
                      }
                    >
                      Edit
                    </button>
                  )}

                  {/* =========================
                      ADD MEMBER
                     ========================= */}

                  <button
                    onClick={() =>
                      navigate(
                        `/add-member/${group._id}`
                      )
                    }
                  >
                    Add Member
                  </button>

                  {/* =========================
                      ADD EXPENSE
                     ========================= */}

                  <button
                    onClick={() =>
                      navigate(
                        `/add-expense/${group._id}`
                      )
                    }
                  >
                    Add Expense
                  </button>

                  {/* =========================
                      VIEW EXPENSES
                     ========================= */}

                  <button
                    onClick={() =>
                      navigate(
                        `/expenses/${group._id}`
                      )
                    }
                  >
                    View Expenses
                  </button>

                  {/* =========================
                      ADMIN CONTROLS
                     ========================= */}

                  {isAdmin && (
                    <div>
                      <h3>Admin Controls</h3>

                      {/* Transfer Admin */}

                      <select
                        value={
                          selectedAdmin[group._id] || ""
                        }
                        onChange={(e) =>
                          setSelectedAdmin((prev) => ({
                            ...prev,
                            [group._id]:
                              e.target.value,
                          }))
                        }
                      >
                        <option value="">
                          Select new admin
                        </option>

                        {group.members
                          .filter(
                            (member) =>
                              String(member._id) !==
                              String(responseuser)
                          )
                          .map((member) => (
                            <option
                              key={member._id}
                              value={member._id}
                            >
                              {member.name}
                            </option>
                          ))}
                      </select>

                      <button
                        onClick={() =>
                          handleTransferAdmin(
                            group._id,
                            selectedAdmin[group._id]
                          )
                        }
                        disabled={
                          loading ||
                          !selectedAdmin[group._id]
                        }
                      >
                        Transfer Admin
                      </button>

                      {/* Remove Members */}

                      <h4>Remove Members</h4>

                      {group.members
                        .filter(
                          (member) =>
                            String(member._id) !==
                            String(responseuser)
                        )
                        .map((member) => (
                          <div key={member._id}>
                            <span>
                              {member.name}
                            </span>

                            {confirmAction?.type ===
                              "remove" &&
                            confirmAction?.groupId ===
                              group._id &&
                            confirmAction?.userId ===
                              member._id ? (
                              <>
                                <button
                                  onClick={() =>
                                    handleRemoveMember(
                                      group._id,
                                      member._id
                                    )
                                  }
                                  disabled={loading}
                                >
                                  {loading
                                    ? "Removing..."
                                    : "Confirm Remove"}
                                </button>

                                <button
                                  onClick={() =>
                                    setConfirmAction(
                                      null
                                    )
                                  }
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() =>
                                  setConfirmAction({
                                    type: "remove",
                                    groupId:
                                      group._id,
                                    userId:
                                      member._id,
                                  })
                                }
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        ))}
                    </div>
                  )}

                  {/* =========================
                      LEAVE GROUP
                      Normal member
                     ========================= */}

                  {!isAdmin &&
                    currentUserMember && (
                      <div>
                        {confirmAction?.type ===
                          "leave" &&
                        confirmAction?.groupId ===
                          group._id ? (
                          <>
                            <p>
                              Are you sure you want
                              to leave this group?
                            </p>

                            <button
                              onClick={() =>
                                handleLeaveGroup(
                                  group._id
                                )
                              }
                              disabled={loading}
                            >
                              {loading
                                ? "Leaving..."
                                : "Confirm Leave"}
                            </button>

                            <button
                              onClick={() =>
                                setConfirmAction(null)
                              }
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() =>
                              setConfirmAction({
                                type: "leave",
                                groupId:
                                  group._id,
                              })
                            }
                          >
                            Leave Group
                          </button>
                        )}
                      </div>
                    )}

                  {/* =========================
                      ADMIN CANNOT LEAVE DIRECTLY
                     ========================= */}

                  {isAdmin && (
                    <p>
                      You are the admin. Transfer
                      admin before leaving the group.
                    </p>
                  )}
                </>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default Group;