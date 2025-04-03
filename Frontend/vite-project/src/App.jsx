import { Routes, Route } from "react-router-dom";
import HomePage from "./Project/Home";
import LoginPage from "./Project/Login";
import AdminDashboard from "./Project/Admin/AdminDashboard";
import StudentDashboard from "./Project/Student/StudentDashboard";
import TeacherDashboard from "./Project/Teacher/TeacherDashboard";
import ManageStudents from "./Project/Admin/ManageStudent/ManageStudents";
import CreateStudents from "./Project/Admin/ManageStudent/CreateStudent";
import CreateTeacher from "./Project/Admin/ManageTeacher/CreateTeacher";
import ManageTeachers from "./Project/Admin/ManageTeacher/ManageTeacher";
import EditTeacher from "./Project/Admin/ManageTeacher/EditTeacher";
import EditStudent from "./Project/Admin/ManageStudent/EditStudent";
import CreateAssignment from "./Project/Teacher/CreateAssignment";
import GiveCredits from "./Project/Teacher/GiveCredits";
import ManageCredits from "./Project/Teacher/ManageCredits"; // Newly added
import Unauthorized from "./Project/Unauthorized";
import ProtectedRoute from "./Project/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ModuleDetails from "./Project/Teacher/View";

function App() {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Admin Routes - Protected */}
        <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/manage-students" element={<ManageStudents />} />
          <Route path="/create-student" element={<CreateStudents />} />
          <Route path="/create-teacher" element={<CreateTeacher />} />
          <Route path="/manage-teacher" element={<ManageTeachers />} />
          <Route path="/edit-teacher/:teacherId" element={<EditTeacher />} />
          <Route path="/edit-student/:studentId" element={<EditStudent />} />
        </Route>

        {/* Teacher Routes - Protected */}
        <Route element={<ProtectedRoute allowedRoles={["TEACHER"]} />}>
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/create-assignment" element={<CreateAssignment />} />
          <Route path="/give-credits/:assignmentId" element={<GiveCredits />} />
          <Route path="/manage-credits" element={<ManageCredits />} /> 
          // In your main router file (e.g., App.js)
          <Route path="/module/:module" element={<ModuleDetails />} />

          {/* Newly added */}
        </Route>

        {/* Student Routes - Protected */}
        <Route element={<ProtectedRoute allowedRoles={["STUDENT"]} />}>
          <Route path="/student" element={<StudentDashboard />} />
        </Route>
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </>
  );
}

export default App;
