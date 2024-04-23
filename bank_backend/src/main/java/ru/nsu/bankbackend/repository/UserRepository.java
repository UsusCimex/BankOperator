package ru.nsu.bankbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.nsu.bankbackend.model.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);
}
