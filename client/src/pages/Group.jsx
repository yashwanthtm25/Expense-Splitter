import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Group = () => {
  const [groups, setGroups] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const fetchGroups = async () => {
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
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            "Failed to fetch groups"
        );
      }
    };

    fetchGroups();
  }, [navigate]);

  return (
    <div>
      <h1>My Groups</h1>

      {groups.length === 0 ? (
        <p>No groups found</p>
      ) : (
        groups.map((group) => (
          <div
            key={group._id}
            onClick={() =>
              navigate(`/groups/${group._id}`)
            }
            style={{ cursor: "pointer" }}
          >
            <h2>{group.groupName}</h2>
          </div>
        ))
      )}
    </div>
  );
};

export default Group;