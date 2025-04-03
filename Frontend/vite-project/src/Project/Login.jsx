import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/su/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ username, password }),
      });

      let responseData;
      try {
        responseData = await response.json();
      } catch {
        // If JSON parsing fails, get the raw text
        const text = await response.text();
        throw new Error(text || 'Login failed');
      }

      if (!response.ok) {
        throw new Error(responseData.message || 'Login failed');
      }

      if (responseData.token) {
        localStorage.setItem('token', responseData.token);
        localStorage.setItem('role', responseData.role);
        
        // Redirect based on role
        switch (responseData.role) {
          case 'ADMIN': navigate('/admin'); break;
          case 'TEACHER': navigate('/teacher'); break;
          case 'STUDENT': navigate('/student'); break;
          default: setError('Unknown user role');
        }
      } else {
        throw new Error('No token received');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded-lg shadow-md w-80">
        <h2 className="text-2xl font-bold text-center mb-4">Login</h2>
        {error && <p className="text-red-500 text-center mb-3">{error}</p>}

        <div className="mb-3">
          <label className="block font-medium">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={isLoading}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-3">
          <label className="block font-medium">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            className="w-full p-2 border rounded"
          />
        </div>

        <button 
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
