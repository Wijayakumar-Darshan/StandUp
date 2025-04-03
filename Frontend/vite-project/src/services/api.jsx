import axios from "axios";

const API_BASE_URL = "http://localhost:8080/su"; // Change this if your backend URL is different

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Function to set Authorization token (if needed for future JWT implementation)
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

// Authentication APIs
export const login = (credentials) => api.post("/login", credentials);
export const register = (userData) => api.post("/register", userData);
export const createAdmin = (adminData) => api.post("/create-admin", adminData);

// Student APIs
export const getAllStudents = () => api.get("/students");
export const getStudentById = (id) => api.get(`/student/${id}`);
export const createStudent = (studentData) => api.post("/create-student", studentData);
export const updateStudent = (id, studentData) => api.put(`/update-student/${id}`, studentData);
export const deleteStudent = (id) => api.delete(`/delete-student/${id}`);

// Teacher APIs
export const getAllTeachers = () => api.get("/teachers");
export const getTeacherById = (id) => api.get(`/teacher/${id}`);
export const createTeacher = (teacherData) => api.post("/create-teacher", teacherData);
export const updateTeacher = (id, teacherData) => api.put(`/update-teacher/${id}`, teacherData);
export const deleteTeacher = (id) => api.delete(`/delete-teacher/${id}`);

// Assign Modules
export const assignModulesToTeacher = (teacherId, modules) =>
  api.put(`/assign-modules/${teacherId}`, modules);
export const assignModulesToStudent = (studentId, modules) =>
  api.put(`/assign-modules/${studentId}`, modules);

export default api;
