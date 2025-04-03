import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ModuleDetails() {
  const { module } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchModuleData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        // Fetch students for this module
        const studentsResponse = await fetch(
          `http://localhost:8000/su/students?module=${encodeURIComponent(module)}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        // Fetch assignments for this module
        const assignmentsResponse = await fetch(
          `http://localhost:8000/su/assignments?module=${encodeURIComponent(module)}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!studentsResponse.ok || !assignmentsResponse.ok) {
          throw new Error("Failed to fetch module data");
        }

        const studentsData = await studentsResponse.json();
        const assignmentsData = await assignmentsResponse.json();

        setStudents(studentsData);
        setAssignments(assignmentsData);
      } catch (error) {
        console.error("Error fetching module data:", error);
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchModuleData();
  }, [module, navigate]);

  const handleAddCredits = (studentId, assignmentId) => {
    navigate(`/give-credits/${assignmentId}?studentId=${studentId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
    toast.info("Logged out successfully");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-2xl font-semibold">Loading module data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="flex justify-between items-center bg-[#4A63A3] text-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="bg-white text-[#4A63A3] px-4 py-2 rounded-lg font-semibold hover:bg-gray-200"
          >
            Back
          </button>
          <h1 className="text-2xl font-bold">Module: {module}</h1>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
        >
          Logout
        </button>
      </header>

      <div className="overflow-x-auto bg-white rounded-lg shadow-md p-4">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-6 text-left">Student Name</th>
              {assignments.map((assignment) => (
                <th key={assignment.id} className="py-3 px-6 text-left">
                  {assignment.title}
                  <div className="text-sm text-gray-500">
                    Due: {new Date(assignment.dueDate).toLocaleDateString()}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="border-b hover:bg-gray-50">
                <td className="py-4 px-6">
                  {student.name || student.username}
                </td>
                {assignments.map((assignment) => (
                  <td key={`${student.id}-${assignment.id}`} className="py-4 px-6">
                    <div className="flex items-center">
                      <span className="mr-2">
                        {assignment.credits?.find(c => c.studentId === student.id)?.marks || "N/A"}
                      </span>
                      <button
                        onClick={() => handleAddCredits(student.id, assignment.id)}
                        className="text-green-500 hover:text-green-700"
                        title="Add/Edit Credits"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}