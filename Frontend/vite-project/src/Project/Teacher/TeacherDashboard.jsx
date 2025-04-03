import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch("http://localhost:8000/su/teacher/dashboard", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch teacher data");
        }

        const data = await response.json();
        setTeacher(data.teacher);
        setAssignments(data.assignments || []);
      } catch (error) {
        console.error("Error fetching teacher data:", error);
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeacherData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
    toast.info("Logged out successfully");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-2xl font-semibold">Loading dashboard...</div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        <div className="text-2xl font-semibold text-red-600 mb-4">
          Teacher data not available
        </div>
        <button
          onClick={() => navigate("/login")}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Login Again
        </button>
      </div>
    );
  }

  // Group assignments by module
  const assignmentsByModule = {};
  assignments.forEach((assignment) => {
    const moduleName = assignment.module || "Unassigned";
    if (!assignmentsByModule[moduleName]) {
      assignmentsByModule[moduleName] = [];
    }
    assignmentsByModule[moduleName].push(assignment);
  });

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="flex justify-between items-center bg-[#4A63A3] text-white p-4 rounded-lg shadow-md mb-6">
        <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
        <div className="flex items-center space-x-4">
          <span className="font-medium">
            Welcome, {teacher.name || teacher.username}
          </span>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="mb-6">
        <button
          onClick={() => navigate("/create-assignment")}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 mr-4"
        >
          Create New Assignment
        </button>
        <button
          onClick={() => navigate("/give-credits/:assignmentId")}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
        >
          Manage All Assignments
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teacher.modules && teacher.modules.length > 0 ? (
          teacher.modules.map((module) => (
            <div
              key={module}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="bg-[#4A63A3] text-white p-4">
                <h2 className="text-xl font-bold">{module}</h2>
              </div>
              <div className="p-4">
                <h3 className="font-semibold mb-2">Recent Assignments:</h3>
                {assignmentsByModule[module]?.length > 0 ? (
                  <ul className="space-y-2">
                    {assignmentsByModule[module]
                      .slice(0, 3) // Show only 3 recent assignments
                      .map((assignment) => (
                        <li
                          key={assignment.id}
                          className="border-b pb-2 last:border-b-0"
                        >
                          <div className="flex justify-between items-center">
                            <span>{assignment.title}</span>
                            <button
                              onClick={() =>
                                navigate(`/assignment/${assignment.id}`)
                              }
                              className="text-blue-500 hover:text-blue-700 text-sm"
                            >
                              View
                            </button>
                          </div>
                          <div className="text-sm text-gray-500">
                            Due: {new Date(assignment.dueDate).toLocaleDateString()}
                          </div>
                        </li>
                      ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No assignments for this module</p>
                )}
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => navigate(`/create-assignment?module=${module}`)}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                  >
                    Add Assignment
                  </button>
                  <button
                    onClick={() => navigate(`/module/:module`)}
                    className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                  >
                    View All
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-lg">No modules assigned to you yet</p>
            <p className="text-gray-500 mt-2">
              Please contact admin to get assigned to modules
            </p>
          </div>
        )}
      </div>
    </div>
  );
}