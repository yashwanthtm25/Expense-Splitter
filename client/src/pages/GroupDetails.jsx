import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

const GroupDetails = () => {
  const [group, setGroup] = useState(null);
  const [balance, setBalance] = useState(null);
  const [userId, setUserId] = useState(null);

  const [editingGroup, setEditingGroup] = useState(false);
  const [groupName, setGroupName] = useState("");

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // Confirmation modal
  const [confirmation, setConfirmation] = useState({
    type: null,
    member: null,
  });

  const navigate = useNavigate();
  const { groupId } = useParams();

  const token = localStorage.getItem("token");

  // --------------------------------------------------
  // Fetch group
  // --------------------------------------------------

  const fetchGroup = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/groups/${groupId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setGroup(response.data.group);
      setUserId(response.data.userId);
      setGroupName(response.data.group.groupName);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to fetch group"
      );
    }
  };

  // --------------------------------------------------
  // Fetch balance
  // --------------------------------------------------

  const fetchBalance = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/expenses/${groupId}/balance`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBalance(response.data);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to fetch balance"
      );
    }
  };

  // --------------------------------------------------
  // Initial page load
  // --------------------------------------------------

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const loadPage = async () => {
      try {
        setPageLoading(true);

        await Promise.all([
          fetchGroup(),
          fetchBalance(),
        ]);
      } finally {
        setPageLoading(false);
      }
    };

    loadPage();
  }, [groupId, navigate]);

  // --------------------------------------------------
  // Edit group
  // --------------------------------------------------

  const handleUpdateGroup = async () => {
    if (!groupName.trim()) {
      toast.error("Group name is required");
      return;
    }

    try {
      setLoading(true);

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

      setEditingGroup(false);

      await fetchGroup();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to update group"
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // Remove member
  // --------------------------------------------------

  const handleRemoveMember = async () => {
    const member = confirmation.member;

    if (!member) return;

    try {
      setLoading(true);

      await axios.delete(
        `http://localhost:5000/api/groups/${groupId}/members/${member._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(
        `${member.name} removed from the group`
      );

      setConfirmation({
        type: null,
        member: null,
      });

      await Promise.all([
        fetchGroup(),
        fetchBalance(),
      ]);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to remove member"
      );
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteGroup = async () => {
  try {
    setLoading(true);

    await axios.delete(
      `http://localhost:5000/api/groups/${groupId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    toast.success("Group deleted successfully");

    navigate("/groups");
  } catch (error) {
    toast.error(
      error.response?.data?.message ||
        "Failed to delete group"
    );
  } finally {
    setLoading(false);
  }
};
  // --------------------------------------------------
  // Transfer admin
  // --------------------------------------------------

  const handleTransferAdmin = async () => {
    const member = confirmation.member;

    if (!member) return;

    try {
      setLoading(true);

      await axios.patch(
        `http://localhost:5000/api/groups/${groupId}/admin`,
        {
          newAdminId: member._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(
        `${member.name} is now the group admin`
      );

      setConfirmation({
        type: null,
        member: null,
      });

      await fetchGroup();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to transfer admin"
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // Leave group
  // --------------------------------------------------

  const handleLeaveGroup = async () => {
    try {
      setLoading(true);

      await axios.delete(
        `http://localhost:5000/api/groups/${groupId}/leave`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("You left the group");

      navigate("/groups");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to leave group"
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // Open confirmation
  // --------------------------------------------------

  const openConfirmation = (type, member = null) => {
    setConfirmation({
      type,
      member,
    });
  };

  // --------------------------------------------------
  // Close confirmation
  // --------------------------------------------------

  const closeConfirmation = () => {
    if (loading) return;

    setConfirmation({
      type: null,
      member: null,
    });
  };

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (pageLoading) {
    return <p>Loading group...</p>;
  }

  if (!group) {
    return <p>Group not found</p>;
  }

  // --------------------------------------------------
  // Admin check
  // --------------------------------------------------

  const isAdmin =
    String(group.admin?._id) === String(userId);
    const isCreator = 
        String(group.createdBy?._id) === String(userId);
    const isOnlyMember = group.members.length === 1;

  return (
    <div>
      {/* =================================================
          BACK
      ================================================= */}

      <button onClick={() => navigate("/groups")}>
        ← Back to Groups
      </button>

      {/* =================================================
          GROUP NAME
      ================================================= */}

      <div>
        {editingGroup ? (
          <>
            <input
              type="text"
              value={groupName}
              onChange={(e) =>
                setGroupName(e.target.value)
              }
            />

            <button
              onClick={handleUpdateGroup}
              disabled={loading}
            >
              {loading ? "Updating..." : "Save"}
            </button>

            <button
              onClick={() => {
                setEditingGroup(false);
                setGroupName(group.groupName);
              }}
              disabled={loading}
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <h1>{group.groupName}</h1>

            {/* Only ADMIN can edit */}
            {isAdmin && (
              <button
                onClick={() => setEditingGroup(true)}
              >
                Edit
              </button>
            )}
          </>
        )}
      </div>

      {/* =================================================
          ADMIN
      ================================================= */}

      <div>
        <h3>
          Admin: {group.admin?.name}
        </h3>
        <h3>
            Created by: {group.createdBy?.name}
        </h3>

        {isAdmin && <p>You are the admin.</p>}
        {isCreator && <p>You are the creator of this group.</p>}
      </div>

      {/* =================================================
          BALANCE SUMMARY
      ================================================= */}

      {balance && (
        <div>
          <h2>Balance Summary</h2>

          <p>
            You paid: ₹
            {Number(balance.totalPaid).toFixed(2)}
          </p>

          <p>
            You owe: ₹
            {Number(balance.totalOwe).toFixed(2)}
          </p>

          <p>
            You should receive: ₹
            {Number(balance.totalReceive).toFixed(2)}
          </p>

          <p>
            Net balance: ₹
            {Number(balance.netBalance).toFixed(2)}
          </p>
        </div>
      )}

      {/* =================================================
          MEMBERS
      ================================================= */}

      <div>
        <h2>
          Members ({group.members.length})
        </h2>

        {group.members.map((member) => {
          const isCurrentUser =
            String(member._id) === String(userId);

          const isMemberAdmin =
            String(member._id) ===
            String(group.admin?._id);
          const isMemberCreator =
            String(member._id) ===
            String(group.createdBy?._id);

          return (
            <div key={member._id}>
              <span>
                {member.name}

                {isMemberAdmin && " — Admin"}

                {isCurrentUser && " — You"}
                
                {isMemberCreator && " — Creator"}
              </span>

              {/* =========================================
                  ADMIN CONTROLS
              ========================================= */}

              {isAdmin &&
                !isCurrentUser &&
                !isMemberAdmin && (
                  <div>
                    <button
                      onClick={() =>
                        openConfirmation(
                          "remove",
                          member
                        )
                      }
                    >
                      Remove
                    </button>

                    <button
                      onClick={() =>
                        openConfirmation(
                          "transfer",
                          member
                        )
                      }
                    >
                      Transfer Admin
                    </button>
                  </div>
                )}
            </div>
          );
        })}
      </div>

      {/* =================================================
          ACTION BUTTONS
      ================================================= */}

      <div>
        {/* Admin only */}
        {isAdmin && (
          <button
            onClick={() =>
              navigate(`/add-member/${groupId}`)
            }
          >
            Add Member
          </button>
        )}

        <button
          onClick={() =>
            navigate(`/add-expense/${groupId}`)
          }
        >
          Add Expense
        </button>

        <button
          onClick={() =>
            navigate(`/expenses/${groupId}`)
          }
        >
          View Expenses
        </button>
      </div>

      {/* =================================================
          LEAVE GROUP
      ================================================= */}

      <div>
        {isOnlyMember ? (
            <button
                onClick={() => openConfirmation("delete")}
            >
                Delete Group
            </button>
            ) : (
            <button
                onClick={() => openConfirmation("leave")}
            >
                Leave Group
            </button>
        )}
      </div>

      {/* =================================================
          CONFIRMATION
      ================================================= */}
      {confirmation.type === "delete" && (
  <>
    <h2>Delete Group?</h2>

    <p>
      You are the only member of{" "}
      <strong>{group.groupName}</strong>.
    </p>

    <p>
      Are you sure you want to permanently delete
      this group?
    </p>

    <button
      onClick={closeConfirmation}
      disabled={loading}
    >
      Cancel
    </button>

    <button
      onClick={handleDeleteGroup}
      disabled={loading}
    >
      {loading ? "Deleting..." : "Yes, Delete Group"}
    </button>
  </>
)}

      {confirmation.type && (
        <div>
          <div>
            {/* ===========================================
                REMOVE CONFIRMATION
            =========================================== */}

            {confirmation.type === "remove" && (
              <>
                <h2>Remove Member?</h2>

                <p>
                  Are you sure you want to remove{" "}
                  <strong>
                    {confirmation.member?.name}
                  </strong>{" "}
                  from this group?
                </p>

                <button
                  onClick={closeConfirmation}
                  disabled={loading}
                >
                  Cancel
                </button>

                <button
                  onClick={handleRemoveMember}
                  disabled={loading}
                >
                  {loading
                    ? "Removing..."
                    : "Yes, Remove"}
                </button>
              </>
            )}

            {/* ===========================================
                TRANSFER ADMIN CONFIRMATION
            =========================================== */}

            {confirmation.type === "transfer" && (
              <>
                <h2>Transfer Admin?</h2>

                <p>
                  Are you sure you want to make{" "}
                  <strong>
                    {confirmation.member?.name}
                  </strong>{" "}
                  the new admin?
                </p>

                <p>
                  You will lose your admin privileges.
                </p>

                <button
                  onClick={closeConfirmation}
                  disabled={loading}
                >
                  Cancel
                </button>

                <button
                  onClick={handleTransferAdmin}
                  disabled={loading}
                >
                  {loading
                    ? "Transferring..."
                    : "Yes, Transfer"}
                </button>
              </>
            )}

            {/* ===========================================
                LEAVE CONFIRMATION
            =========================================== */}

            {confirmation.type === "leave" && (
              <>
                <h2>Leave Group?</h2>

                <p>
                  Are you sure you want to leave{" "}
                  <strong>
                    {group.groupName}
                  </strong>
                  ?
                </p>

                {isAdmin ? (
                  <>
                    <p>
                      You are the current admin.
                    </p>

                    <p>
                      You must transfer admin to
                      another member before leaving.
                    </p>

                    <button
                      onClick={closeConfirmation}
                    >
                      Cancel
                    </button>

                    <button
                      onClick={() =>
                        closeConfirmation()
                      }
                    >
                      Transfer Admin
                    </button>
                  </>
                ) : (
                  <>
                    <p>
                      You can leave only if all your
                      payments are completed.
                    </p>

                    <button
                      onClick={closeConfirmation}
                      disabled={loading}
                    >
                      Cancel
                    </button>

                    <button
                      onClick={handleLeaveGroup}
                      disabled={loading}
                    >
                      {loading
                        ? "Leaving..."
                        : "Yes, Leave Group"}
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetails;
