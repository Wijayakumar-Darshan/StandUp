package com.example.Standup.Entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.Set;

@Entity
@DiscriminatorValue("STUDENT")
@PrimaryKeyJoinColumn(name = "id")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Student extends User {

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "student_modules", joinColumns = @JoinColumn(name = "student_id"))
    @Column(name = "modules")
    private Set<String> modules;  // Changed from List to Set for uniqueness

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "enrollment_number", unique = true, nullable = false)
    private String enrollmentNumber;

    @Column(name = "active", nullable = false)
    @Builder.Default
    private Boolean active = true;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Assignment> assignments;  // Assuming Student has Assignments

}
