package ru.nsu.bankbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.nsu.bankbackend.model.RemainingDebt;

@Repository
public interface RemainingDebtRepository extends JpaRepository<RemainingDebt, Long> {
}
