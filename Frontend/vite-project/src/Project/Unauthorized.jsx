import { Link } from 'react-router-dom';

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-4xl font-bold text-red-500 mb-4">403</h1>
        <h2 className="text-2xl font-semibold mb-4">Unauthorized Access</h2>
        <p className="mb-6">You don't have permission to access this page.</p>
        <Link 
          to="/login" 
          className="px-4 py-2 bg-[#4A63A3] text-white rounded-md hover:bg-[#3b4f85]"
        >
          Return to Login
        </Link>
      </div>
    </div>
  );
}