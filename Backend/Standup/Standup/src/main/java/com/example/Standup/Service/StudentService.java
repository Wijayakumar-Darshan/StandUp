package com.example.Standup.Service;

import com.example.Standup.Entity.Assignment;
import com.example.Standup.Entity.Student;
import com.example.Standup.Enum.Role;
import com.example.Standup.Repository.AssignmentRepository;
import com.example.Standup.Repository.StudentRepository;
import com.example.Standup.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder; // Inject PasswordEncoder

    @Autowired  // Make sure this annotation is present
    private AssignmentRepository assignmentRepository;



    public Student createStudent(Student student) {
        student.setRole(Role.STUDENT); // Ensure role is assigned

        student.setPassword(passwordEncoder.encode(student.getPassword()));

        return studentRepository.save(student);
    }


    public Student updateStudent(Long studentId, Student updatedStudent) {
        Student existingStudent = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // Update all fields
        if (updatedStudent.getName() != null) {
            existingStudent.setName(updatedStudent.getName());
        }
        if (updatedStudent.getEnrollmentNumber() != null) {
            existingStudent.setEnrollmentNumber(updatedStudent.getEnrollmentNumber());
        }
        if (updatedStudent.getModules() != null) {
            existingStudent.setModules(updatedStudent.getModules());
        }
        if (updatedStudent.getActive() != null) {
            existingStudent.setActive(updatedStudent.getActive());
        }
        if (updatedStudent.getPassword() != null && !updatedStudent.getPassword().isEmpty()) {
            existingStudent.setPassword(passwordEncoder.encode(updatedStudent.getPassword()));
        }

        return studentRepository.save(existingStudent);
    }

    public void deleteStudent(Long studentId) {
        studentRepository.deleteById(studentId);
    }

    public List<Student> getAllStudents() {
        return studentRepository.findAll(); // Or use findAllStudents() from UserRepository
    }

    public Student getStudentById(Long studentId) {
        return studentRepository.findById(studentId).orElse(null);
    }

    public Student getStudentByUsername(String username) {
        return studentRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Student not found"));
    }

    public List<Assignment> getAssignmentsByStudent(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        return assignmentRepository.findByStudent(student); // Assuming such a relationship exists
    }


    public Map<String, Object> getStudentDashboard(String username) {
        return Map.of();
    }
}