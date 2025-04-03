import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ManageTeachers() {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTeachers = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/su/teachers", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        credentials: "include"
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error("Session expired. Please login again.");
        }
        throw new Error(`Failed to fetch teachers: ${response.status}`);
      }

      const data = await response.json();
      setTeachers(data);
      setError(null);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      setError(error.message);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const toggleStatus = async (teacherId) => {
    const token = localStorage.getItem("token");
    const teacher = teachers.find(t => t.id === teacherId);
    if (!teacher) return;

    const updatedTeacher = { ...teacher, active: !teacher.active };

    try {
      const response = await fetch(`http://localhost:8000/su/update-teacher/${teacherId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(updatedTeacher)
      });

      if (!response.ok) {
        throw new Error(`Failed to update teacher: ${response.status}`);
      }

      setTeachers(prev => prev.map(t => 
        t.id === teacherId ? updatedTeacher : t
      ));
      toast.success("Teacher status updated successfully!");
    } catch (error) {
      console.error("Error updating teacher:", error);
      toast.error(error.message);
    }
  };

  const deleteTeacher = async (teacherId) => {
    if (!window.confirm("Are you sure you want to delete this teacher?")) return;

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://localhost:8000/su/delete-teacher/${teacherId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to delete teacher: ${response.status}`);
      }

      setTeachers(prev => prev.filter(teacher => teacher.id !== teacherId));
      toast.success("Teacher deleted successfully!");
    } catch (error) {
      console.error("Error deleting teacher:", error);
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
    fetchTeachers();
  }, [fetchTeachers]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-2xl font-semibold">Loading teachers...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        <div className="text-2xl font-semibold text-red-600 mb-4">{error}</div>
        <button 
          onClick={fetchTeachers} 
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Try Again
        </button>
        <button 
          onClick={handleLogout} 
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="flex justify-between items-center bg-[#4A63A3] text-white p-4 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold">Manage Teachers</h1>
        <div className="flex space-x-4">
          <Link 
            to="/create-teacher" 
            className="bg-white text-[#4A63A3] px-4 py-2 rounded-lg font-semibold hover:bg-gray-200"
          >
            + Create Teacher
          </Link>
          <button 
            onClick={handleLogout} 
            className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="overflow-x-auto mt-6">
        {teachers.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-lg">No teachers found</p>
            <Link 
              to="/create-teacher" 
              className="mt-4 inline-block bg-[#4A63A3] text-white px-4 py-2 rounded-lg hover:bg-[#3b4f85]"
            >
              Create New Teacher
            </Link>
          </div>
        ) : (
          <table className="min-w-full bg-white shadow-md rounded-lg">
            <thead className="bg-[#4A63A3] text-white">
              <tr>
                <th className="py-3 px-6 text-left">Name</th>
                <th className="py-3 px-6 text-left">Username</th>
                <th className="py-3 px-6 text-left">Modules</th>
                <th className="py-3 px-6 text-center">Status</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher) => (
                <tr key={teacher.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-6">{teacher.name || teacher.username}</td>
                  <td className="py-3 px-6">{teacher.username}</td>
                  <td className="py-3 px-6">
                    {teacher.modules?.join(", ") || "No modules assigned"}
                  </td>
                  <td className="py-3 px-6 text-center">
                    <button
                      onClick={() => toggleStatus(teacher.id)}
                      className={`px-4 py-1 rounded-lg font-semibold ${
                        teacher.active 
                          ? "bg-green-500 hover:bg-green-600 text-white" 
                          : "bg-red-500 hover:bg-red-600 text-white"
                      }`}
                    >
                      {teacher.active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="py-3 px-6 flex justify-center space-x-3">
                    <Link 
                      to={`/edit-teacher/${teacher.id}`} 
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                    >
                      Update
                    </Link>
                    <button 
                      onClick={() => deleteTeacher(teacher.id)} 
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}