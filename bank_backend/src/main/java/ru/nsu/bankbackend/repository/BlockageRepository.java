package ru.nsu.bankbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.nsu.bankbackend.model.Blockage;

@Repository
public interface BlockageRepository extends JpaRepository<Blockage, Long> {
}
