package com.example.Standup.Service;

import com.example.Standup.Entity.*;
import com.example.Standup.Enum.Role;
import com.example.Standup.Repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TeacherService {
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder; // Inject PasswordEncoder
    private final AssignmentRepository assignmentRepository;
    private final CreditRepository creditRepository;
    private final FeedbackRepository feedbackRepository;


    public Teacher createTeacher(Teacher teacher) {
        teacher.setRole(Role.TEACHER); // Ensure role is assigned


        teacher.setPassword(passwordEncoder.encode(teacher.getPassword()));
        return teacherRepository.save(teacher);
    }

    public Teacher updateTeacher(Teacher teacher) {
        return teacherRepository.save(teacher);
    }

    public void deleteTeacher(Long teacherId) {
        teacherRepository.deleteById(teacherId);
    }

    public List<Teacher> getAllTeachers() {
        return teacherRepository.findAll(); // Or use findAllTeachers() from UserRepository
    }

    public Teacher getTeacherById(Long teacherId) {

        return teacherRepository.findById(teacherId).orElse(null);
    }

    public Assignment createAssignment(Assignment assignment) {
        return assignmentRepository.save(assignment);
    }

    public List<Assignment> getAssignmentsByTeacher(Long teacherId) {
        return assignmentRepository.findByTeacherId(teacherId);
    }

    public Assignment getAssignmentById(Long assignmentId) {
        return assignmentRepository.findById(assignmentId).orElse(null);
    }


    public Credit assignCredit(Credit credit) {
        return creditRepository.save(credit);
    }

    public Feedback sendFeedback(Feedback feedback) {
        return feedbackRepository.save(feedback);
    }

    public Teacher getTeacherByUsername(String username) {
        return teacherRepository.findByUsername(username).orElse(null);
    }
    public List<Student> getStudentsByModules(String module) {
        return studentRepository.findByModulesContaining(module);
    }

    public List<Assignment> getAssignmentsByModules(String module) {
        return assignmentRepository.findByModules(module);
    }
}