import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ManageCredits() {
  const navigate = useNavigate();
  const [creditRecords, setCreditRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCredits = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      try {
        const response = await fetch(`http://localhost:8000/su/teacher/assignment/${assignmentId}/give-credit`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch credits");
        }
        const data = await response.json();
        setCreditRecords(data);
      } catch (error) {
        console.error("Error fetching credits:", error);
        toast.error("Failed to load credits.");
      } finally {
        setLoading(false);
      }
    };
    fetchCredits();
  }, [navigate]);

  const handleUpdate = (index, newMarks) => {
    const updatedRecords = [...creditRecords];
    updatedRecords[index].givenCredit = newMarks;
    setCreditRecords(updatedRecords);
  };

  const handleConfirm = async (id, index) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://localhost:8000/su/confirm-credit/${id}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ givenCredit: creditRecords[index].givenCredit }),
      });
      if (!response.ok) {
        throw new Error("Failed to confirm credit");
      }
      toast.success("Credit confirmed!");
      const updatedRecords = [...creditRecords];
      updatedRecords[index].confirmed = true;
      setCreditRecords(updatedRecords);
    } catch (error) {
      console.error("Error confirming credit:", error);
      toast.error("Failed to confirm credit.");
    }
  };

  if (loading) {
    return <div className="text-center text-xl">Loading credits...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Manage Credits</h2>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Student Name</th>
              <th className="border p-2">Assignment</th>
              <th className="border p-2">Credit Value</th>
              <th className="border p-2">Given Credit</th>
              <th className="border p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {creditRecords.map((record, index) => (
              <tr key={record.id} className="text-center">
                <td className="border p-2">{record.studentName}</td>
                <td className="border p-2">{record.assignmentTitle}</td>
                <td className="border p-2">{record.allocatedCredit}</td>
                <td className="border p-2">
                  {record.confirmed ? (
                    record.givenCredit
                  ) : (
                    <input
                      type="number"
                      value={record.givenCredit}
                      onChange={(e) => handleUpdate(index, e.target.value)}
                      className="border p-1 w-16 text-center"
                    />
                  )}
                </td>
                <td className="border p-2">
                  {record.confirmed ? (
                    <span className="text-green-600">Confirmed</span>
                  ) : (
                    <button
                      onClick={() => handleConfirm(record.id, index)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                      Confirm
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
