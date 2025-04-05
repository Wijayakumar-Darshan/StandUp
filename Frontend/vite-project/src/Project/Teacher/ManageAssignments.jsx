import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ManageAssignments() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    creditMarks: "",
    dueDate: "",
    module: ""
  });
  const [teacherModules, setTeacherModules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch teacher's modules and assignments
  const fetchData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setIsLoading(true);
      
      // Fetch teacher modules
      const modulesResponse = await fetch("http://localhost:8000/su/teacher/modules", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!modulesResponse.ok) {
        throw new Error("Failed to fetch teacher modules");
      }

      const modulesData = await modulesResponse.json();
      setTeacherModules(modulesData.modules || []);

      // Fetch assignments
      const assignmentsResponse = await fetch("http://localhost:8000/su/teacher/assignments", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!assignmentsResponse.ok) {
        throw new Error("Failed to fetch assignments");
      }

      const assignmentsData = await assignmentsResponse.json();
      setAssignments(assignmentsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error(error.message);
      if (error.message.includes("401")) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const createAssignment = async (e) => {
    e.preventDefault();
    
    if (!formData.module) {
      toast.error("Please select a module");
      return;
    }

    setIsSubmitting(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:8000/su/teacher/create-assignment", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          creditMarks: parseInt(formData.creditMarks),
          dueDate: formData.dueDate,
          module: formData.module
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create assignment");
      }

      toast.success("Assignment created successfully!");
      setFormData({
        title: "",
        description: "",
        creditMarks: "",
        dueDate: "",
        module: ""
      });
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error creating assignment:", error);
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteAssignment = async (assignmentId) => {
    if (!window.confirm("Are you sure you want to delete this assignment?")) return;

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
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error deleting assignment:", error);
      toast.error(error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
    toast.info("Logged out successfully");
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-2xl font-semibold">Loading assignments...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="flex justify-between items-center bg-[#4A63A3] text-white p-4 rounded-lg shadow-md mb-6">
        <h1 className="text-2xl font-bold">Manage Assignments</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
        >
          Logout
        </button>
      </header>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Create New Assignment</h2>
        <form onSubmit={createAssignment} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Assignment Title"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Assignment Description"
              rows="3"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Credit Marks</label>
            <input
              type="number"
              name="creditMarks"
              value={formData.creditMarks}
              onChange={handleChange}
              required
              min="1"
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Total Marks"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Module</label>
            <select
              name="module"
              value={formData.module}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">Select a module</option>
              {teacherModules.map((module) => (
                <option key={module} value={module}>
                  {module}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full p-2 rounded-lg text-white ${
              isSubmitting ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {isSubmitting ? "Creating..." : "Create Assignment"}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Your Assignments</h2>
        {assignments.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No assignments found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
              <thead className="bg-[#4A63A3] text-white">
                <tr>
                  <th className="py-3 px-6 text-left">Title</th>
                  <th className="py-3 px-6 text-left">Module</th>
                  <th className="py-3 px-6 text-left">Due Date</th>
                  <th className="py-3 px-6 text-left">Marks</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment) => (
                  <tr key={assignment.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-6">{assignment.title}</td>
                    <td className="py-3 px-6">{assignment.module || "Unassigned"}</td>
                    <td className="py-3 px-6">
                      {new Date(assignment.dueDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-6">{assignment.creditMarks}</td>
                    <td className="py-3 px-6 flex justify-center space-x-2">
                      <button
                        onClick={() => navigate(`/assignment/${assignment.id}`)}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                      >
                        View
                      </button>
                      <button
                        onClick={() => deleteAssignment(assignment.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}