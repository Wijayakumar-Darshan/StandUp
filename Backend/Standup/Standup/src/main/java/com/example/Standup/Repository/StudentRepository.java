package com.example.Standup.Repository;

import com.example.Standup.Entity.Assignment;
import com.example.Standup.Entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {
    // Correct query for JOINED inheritance
    @Query("SELECT s FROM Student s LEFT JOIN FETCH s.modules")
    List<Student> findAllWithModules();

    // Alternative if you need to fetch all student data including User fields
    @Query("SELECT s FROM Student s")
    List<Student> findAllStudents();

    Optional<Student> findByUsername(String username);  // This will find the student by their username

    // In StudentRepository
    @Query("SELECT s FROM Student s JOIN s.modules m WHERE m = :modules")
    List<Student> findByModulesContaining(@Param("modules") String module);

    // In AssignmentRepository
    List<Assignment> findByModules(String module);
}
