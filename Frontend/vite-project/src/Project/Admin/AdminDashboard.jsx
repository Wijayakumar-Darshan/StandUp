import { Link ,useNavigate} from "react-router-dom";

export default function AdminDashboard() {

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove JWT token
    navigate('/login'); // Redirect to login page
  };



  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-[#4A63A3] text-white py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button 
      onClick={handleLogout} 
      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
    >
      Logout
    </button>
      </header>

      {/* Centered Buttons */}
      <div className="flex flex-col items-center justify-center flex-grow space-y-6">
        <Link to="/manage-students" className="w-60 text-center bg-[#4A63A3] text-white px-6 py-3 rounded-lg text-xl font-semibold shadow-md hover:bg-[#3b4f85] transition">
          Students
        </Link>
        <Link to="/manage-teacher" className="w-60 text-center bg-[#4A63A3] text-white px-6 py-3 rounded-lg text-xl font-semibold shadow-md hover:bg-[#3b4f85] transition">
          Teachers
        </Link>
      </div>
    </div>
  );
}
