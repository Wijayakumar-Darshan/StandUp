import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

export default function ManageAssignments() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [title, setTitle] = useState("");
  const [creditMarks, setCreditMarks] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch teacher's assignments
  const fetchAssignments = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/su/teacher/dashboard", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch assignments");
      }

      const data = await response.json();
      setAssignments(data.assignments);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      toast.error("Failed to load assignments.");
    } finally {
      setIsLoading(false);
    }
  };

  // Create new assignment
  const createAssignment = async (e) => {
    e.preventDefault();
    if (!title || !creditMarks) {
      toast.error("Please provide title and credit marks.");
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:8000/su/teacher/create-assignment", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          creditMarks: parseInt(creditMarks),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create assignment");
      }

      toast.success("Assignment created successfully!");
      fetchAssignments(); // Refresh the assignments list
      setTitle("");
      setCreditMarks("");
    } catch (error) {
      console.error("Error creating assignment:", error);
      toast.error("Failed to create assignment.");
    }
  };

  // Delete assignment
  const deleteAssignment = async (assignmentId) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://localhost:8000/su/teacher/assignment/${assignmentId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete assignment");
      }

      toast.success("Assignment deleted successfully!");
      fetchAssignments(); // Refresh the assignments list
    } catch (error) {
      console.error("Error deleting assignment:", error);
      toast.error("Failed to delete assignment.");
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  if (isLoading) {
    return <div className="text-center text-xl">Loading assignments...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Manage Assignments</h2>
        <form onSubmit={createAssignment} className="mb-6">
          <label className="block text-gray-700 font-medium">Assignment Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded-lg mb-4"
            placeholder="Enter assignment title"
          />
          <label className="block text-gray-700 font-medium">Credit Marks</label>
          <input
            type="number"
            value={creditMarks}
            onChange={(e) => setCreditMarks(e.target.value)}
            className="w-full p-2 border rounded-lg mb-4"
            placeholder="Enter credit marks"
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
          >
            Create Assignment
          </button>
        </form>

        <h3 className="text-lg font-semibold mb-4">Existing Assignments</h3>
        <table className="w-full table-auto">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Title</th>
              <th className="px-4 py-2 text-left">Credit Marks</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((assignment) => (
              <tr key={assignment.id}>
                <td className="px-4 py-2">{assignment.title}</td>
                <td className="px-4 py-2">{assignment.creditMarks}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => deleteAssignment(assignment.id)}
                    className="bg-red-500 text-white p-1 rounded-lg hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
