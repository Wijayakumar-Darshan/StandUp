package com.example.Standup.Repository;

import com.example.Standup.Entity.Credit;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CreditRepository extends JpaRepository<Credit, Long> {
    List<Credit> findByStudentId(Long studentId);
}

