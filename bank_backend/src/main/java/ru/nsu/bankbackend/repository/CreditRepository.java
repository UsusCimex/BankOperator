package ru.nsu.bankbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import ru.nsu.bankbackend.model.Client;
import ru.nsu.bankbackend.model.Credit;

import java.util.List;

@Repository
public interface CreditRepository extends JpaRepository<Credit, Long>, JpaSpecificationExecutor<Credit> {
    List<Credit> findByClientId(Long clientId);
}