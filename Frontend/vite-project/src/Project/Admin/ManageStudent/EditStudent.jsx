import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function EditStudent() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    enrollmentNumber: "",
    modules: "",
    active: true
  });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch student data when component mounts
  useEffect(() => {
    const fetchStudent = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(`http://localhost:8000/su/student/${studentId}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (!response.ok) {
          throw new Error("Failed to fetch student data");
        }

        const student = await response.json();
        setFormData({
          name: student.name || "",
          username: student.username || "",
          password: "", // Password is intentionally left blank
          enrollmentNumber: student.enrollmentNumber || "",
          modules: student.modules?.join(", ") || "",
          active: student.active || true
        });
      } catch (error) {
        console.error("Error fetching student:", error);
        toast.error(error.message);
        navigate("/manage-students");
      }
    };

    fetchStudent();
  }, [studentId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
  
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }
  
      // Prepare complete update data
      const updateData = {
        name: formData.name,
        enrollmentNumber: formData.enrollmentNumber,
        active: formData.active,
        modules: formData.modules
          .split(",")
          .map(module => module.trim())
          .filter(module => module.length > 0),
        password: formData.password || null // Send null if password is empty
      };
  
      const response = await fetch(`http://localhost:8000/su/update-student/${studentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });
  
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || "Failed to update student");
      }
  
      toast.success("Student updated successfully!");
      navigate("/manage-students");
    } catch (error) {
      console.error("Error updating student:", error);
      toast.error(error.message || "Failed to update student");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
    toast.info("Logged out successfully");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="flex justify-between items-center bg-[#4A63A3] text-white p-4 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold">Edit Student</h1>
        <div className="flex space-x-4">
          <button 
            onClick={() => navigate("/manage-students")} 
            className="bg-white text-[#4A63A3] px-4 py-2 rounded-lg font-semibold hover:bg-gray-200"
          >
            Back to Students
          </button>
          <button 
            onClick={handleLogout} 
            className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="mt-6 bg-white p-6 rounded-lg shadow-md w-96 mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-center">Edit Student</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
              required
              disabled
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Enrollment Number</label>
            <input
              type="text"
              name="enrollmentNumber"
              value={formData.enrollmentNumber}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1">New Password (leave blank to keep current)</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Enter new password if changing"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Modules (comma separated)</label>
            <input
              type="text"
              name="modules"
              value={formData.modules}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="active"
              id="active"
              checked={formData.active}
              onChange={handleChange}
              className="mr-2"
            />
            <label htmlFor="active" className="font-medium">Active Student</label>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full bg-[#4A63A3] text-white py-2 rounded-lg hover:bg-[#3b4f85] ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Updating..." : "Update Student"}
          </button>
        </form>
      </div>
    </div>
  );
}