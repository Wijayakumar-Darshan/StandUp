import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    student: null,
    assignments: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackValues, setFeedbackValues] = useState({});

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to access your dashboard");
        navigate("/login");
        return;
      }

      try {
        const response = await fetch("http://localhost:8000/su/student-dashboard", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (response.status === 401) {
          toast.error("Session expired. Please login again.");
          navigate("/login");
          return;
        }

        if (response.status === 403) {
          toast.error("Access denied. Your account may be inactive.");
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setDashboardData({
          student: data.student || null,
          assignments: data.assignments || []
        });

        // Initialize feedback values from existing assignment feedback
        const initialFeedback = {};
        (data.assignments || []).forEach(assignment => {
          if (assignment?.credits?.length > 0) {
            initialFeedback[assignment.id] = assignment.credits[0].feedback || "";
          }
        });
        setFeedbackValues(initialFeedback);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const handleFeedbackChange = (assignmentId, value) => {
    setFeedbackValues(prev => ({
      ...prev,
      [assignmentId]: value
    }));
  };

  const submitFeedback = async (assignmentId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to submit feedback");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8000/su/student/assignment/${assignmentId}/feedback`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            feedback: feedbackValues[assignmentId] || ""
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast.success("Feedback submitted successfully!");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-2xl font-semibold">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Student Profile Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome, {dashboardData.student?.name || dashboardData.student?.username || 'Student'}!
          </h1>
          
          {dashboardData.student?.modules?.length > 0 ? (
            <div className="mt-4">
              <h2 className="text-xl font-semibold mb-2">Your Modules</h2>
              <div className="flex flex-wrap gap-2">
                {dashboardData.student.modules.map((module, index) => (
                  <span 
                    key={index} 
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    {module}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 mt-4">You are not enrolled in any modules yet.</p>
          )}
        </div>

        {/* Assignments Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Assignments</h2>
          
          {dashboardData.assignments?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="p-3 text-left">Module</th>
                    <th className="p-3 text-left">Assignment</th>
                    <th className="p-3 text-left">Due Date</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Marks</th>
                    <th className="p-3 text-left">Feedback</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.assignments.map((assignment) => {
                    const hasCredit = assignment?.credits?.length > 0;
                    const credit = hasCredit ? assignment.credits[0] : null;
                    
                    return (
                      <tr key={assignment.id} className="border-t hover:bg-gray-50">
                        <td className="p-3">{assignment.module || 'N/A'}</td>
                        <td className="p-3 font-medium">{assignment.title || 'Untitled'}</td>
                        <td className="p-3">
                          {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No due date'}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            hasCredit 
                              ? "bg-green-100 text-green-800" 
                              : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {hasCredit ? "Graded" : "Pending"}
                          </span>
                        </td>
                        <td className="p-3">
                          {hasCredit ? (
                            <span className="font-medium">
                              {credit.marks || 0} / {assignment.maxMarks || 'N/A'}
                            </span>
                          ) : "N/A"}
                        </td>
                        <td className="p-3">
                          {hasCredit ? (
                            <div className="flex gap-2">
                              <textarea
                                value={feedbackValues[assignment.id] || ""}
                                onChange={(e) => 
                                  handleFeedbackChange(assignment.id, e.target.value)
                                }
                                className="w-full p-2 border border-gray-300 rounded text-sm"
                                placeholder="Enter your feedback..."
                              />
                              <button
                                onClick={() => submitFeedback(assignment.id)}
                                className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 text-sm whitespace-nowrap"
                              >
                                {credit.feedback ? "Update" : "Submit"}
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-400">Not graded yet</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No assignments found for your modules.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}