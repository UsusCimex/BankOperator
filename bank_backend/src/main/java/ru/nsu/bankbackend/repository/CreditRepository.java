package ru.nsu.bankbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.nsu.bankbackend.model.Credit;

@Repository
public interface CreditRepository extends JpaRepository<Credit, Long> {
}