package com.example.Standup.Controller;

import com.example.Standup.Entity.Assignment;
import com.example.Standup.Entity.Student;
import com.example.Standup.Service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@RestController
@RequestMapping("/su")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/student-dashboard")
    public ResponseEntity<?> getStudentDashboard(Authentication authentication) {
        try {
            if (authentication == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authentication failed");
            }

            String username = authentication.getName();
            System.out.println("Fetching dashboard for user: " + username);

            Student student = studentService.getStudentByUsername(username);
            if (student == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Student not found");
            }

            List<Assignment> assignments = studentService.getAssignmentsByStudent(student.getId());

            return ResponseEntity.ok(new StudentDashboardResponse(student, assignments));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching dashboard: " + e.getMessage());
        }
    }

    // Create a student
    @PostMapping("/student")
    public ResponseEntity<String> createStudent(@RequestBody Student student) {
        studentService.createStudent(student);
        return ResponseEntity.ok("Student created successfully");
    }

    // Update student
    @PutMapping("/update-student/{studentId}")
    public ResponseEntity<?> updateStudent(@PathVariable Long studentId, @RequestBody Student updatedStudent) {
        try {
            Student existingStudent = studentService.getStudentById(studentId);
            if (existingStudent == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Student not found");
            }

            updatedStudent.setUsername(existingStudent.getUsername());

            Student savedStudent = studentService.updateStudent(studentId, updatedStudent);
            return ResponseEntity.ok(savedStudent);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error updating student: " + e.getMessage());
        }
    }

    // Get all students
    @GetMapping("/students")
    public ResponseEntity<List<Student>> getAllStudents() {
        return ResponseEntity.ok(studentService.getAllStudents());
    }

    // Get student by ID
    @GetMapping("/student/{studentId}")
    public ResponseEntity<Student> getStudentById(@PathVariable Long studentId) {
        Student student = studentService.getStudentById(studentId);
        if (student != null) {
            return ResponseEntity.ok(student);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
    }

    // DTO class for student dashboard response
    static class StudentDashboardResponse {
        public Student student;
        public List<Assignment> assignments;

        public StudentDashboardResponse(Student student, List<Assignment> assignments) {
            this.student = student;
            this.assignments = assignments;
        }
    }
}
