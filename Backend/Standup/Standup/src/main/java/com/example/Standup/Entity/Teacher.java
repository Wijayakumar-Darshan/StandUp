package com.example.Standup.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Entity
@DiscriminatorValue("TEACHER")
@PrimaryKeyJoinColumn(name = "id")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Teacher extends User {
    @ElementCollection
    @CollectionTable(name = "teacher_modules", joinColumns = @JoinColumn(name = "teacher_id"))
    @Column(name = "module")
    private List<String> modules;

    @Column(name = "name")
    private String name;

    @Column(name = "active")
    private Boolean active = true;
}