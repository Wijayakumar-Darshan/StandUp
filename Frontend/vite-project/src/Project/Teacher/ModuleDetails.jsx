import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ModuleDetails() {
  const { module } = useParams(); // Extract module from URL params
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch teacher's assignments and students for the module
  const fetchModuleData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      // Fetch assignments for the specific module
      const assignmentsRes = await fetch(
        `http://localhost:8000/su/teacher/assignments/module?module=${encodeURIComponent(module)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!assignmentsRes.ok) {
        throw new Error("Failed to fetch assignments");
      }

      const assignmentsData = await assignmentsRes.json();

      // Fetch students for the specific module
      const studentsRes = await fetch(
        `http://localhost:8000/su/students?module=${encodeURIComponent(module)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!studentsRes.ok) {
        throw new Error("Failed to fetch students");
      }

      const studentsData = await studentsRes.json();

      setStudents(studentsData);
      setAssignments(assignmentsData);
    } catch (error) {
      console.error("Error fetching module data:", error);
      toast.error("Error fetching module data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCredits = (studentId, assignmentId) => {
    navigate(`/give-credits/${assignmentId}?studentId=${studentId}`);
  };

  const handleCreditAssignment = async (studentId, assignmentId, marks) => {
    setIsSubmitting(true);
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8000/su/teacher/assignment/${assignmentId}/give-credit`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            studentId: studentId,
            assignmentId: assignmentId,
            marks: marks,
          }),
        }
      );

      if (response.status === 403) {
        throw new Error("Access Denied! You are not authorized to assign credits.");
      }

      if (!response.ok) {
        throw new Error("Failed to assign credits.");
      }

      toast.success("Credits assigned successfully!");
      navigate("/teacher-dashboard");
    } catch (error) {
      console.error("Error assigning credits:", error);
      toast.error(error.message || "Failed to assign credits.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
    toast.info("Logged out successfully");
  };

  useEffect(() => {
    fetchModuleData();
  }, [module]);

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
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-6 text-left">Student Name</th>
              {assignments.map((assignment) => (
                <th key={assignment.id} className="py-3 px-6 text-left">
                  <div>{assignment.title}</div>
                  <div className="text-sm text-gray-500">
                    Due: {new Date(assignment.dueDate).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-400">
                    Created by: {assignment.teacherName || "Unknown"}
                  </div>
                </th>
              ))}
              <th className="py-3 px-6 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="border-b hover:bg-gray-50">
                <td className="py-4 px-6 font-medium">
                  {student.name || student.username}
                </td>
                {assignments.map((assignment) => {
                  const credit = assignment.credits?.find(
                    (c) => c.studentId === student.id
                  );

                  return (
                    <td key={`${student.id}-${assignment.id}`} className="py-4 px-6">
                      <div className="flex items-center">
                        <span className="mr-2">{credit?.marks ?? "N/A"}</span>
                      </div>
                    </td>
                  );
                })}
                <td className="py-4 px-6">
                  {assignments.map((assignment) => (
                    <button
                      key={`${student.id}-${assignment.id}`}
                      onClick={() => handleCreditAssignment(student.id, assignment.id, 10)} // Example: Assign 10 marks
                      className="text-green-500 hover:text-green-700"
                      title="Credit"
                      disabled={isSubmitting}
                    >
                      Credit
                    </button>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
