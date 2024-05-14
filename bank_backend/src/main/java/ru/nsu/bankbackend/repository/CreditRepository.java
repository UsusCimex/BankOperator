package ru.nsu.bankbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import ru.nsu.bankbackend.model.Credit;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface CreditRepository extends JpaRepository<Credit, Long>, JpaSpecificationExecutor<Credit> {
    List<Credit> findByClientId(Long clientId);

    @Query("SELECT c FROM Credit c WHERE c.startDate BETWEEN :from AND :to")
    List<Credit> findAllCreditsBetweenDates(LocalDate from, LocalDate to);
}