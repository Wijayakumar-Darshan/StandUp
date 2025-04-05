package com.example.Standup.Controller;

import com.example.Standup.Entity.*;
import com.example.Standup.JWT.JwtUtil;
import com.example.Standup.Service.StudentService;
import com.example.Standup.Service.TeacherService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/su")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class TeacherController {

    private final TeacherService teacherService;
    private final PasswordEncoder passwordEncoder;

    // DTO for dashboard response
    public static class TeacherDashboardResponse {
        private final Teacher teacher;
        private final List<Assignment> assignments;

        public TeacherDashboardResponse(Teacher teacher, List<Assignment> assignments) {
            this.teacher = teacher;
            this.assignments = assignments;
        }

        public Teacher getTeacher() {
            return teacher;
        }

        public List<Assignment> getAssignments() {
            return assignments;
        }
    }

    @RequestMapping("/su")
    public class StudentController {

        @Autowired
        private StudentService studentService;

        @GetMapping("/student-dashboard")
        public ResponseEntity<?> getStudentDashboard(@RequestHeader("Authorization") String token) {
            try {
                // Extract username from token
                JwtUtil jwtUtil = new JwtUtil();
                String username = jwtUtil.extractUsername(token.replace("Bearer ", ""));

                // Get dashboard data
                Map<String, Object> response = studentService.getStudentDashboard(username);
                return ResponseEntity.ok(response);
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching dashboard");
            }
        }
    }

    // Create Assignment - Updated to match frontend
    @PostMapping("/teacher/create-assignment")
    public ResponseEntity<?> createAssignment(@RequestBody Assignment assignment, Authentication authentication) {
        try {
            String username = authentication.getName();
            Teacher teacher = teacherService.getTeacherByUsername(username);
            if (teacher == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Teacher not found");
            }

            // Basic validation
            if (assignment.getTitle() == null || assignment.getTitle().isEmpty()) {
                return ResponseEntity.badRequest().body("Assignment title is required");
            }

            assignment.setTeacher(teacher);
            Assignment createdAssignment = teacherService.createAssignment(assignment);
            return ResponseEntity.ok(createdAssignment);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating assignment: " + e.getMessage());
        }
    }

    // Get assignments by module - Added for frontend
    @GetMapping("/teacher/assignments/module")
    public ResponseEntity<?> getAssignmentsByModule(@RequestParam String module, Authentication authentication) {
        try {
            String username = authentication.getName();
            Teacher teacher = teacherService.getTeacherByUsername(username);
            if (teacher == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Teacher not found");
            }
            if (!teacher.getModules().contains(module)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not authorized for this module");
            }
            List<Assignment> assignments = teacherService.getAssignmentsByModules(module);
            return ResponseEntity.ok(assignments);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching assignments: " + e.getMessage());
        }
    }

    // ... [Keep all other existing methods unchanged]

    @PostMapping("/teacher")
    public ResponseEntity<String> createTeacher(@RequestBody Teacher teacher) {
        teacherService.createTeacher(teacher);
        return ResponseEntity.ok("Teacher created successfully");
    }

    @PutMapping("/update-teacher/{teacherId}")
    public ResponseEntity<?> updateTeacher(@PathVariable Long teacherId, @RequestBody Teacher updatedTeacher) {
        try {
            Teacher existingTeacher = teacherService.getTeacherById(teacherId);
            if (existingTeacher == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Teacher not found");
            }
            if (updatedTeacher.getName() != null) {
                existingTeacher.setName(updatedTeacher.getName());
            }
            if (updatedTeacher.getModules() != null) {
                existingTeacher.setModules(updatedTeacher.getModules());
            }
            // Remove the null check for active since it's a primitive boolean
            existingTeacher.setActive(updatedTeacher.getActive());

            if (updatedTeacher.getPassword() != null && !updatedTeacher.getPassword().isEmpty()) {
                existingTeacher.setPassword(passwordEncoder.encode(updatedTeacher.getPassword()));
            }
            Teacher savedTeacher = teacherService.updateTeacher(existingTeacher);
            return ResponseEntity.ok(savedTeacher);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error updating teacher: " + e.getMessage());
        }
    }

    @DeleteMapping("/delete-teacher/{teacherId}")
    public ResponseEntity<String> deleteTeacher(@PathVariable Long teacherId) {
        teacherService.deleteTeacher(teacherId);
        return ResponseEntity.ok("Teacher deleted successfully");
    }

    @GetMapping("/teachers")
    public ResponseEntity<List<Teacher>> getAllTeachers() {
        return ResponseEntity.ok(teacherService.getAllTeachers());
    }

    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<Teacher> getTeacherById(@PathVariable Long teacherId) {
        Teacher teacher = teacherService.getTeacherById(teacherId);
        if (teacher != null) {
            return ResponseEntity.ok(teacher);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
    }

    @PostMapping("/teacher/assignment/{assignmentId}/give-credit")
    public ResponseEntity<?> assignCredit(
            @PathVariable Long assignmentId,
            @RequestBody Credit credit,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            Teacher teacher = teacherService.getTeacherByUsername(username);
            if (teacher == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Teacher not found");
            }

            Assignment assignment = teacherService.getAssignmentById(assignmentId);
            if (assignment == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Assignment not found");
            }

            if (credit.getStudent() == null || credit.getMarks() < 0) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid credit information");
            }

            credit.setAssignment(assignment);
            Credit assignedCredit = teacherService.assignCredit(credit);
            return ResponseEntity.ok(assignedCredit);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error assigning credit: " + e.getMessage());
        }
    }

    @PostMapping("/feedback")
    public ResponseEntity<Feedback> sendFeedback(@RequestBody Feedback feedback) {
        return ResponseEntity.ok(teacherService.sendFeedback(feedback));
    }
}