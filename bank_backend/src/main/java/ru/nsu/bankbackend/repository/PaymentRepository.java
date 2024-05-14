package ru.nsu.bankbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import ru.nsu.bankbackend.model.Payment;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long>, JpaSpecificationExecutor<Payment> {
    List<Payment> findByCreditId(Long creditId);

    @Query("SELECT p FROM Payment p WHERE p.paymentDate BETWEEN :from AND :to")
    List<Payment> findAllPaymentsBetweenDates(LocalDateTime from, LocalDateTime to);
}