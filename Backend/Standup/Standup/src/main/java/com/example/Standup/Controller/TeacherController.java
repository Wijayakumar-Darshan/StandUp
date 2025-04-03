package com.example.Standup.Controller;

import com.example.Standup.Entity.Assignment;
import com.example.Standup.Entity.Credit;
import com.example.Standup.Entity.Feedback;
import com.example.Standup.Entity.Teacher;
import com.example.Standup.Service.TeacherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/su")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class TeacherController {

    private final TeacherService teacherService;
    private final PasswordEncoder passwordEncoder;

    // Fetch teacher dashboard details
    @GetMapping("/teacher/dashboard")
    public ResponseEntity<?> getTeacherDashboard(Authentication authentication) {
        try {
            String username = authentication.getName();
            Teacher teacher = teacherService.getTeacherByUsername(username);
            if (teacher == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Teacher not found");
            }
            List<Assignment> assignments = teacherService.getAssignmentsByTeacher(teacher.getId());
            return ResponseEntity.ok(new TeacherDashboardResponse(teacher, assignments));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching dashboard: " + e.getMessage());
        }
    }

    @PostMapping("/teacher")
    public ResponseEntity<String> createTeacher(@RequestBody Teacher teacher) {
        teacherService.createTeacher(teacher);
        return ResponseEntity.ok("Teacher created successfully");
    }

    @PutMapping("/update-teacher/{teacherId}")
    public ResponseEntity<?> updateTeacher(@PathVariable Long teacherId, @RequestBody Teacher updatedTeacher) {
        try {
            Teacher existingTeacher = teacherService.getTeacherById(teacherId);
            if (existingTeacher != null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Teacher not found");
            }
            if (updatedTeacher.getName() != null) {
                existingTeacher.setName(updatedTeacher.getName());
            }
            if (updatedTeacher.getModules() != null) {
                existingTeacher.setModules(updatedTeacher.getModules());
            }
            if (updatedTeacher.getActive() != null) {
                existingTeacher.setActive(updatedTeacher.getActive());
            }
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

    // Create Assignment
    @PostMapping("/teacher/create-assignment")
    public ResponseEntity<?> createAssignment(@RequestBody Assignment assignment, Authentication authentication) {
        try {
            // Get the logged-in teacher
            String username = authentication.getName();
            Teacher teacher = teacherService.getTeacherByUsername(username);
            if (teacher == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Teacher not found");
            }

            // Set the teacher for the new assignment
            assignment.setTeacher(teacher);

            // Save the assignment
            Assignment createdAssignment = teacherService.createAssignment(assignment);

            return ResponseEntity.ok(createdAssignment);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error creating assignment: " + e.getMessage());
        }
    }


    // Assign Credit to Student for an Assignment
    @PostMapping("/teacher/assignment/{assignmentId}/give-credit")
    public ResponseEntity<?> assignCredit(
            @PathVariable Long assignmentId,
            @RequestBody Credit credit,
            Authentication authentication) {

        try {
            // Get the logged-in teacher
            String username = authentication.getName();
            Teacher teacher = teacherService.getTeacherByUsername(username);
            if (teacher == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Teacher not found");
            }

            // Fetch the assignment
            Assignment assignment = teacherService.getAssignmentById(assignmentId);
            if (assignment == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Assignment not found");
            }

            // Ensure the credit is assigned to the correct student
            if (credit.getStudent() == null || credit.getMarks() < 0) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid credit information");
            }

            // Set the assignment to the credit
            credit.setAssignment(assignment);

            // Save the credit to the database
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

    // DTO class for teacher dashboard response
    static class TeacherDashboardResponse {
        public Teacher teacher;
        public List<Assignment> assignments;
        public TeacherDashboardResponse(Teacher teacher, List<Assignment> assignments) {
            this.teacher = teacher;
            this.assignments = assignments;
        }
    }
}