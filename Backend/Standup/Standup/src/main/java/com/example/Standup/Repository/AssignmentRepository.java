package com.example.Standup.Repository;

import com.example.Standup.Entity.Assignment;
import com.example.Standup.Entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findByTeacherId(Long teacherId);

    List<Assignment> findByStudent(Student student);
}