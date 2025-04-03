import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CreateTeacher() {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    modules: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Convert modules string to array
      const modulesArray = formData.modules
        .split(",")
        .map(module => module.trim())
        .filter(module => module.length > 0);

      const response = await fetch("http://localhost:8000/su/teacher", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          modules: modulesArray,
          role: "TEACHER" // Set default role
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create teacher");
      }

      toast.success("Teacher created successfully!");
      navigate("/manage-teacher");
    } catch (error) {
      console.error("Error creating teacher:", error);
      toast.error(error.message || "Failed to create teacher");
    } finally {
      setIsLoading(false);
    }
  };

  const goToManageTeachers = () => {
    navigate("/manage-teacher");
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
        <h1 className="text-2xl font-bold">Create Teacher</h1>
        <div className="flex space-x-4">
          <button 
            onClick={goToManageTeachers} 
            className="bg-white text-[#4A63A3] px-4 py-2 rounded-lg font-semibold hover:bg-gray-200"
          >
            Home
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
        <h2 className="text-2xl font-bold mb-4 text-center">Create Teacher</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Teacher Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
          <input
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
          <input
            type="text"
            placeholder="Modules (comma separated)"
            value={formData.modules}
            onChange={(e) => setFormData({ ...formData, modules: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full bg-[#4A63A3] text-white py-2 rounded-lg hover:bg-[#3b4f85] ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Creating..." : "Create Teacher"}
          </button>
        </form>
      </div>
    </div>
  );
}