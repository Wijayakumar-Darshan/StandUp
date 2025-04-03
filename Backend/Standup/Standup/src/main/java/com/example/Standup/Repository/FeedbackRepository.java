package com.example.Standup.Repository;

import com.example.Standup.Entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByReceiverId(Long receiverId);
}
