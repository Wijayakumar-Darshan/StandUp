package com.example.Standup.Repository;

import com.example.Standup.Entity.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface TeacherRepository extends JpaRepository<Teacher, Long> {

    // Existing query methods
    @Query("SELECT t FROM Teacher t LEFT JOIN FETCH t.modules")
    List<Teacher> findAllWithModules();

    @Query("SELECT t FROM Teacher t")
    List<Teacher> findAllTeachers();

    // Add this method to find teacher by username
    Optional<Teacher> findByUsername(String username); // This is the correct method
}
