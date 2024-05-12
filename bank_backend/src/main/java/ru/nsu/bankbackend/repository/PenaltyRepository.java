package ru.nsu.bankbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.nsu.bankbackend.model.Penalty;

@Repository
public interface PenaltyRepository extends JpaRepository<Penalty, Long> {
}
