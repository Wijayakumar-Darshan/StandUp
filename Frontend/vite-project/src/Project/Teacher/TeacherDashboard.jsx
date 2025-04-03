import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function GiveCredits() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedAssignment, setSelectedAssignment] = useState("");
  const [marks, setMarks] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch students (active only)
  const fetchStudents = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/su/students", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch students");
      }

      const data = await response.json();
      setStudents(data.filter(student => student.active)); // Only show active students
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to load students.");
    }
  }, [navigate]);

  // Fetch teacher's assignments
  const fetchAssignments = useCallback(async () => {
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
  }, [navigate]);

  useEffect(() => {
    fetchStudents();
    fetchAssignments();
  }, [fetchStudents, fetchAssignments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !selectedAssignment || !marks) {
      toast.error("Please select a student, an assignment, and enter marks.");
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://localhost:8000/su/teacher/assignment/${selectedAssignment}/give-credit`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student: { id: selectedStudent }, // Assuming the student object has an 'id'
          marks: parseInt(marks),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to assign credits");
      }

      toast.success("Credits assigned successfully!");
      navigate("/teacher-dashboard");
    } catch (error) {
      console.error("Error assigning credits:", error);
      toast.error("Failed to assign credits.");
    }
  };

  if (isLoading) {
    return <div className="text-center text-xl">Loading students and assignments...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Give Credits</h2>
        <form onSubmit={handleSubmit}>
          <label className="block text-gray-700 font-medium">Select Student</label>
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="w-full p-2 border rounded-lg mb-4"
          >
            <option value="">-- Select a student --</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name || student.username}
              </option>
            ))}
          </select>

          <label className="block text-gray-700 font-medium">Select Assignment</label>
          <select
            value={selectedAssignment}
            onChange={(e) => setSelectedAssignment(e.target.value)}
            className="w-full p-2 border rounded-lg mb-4"
          >
            <option value="">-- Select an assignment --</option>
            {assignments.map((assignment) => (
              <option key={assignment.id} value={assignment.id}>
                {assignment.title} - {assignment.creditMarks} Marks
              </option>
            ))}
          </select>

          <label className="block text-gray-700 font-medium">Enter Marks</label>
          <input
            type="number"
            value={marks}
            onChange={(e) => setMarks(e.target.value)}
            className="w-full p-2 border rounded-lg mb-4"
            placeholder="Enter marks"
          />

          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
          >
            Submit Credits
          </button>
        </form>
      </div>
    </div>
  );
}
