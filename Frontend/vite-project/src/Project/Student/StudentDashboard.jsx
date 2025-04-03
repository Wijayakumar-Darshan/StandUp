import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackValues, setFeedbackValues] = useState({});

  // Fetch student assignments along with credit values and feedback data
  useEffect(() => {
    const fetchAssignments = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Unauthorized. Please log in again.");
        navigate("/login");
        return;
      }

      try {
        const response = await fetch("http://localhost:8000/su/student/dashboard", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch assignments: ${errorText}`);
        }

        const data = await response.json();
        setAssignments(data.assignments); // assuming data includes assignments with credit values and feedback status
      } catch (error) {
        toast.error("Error fetching assignments.");
        console.error("Fetch Assignments Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignments();
  }, [navigate]);

  // Handle feedback change
  const handleFeedbackChange = (assignmentId, feedback) => {
    setFeedbackValues((prev) => ({
      ...prev,
      [assignmentId]: feedback,
    }));
  };

  // Submit feedback for a particular assignment
  const handleSubmitFeedback = async (assignmentId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Unauthorized. Please log in again.");
      navigate("/login");
      return;
    }

    const feedback = feedbackValues[assignmentId] || "";

    try {
      const response = await fetch(
        `http://localhost:8000/su/student/assignment/${assignmentId}/feedback`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            feedback,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to submit feedback: ${errorText}`);
      }

      toast.success("Feedback submitted successfully!");
    } catch (error) {
      toast.error("Error submitting feedback.");
      console.error("Submit Feedback Error:", error);
    }
  };

  if (isLoading) return <div className="text-center text-xl">Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 p-6">
      <h2 className="text-2xl font-bold mb-4">Student Dashboard</h2>
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2">Assignment Title</th>
              <th className="p-2">Credit</th>
              <th className="p-2">Feedback</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((assignment) => (
              <tr key={assignment.id} className="border-t">
                <td className="p-2">{assignment.title}</td>
                <td className="p-2">{assignment.creditMarks} Marks</td>
                <td className="p-2">
                  <textarea
                    value={feedbackValues[assignment.id] || ""}
                    onChange={(e) =>
                      handleFeedbackChange(assignment.id, e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="Enter your feedback..."
                  />
                </td>
                <td className="p-2">
                  <button
                    onClick={() => handleSubmitFeedback(assignment.id)}
                    className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600"
                  >
                    Submit Feedback
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
