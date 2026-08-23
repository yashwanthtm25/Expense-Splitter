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

  // Members dropdown
  const [membersOpen, setMembersOpen] = useState(false);

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
        `${import.meta.env.VITE_API_URL}/api/groups/${groupId}`,
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
        `${import.meta.env.VITE_API_URL}/api/expenses/${groupId}/balance`,
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
        `${import.meta.env.VITE_API_URL}/api/groups/${groupId}`,
        {
          groupName: groupName.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Group name updated successfully");

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
        `${import.meta.env.VITE_API_URL}/api/groups/${groupId}/members/${member._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      navigate(`/groups`);
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
      `${import.meta.env.VITE_API_URL}/api/groups/${groupId}`,
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

  const handleTransferAdmin = async (memberArg) => {
    const member = memberArg || confirmation.member;

    if (!member) return;

    try {
      setLoading(true);

      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/groups/${groupId}/admin`,
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
        `${import.meta.env.VITE_API_URL}/api/groups/${groupId}/leave`,
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
  // Styles
  // --------------------------------------------------

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#f5f6fa",
      fontFamily: "'Segoe UI', Arial, sans-serif",
      padding: "40px 20px",
    },
    loadingWrap: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f5f6fa",
      fontFamily: "'Segoe UI', Arial, sans-serif",
      color: "#6b7280",
      fontSize: "16px",
    },
    container: {
      maxWidth: "680px",
      margin: "0 auto",
    },
    backButton: {
      background: "none",
      border: "none",
      color: "#6b7280",
      fontSize: "14px",
      cursor: "pointer",
      padding: 0,
      marginBottom: "20px",
    },
    headerRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "12px",
      marginBottom: "6px",
    },
    heading: {
      fontSize: "28px",
      fontWeight: 700,
      color: "#1f2937",
      margin: 0,
    },
    editButton: {
      padding: "6px 14px",
      borderRadius: "8px",
      border: "1px solid #d1d5db",
      background: "#fff",
      color: "#374151",
      fontSize: "13px",
      fontWeight: 600,
      cursor: "pointer",
    },
    editRow: {
      display: "flex",
      gap: "8px",
      marginBottom: "6px",
    },
    input: {
      flex: 1,
      padding: "10px 12px",
      borderRadius: "8px",
      border: "1px solid #d1d5db",
      fontSize: "15px",
      outline: "none",
    },
    saveButton: {
      padding: "10px 16px",
      borderRadius: "8px",
      border: "none",
      background: "#4f46e5",
      color: "#fff",
      fontSize: "14px",
      fontWeight: 600,
      cursor: "pointer",
    },
    cancelButton: {
      padding: "10px 16px",
      borderRadius: "8px",
      border: "1px solid #d1d5db",
      background: "#fff",
      color: "#374151",
      fontSize: "14px",
      fontWeight: 600,
      cursor: "pointer",
    },
    metaCard: {
      background: "#fff",
      borderRadius: "12px",
      padding: "16px 20px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)",
      marginBottom: "20px",
      marginTop: "16px",
    },
    metaLine: {
      margin: "2px 0",
      fontSize: "14px",
      color: "#4b5563",
    },
    metaTag: {
      display: "inline-block",
      marginTop: "6px",
      padding: "3px 10px",
      borderRadius: "999px",
      background: "#eef2ff",
      color: "#4f46e5",
      fontSize: "12px",
      fontWeight: 600,
      marginRight: "6px",
    },
    sectionCard: {
      background: "#fff",
      borderRadius: "12px",
      padding: "22px 24px",
      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
      marginBottom: "20px",
    },
    sectionTitle: {
      margin: "0 0 16px 0",
      fontSize: "18px",
      fontWeight: 700,
      color: "#1f2937",
    },
    // ----- Balance summary: label + amount on same line -----
    balanceList: {
      display: "flex",
      flexDirection: "column",
      gap: "2px",
    },
    balanceRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "12px 4px",
      borderBottom: "1px solid #f3f4f6",
    },
    balanceLabel: {
      margin: 0,
      fontSize: "14px",
      color: "#6b7280",
      fontWeight: 600,
    },
    balanceValue: {
      margin: 0,
      fontSize: "16px",
      fontWeight: 700,
      color: "#1f2937",
    },
    // ----- Members dropdown -----
    membersToggle: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      cursor: "pointer",
      userSelect: "none",
    },
    chevron: (open) => ({
      display: "inline-block",
      transition: "transform 0.2s ease",
      transform: open ? "rotate(180deg)" : "rotate(0deg)",
      fontSize: "14px",
      color: "#6b7280",
    }),
    membersList: {
      marginTop: "10px",
    },
    memberRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "12px 0",
      borderBottom: "1px solid #f3f4f6",
      flexWrap: "wrap",
      gap: "8px",
    },
    memberName: {
      fontSize: "15px",
      color: "#1f2937",
      fontWeight: 500,
    },
    memberTag: {
      fontSize: "12px",
      color: "#6b7280",
      fontWeight: 500,
    },
    memberActions: {
      display: "flex",
      gap: "8px",
    },
    smallButton: {
      padding: "6px 12px",
      borderRadius: "6px",
      border: "1px solid #d1d5db",
      background: "#fff",
      color: "#374151",
      fontSize: "13px",
      fontWeight: 600,
      cursor: "pointer",
    },
    smallDangerButton: {
      padding: "6px 12px",
      borderRadius: "6px",
      border: "1px solid #fecaca",
      background: "#fff",
      color: "#dc2626",
      fontSize: "13px",
      fontWeight: 600,
      cursor: "pointer",
    },
    actionsRow: {
      display: "flex",
      gap: "12px",
      flexWrap: "wrap",
      marginBottom: "20px",
    },
    primaryButton: {
      flex: "1 1 160px",
      padding: "14px 18px",
      borderRadius: "8px",
      border: "none",
      background: "#4f46e5",
      color: "#fff",
      fontSize: "15px",
      fontWeight: 600,
      cursor: "pointer",
    },
    secondaryButton: {
      flex: "1 1 160px",
      padding: "14px 18px",
      borderRadius: "8px",
      border: "1px solid #4f46e5",
      background: "#fff",
      color: "#4f46e5",
      fontSize: "15px",
      fontWeight: 600,
      cursor: "pointer",
    },
    dangerButtonFull: {
      width: "100%",
      padding: "14px 18px",
      borderRadius: "8px",
      border: "1px solid #fecaca",
      background: "#fff",
      color: "#dc2626",
      fontSize: "15px",
      fontWeight: 600,
      cursor: "pointer",
    },
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(17, 24, 39, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      zIndex: 50,
    },
    modal: {
      background: "#fff",
      borderRadius: "14px",
      padding: "28px",
      maxWidth: "400px",
      width: "100%",
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
    },
    modalTitle: {
      margin: "0 0 12px 0",
      fontSize: "20px",
      fontWeight: 700,
      color: "#1f2937",
    },
    modalText: {
      margin: "0 0 8px 0",
      fontSize: "14px",
      color: "#4b5563",
      lineHeight: 1.5,
    },
    modalActions: {
      display: "flex",
      gap: "10px",
      marginTop: "22px",
    },
    modalCancelButton: {
      flex: 1,
      padding: "11px 16px",
      borderRadius: "8px",
      border: "1px solid #d1d5db",
      background: "#fff",
      color: "#374151",
      fontSize: "14px",
      fontWeight: 600,
      cursor: "pointer",
    },
    modalConfirmButton: {
      flex: 1,
      padding: "11px 16px",
      borderRadius: "8px",
      border: "none",
      background: "#4f46e5",
      color: "#fff",
      fontSize: "14px",
      fontWeight: 600,
      cursor: "pointer",
    },
    modalDangerButton: {
      flex: 1,
      padding: "11px 16px",
      borderRadius: "8px",
      border: "none",
      background: "#dc2626",
      color: "#fff",
      fontSize: "14px",
      fontWeight: 600,
      cursor: "pointer",
    },
    transferPickerList: {
      maxHeight: "260px",
      overflowY: "auto",
      margin: "0 0 8px 0",
    },
    transferPickerRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "10px",
      padding: "10px 0",
      borderBottom: "1px solid #f3f4f6",
    },
    transferPickerName: {
      fontSize: "14px",
      color: "#1f2937",
      fontWeight: 500,
    },
    transferPickerButton: {
      flexShrink: 0,
      padding: "7px 14px",
      borderRadius: "6px",
      border: "none",
      background: "#4f46e5",
      color: "#fff",
      fontSize: "13px",
      fontWeight: 600,
      cursor: "pointer",
    },
    transferPickerEmpty: {
      fontSize: "14px",
      color: "#6b7280",
      margin: "0 0 8px 0",
    },
  };

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (pageLoading) {
    return <div style={styles.loadingWrap}>Loading group...</div>;
  }

  if (!group) {
    return <div style={styles.loadingWrap}>Group not found</div>;
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
    <div style={styles.page}>
      <div style={styles.container}>
        {/* =================================================
            BACK
        ================================================= */}

        <button style={styles.backButton} onClick={() => navigate("/groups")}>
          ← Back to Groups
        </button>

        {/* =================================================
            GROUP NAME
        ================================================= */}

        {editingGroup ? (
          <div style={styles.editRow}>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              style={styles.input}
            />

            <button
              onClick={handleUpdateGroup}
              disabled={loading}
              style={styles.saveButton}
            >
              {loading ? "Updating..." : "Save"}
            </button>

            <button
              onClick={() => {
                setEditingGroup(false);
                setGroupName(group.groupName);
              }}
              disabled={loading}
              style={styles.cancelButton}
            >
              Cancel
            </button>
          </div>
        ) : (
          <div style={styles.headerRow}>
            <h1 style={styles.heading}>{group.groupName}</h1>

            {/* Only ADMIN can edit */}
            {isAdmin && (
              <button
                style={styles.editButton}
                onClick={() => setEditingGroup(true)}
              >
                Edit
              </button>
            )}
          </div>
        )}

        {/* =================================================
            ADMIN
        ================================================= */}

        <div style={styles.metaCard}>
          <p style={styles.metaLine}>Admin: {group.admin?.name}</p>
          <p style={styles.metaLine}>Created by: {group.createdBy?.name}</p>

          <div>
            {isAdmin && <span style={styles.metaTag}>You are the admin</span>}
            {isCreator && <span style={styles.metaTag}>You are the creator</span>}
          </div>
        </div>

        {/* =================================================
            BALANCE SUMMARY (label + amount on same line)
        ================================================= */}

        {balance && (
          <div style={styles.sectionCard}>
            <h2 style={styles.sectionTitle}>Balance Summary</h2>

            <div style={styles.balanceList}>
              <div style={styles.balanceRow}>
                <p style={styles.balanceLabel}>You Paid</p>
                <p style={styles.balanceValue}>
                  ₹{Number(balance.totalPaid).toFixed(2)}
                </p>
              </div>

              <div style={styles.balanceRow}>
                <p style={styles.balanceLabel}>You Owe</p>
                <p style={styles.balanceValue}>
                  ₹{Number(balance.totalOwe).toFixed(2)}
                </p>
              </div>

              <div style={styles.balanceRow}>
                <p style={styles.balanceLabel}>You Should Receive</p>
                <p style={styles.balanceValue}>
                  ₹{Number(balance.totalReceive).toFixed(2)}
                </p>
              </div>

              <div style={{ ...styles.balanceRow, borderBottom: "none" }}>
                <p style={styles.balanceLabel}>Net Balance</p>
                <p style={styles.balanceValue}>
                  ₹{Number(balance.netBalance).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* =================================================
            MEMBERS (collapsible dropdown)
        ================================================= */}

        <div style={styles.sectionCard}>
          <div
            style={styles.membersToggle}
            onClick={() => setMembersOpen((prev) => !prev)}
          >
            <h2 style={styles.sectionTitle}>
              Members ({group.members.length})
            </h2>
            <span style={styles.chevron(membersOpen)}>▼</span>
          </div>

          {membersOpen && (
            <div style={styles.membersList}>
              {group.members.map((member) => {
                const isCurrentUser =
                  String(member._id) === String(userId);

                const isMemberAdmin =
                  String(member._id) === String(group.admin?._id);
                const isMemberCreator =
                  String(member._id) === String(group.createdBy?._id);

                return (
                  <div key={member._id} style={styles.memberRow}>
                    <span style={styles.memberName}>
                      {member.name}{" "}
                      {isMemberAdmin && (
                        <span style={styles.memberTag}>— Admin</span>
                      )}
                      {isCurrentUser && (
                        <span style={styles.memberTag}>— You</span>
                      )}
                      {isMemberCreator && (
                        <span style={styles.memberTag}>— Creator</span>
                      )}
                    </span>

                    {/* =========================================
                        ADMIN CONTROLS
                    ========================================= */}

                    {isAdmin && !isCurrentUser && !isMemberAdmin && (
                      <div style={styles.memberActions}>
                        <button
                          style={styles.smallButton}
                          onClick={() => openConfirmation("remove", member)}
                        >
                          Remove
                        </button>

                        <button
                          style={styles.smallButton}
                          onClick={() => openConfirmation("transfer", member)}
                        >
                          Transfer Admin
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* =================================================
            ACTION BUTTONS
        ================================================= */}

        <div style={styles.actionsRow}>
          {/* Admin only */}
          {isAdmin && (
            <button
              style={styles.secondaryButton}
              onClick={() => navigate(`/add-member/${groupId}`)}
            >
              Add Member
            </button>
          )}

          <button
            style={styles.primaryButton}
            onClick={() => navigate(`/add-expense/${groupId}`)}
          >
            Add Expense
          </button>

          <button
            style={styles.secondaryButton}
            onClick={() => navigate(`/expenses/${groupId}`)}
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
              style={styles.dangerButtonFull}
              onClick={() => openConfirmation("delete")}
            >
              Delete Group
            </button>
          ) : (
            <>
              {isAdmin && (
                <button
                  style={{ ...styles.dangerButtonFull, marginBottom: "12px" }}
                  onClick={() => openConfirmation("delete")}
                >
                  Delete Group
                </button>
              )}

              <button
                style={styles.dangerButtonFull}
                onClick={() => openConfirmation("leave")}
              >
                Leave Group
              </button>
            </>
          )}
        </div>

        {/* =================================================
            CONFIRMATION
        ================================================= */}

        {confirmation.type === "delete" && (
          <div style={styles.overlay}>
            <div style={styles.modal}>
              <h2 style={styles.modalTitle}>Delete Group?</h2>

              <p style={styles.modalText}>
                You are the only member of{" "}
                <strong>{group.groupName}</strong>.
              </p>

              <p style={styles.modalText}>
                Are you sure you want to permanently delete this group?
              </p>

              <div style={styles.modalActions}>
                <button
                  style={styles.modalCancelButton}
                  onClick={closeConfirmation}
                  disabled={loading}
                >
                  Cancel
                </button>

                <button
                  style={styles.modalDangerButton}
                  onClick={handleDeleteGroup}
                  disabled={loading}
                >
                  {loading ? "Deleting..." : "Yes, Delete Group"}
                </button>
              </div>
            </div>
          </div>
        )}

        {confirmation.type && confirmation.type !== "delete" && (
          <div style={styles.overlay}>
            <div style={styles.modal}>
              {/* ===========================================
                  REMOVE CONFIRMATION
              =========================================== */}

              {confirmation.type === "remove" && (
                <>
                  <h2 style={styles.modalTitle}>Remove Member?</h2>

                  <p style={styles.modalText}>
                    Are you sure you want to remove{" "}
                    <strong>{confirmation.member?.name}</strong> from this
                    group?
                  </p>

                  <div style={styles.modalActions}>
                    <button
                      style={styles.modalCancelButton}
                      onClick={closeConfirmation}
                      disabled={loading}
                    >
                      Cancel
                    </button>

                    <button
                      style={styles.modalDangerButton}
                      onClick={handleRemoveMember}
                      disabled={loading}
                    >
                      {loading ? "Removing..." : "Yes, Remove"}
                    </button>
                  </div>
                </>
              )}

              {/* ===========================================
                  TRANSFER ADMIN CONFIRMATION
              =========================================== */}

              {confirmation.type === "transfer" && (
                <>
                  <h2 style={styles.modalTitle}>Transfer Admin?</h2>

                  <p style={styles.modalText}>
                    Are you sure you want to make{" "}
                    <strong>{confirmation.member?.name}</strong> the new
                    admin?
                  </p>

                  <p style={styles.modalText}>
                    You will lose your admin privileges.
                  </p>

                  <div style={styles.modalActions}>
                    <button
                      style={styles.modalCancelButton}
                      onClick={closeConfirmation}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      style={styles.modalConfirmButton}
                      onClick={() => handleTransferAdmin(confirmation.member)}
                      disabled={loading}
                    >
                      {loading ? "Transferring..." : "Yes, Transfer"}
                    </button>
                  </div>
                </>
              )}

              {/* ===========================================
                  TRANSFER ADMIN PICKER (from Leave flow)
              =========================================== */}

              {confirmation.type === "transferPicker" && (
                <>
                  <h2 style={styles.modalTitle}>Choose New Admin</h2>

                  <p style={styles.modalText}>
                    Select a member to make admin of{" "}
                    <strong>{group.groupName}</strong>. You'll be able to
                    leave right after.
                  </p>

                  <div style={styles.transferPickerList}>
                    {group.members
                      .filter(
                        (member) =>
                          String(member._id) !== String(group.admin?._id)
                      )
                      .map((member) => (
                        <div
                          key={member._id}
                          style={styles.transferPickerRow}
                        >
                          <span style={styles.transferPickerName}>
                            {member.name}
                          </span>

                          <button
                            style={styles.transferPickerButton}
                            onClick={() => handleTransferAdmin(member)}
                            disabled={loading}
                          >
                            {loading ? "Transferring..." : "Make Admin"}
                          </button>
                        </div>
                      ))}

                    {group.members.filter(
                      (member) =>
                        String(member._id) !== String(group.admin?._id)
                    ).length === 0 && (
                      <p style={styles.transferPickerEmpty}>
                        There are no other members to transfer admin to.
                      </p>
                    )}
                  </div>

                  <div style={styles.modalActions}>
                    <button
                      style={styles.modalCancelButton}
                      onClick={closeConfirmation}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}

              {/* ===========================================
                  LEAVE CONFIRMATION
              =========================================== */}

              {confirmation.type === "leave" && (
                <>
                  <h2 style={styles.modalTitle}>Leave Group?</h2>

                  <p style={styles.modalText}>
                    Are you sure you want to leave{" "}
                    <strong>{group.groupName}</strong>?
                  </p>

                  {isAdmin ? (
                    <>
                      <p style={styles.modalText}>
                        You are the current admin.
                      </p>

                      <p style={styles.modalText}>
                        You must transfer admin to another member before
                        leaving.
                      </p>

                      <div style={styles.modalActions}>
                        <button
                          style={styles.modalCancelButton}
                          onClick={closeConfirmation}
                        >
                          Cancel
                        </button>

                        <button
                          style={styles.modalConfirmButton}
                          onClick={() =>
                            setConfirmation({
                              type: "transferPicker",
                              member: null,
                            })
                          }
                        >
                          Transfer Admin
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p style={styles.modalText}>
                        You can leave only if all your payments are
                        completed.
                      </p>

                      <div style={styles.modalActions}>
                        <button
                          style={styles.modalCancelButton}
                          onClick={closeConfirmation}
                          disabled={loading}
                        >
                          Cancel
                        </button>

                        <button
                          style={styles.modalDangerButton}
                          onClick={handleLeaveGroup}
                          disabled={loading}
                        >
                          {loading ? "Leaving..." : "Yes, Leave Group"}
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupDetails;