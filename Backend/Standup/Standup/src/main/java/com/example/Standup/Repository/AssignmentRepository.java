package com.example.Standup.Repository;

import com.example.Standup.Entity.Assignment;
import com.example.Standup.Entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findByTeacherId(Long teacherId);

    List<Assignment> findByStudent(Student student);

    List<Assignment> findByModules(String module);

}