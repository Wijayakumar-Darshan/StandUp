import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ManageStudents() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
    toast.info("You have been logged out.");
  }, [navigate]);

  const fetchStudents = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      handleLogout();
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/su/students", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          handleLogout();
          toast.error("Session expired or unauthorized. Please login again.");
          return;
        }

        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      setStudents(data);
      setError(null);
    } catch (error) {
      console.error("Error fetching students:", error);
      setError("Failed to fetch students. Please try again.");
      toast.error("Failed to fetch students. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [handleLogout]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("role");

    if (!token) {
      navigate("/login");
      return;
    }

    if (userRole !== "ADMIN" && userRole !== "TEACHER") {
      navigate("/unauthorized");
      return;
    }

    setRole(userRole);
    fetchStudents();
  }, [navigate, fetchStudents]);

  const toggleStatus = async (id) => {
    const token = localStorage.getItem("token");
    const student = students.find((s) => s.id === id);
    if (!student) return;

    const updatedStudent = { ...student, active: !student.active };

    try {
      const response = await fetch(`http://localhost:8000/su/update-student/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(updatedStudent),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          handleLogout();
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setStudents((prev) => prev.map((s) => (s.id === id ? updatedStudent : s)));
      toast.success("Student status updated successfully!");
    } catch (error) {
      console.error("Error updating student:", error);
      toast.error("Failed to update student status.");
    }
  };

  const deleteStudent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://localhost:8000/su/delete-student/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          handleLogout();
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setStudents((prev) => prev.filter((student) => student.id !== id));
      toast.success("Student deleted successfully!");
    } catch (error) {
      console.error("Error deleting student:", error);
      toast.error("Failed to delete student.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-2xl font-semibold">Loading students...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        <div className="text-2xl font-semibold text-red-600 mb-4">{error}</div>
        <button 
          onClick={fetchStudents} 
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
        <h1 className="text-2xl font-bold">Manage Students</h1>
        <div className="flex space-x-4">
          {role === "ADMIN" && (
            <Link 
              to="/create-student" 
              className="bg-white text-[#4A63A3] px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              + Create Student
            </Link>
          )}
          <button 
            onClick={handleLogout} 
            className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="overflow-x-auto mt-6">
        {students.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-lg">No students found</p>
            {role === "ADMIN" && (
              <Link 
                to="/create-student" 
                className="mt-4 inline-block bg-[#4A63A3] text-white px-4 py-2 rounded-lg hover:bg-[#3b4f85] transition-colors"
              >
                Create New Student
              </Link>
            )}
          </div>
        ) : (
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-[#4A63A3] text-white">
              <tr>
                <th className="py-3 px-6 text-left">Name</th>
                <th className="py-3 px-6 text-left">Enrollment Number</th>
                <th className="py-3 px-6 text-left">Username</th>
                <th className="py-3 px-6 text-left">Modules</th>
                <th className="py-3 px-6 text-center">Status</th>
                {role === "ADMIN" && <th className="py-3 px-6 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-6">{student.name || student.username}</td>
                  <td className="py-3 px-6">{student.enrollmentNumber}</td>
                  <td className="py-3 px-6">{student.username}</td>
                  <td className="py-3 px-6">
                    {student.modules?.length > 0 
                      ? student.modules.join(", ") 
                      : "No modules assigned"}
                  </td>
                  <td className="py-3 px-6 text-center">
                    <button
                      onClick={() => toggleStatus(student.id)}
                      className={`px-4 py-1 rounded-lg font-semibold transition-colors ${
                        student.active 
                          ? "bg-green-500 hover:bg-green-600 text-white" 
                          : "bg-red-500 hover:bg-red-600 text-white"
                      }`}
                    >
                      {student.active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  {role === "ADMIN" && (
                    <td className="py-3 px-6 flex justify-center space-x-3">
                      <Link 
                        to={`/edit-student/${student.id}`} 
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Edit
                      </Link>
                      <button 
                        onClick={() => deleteStudent(student.id)} 
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
