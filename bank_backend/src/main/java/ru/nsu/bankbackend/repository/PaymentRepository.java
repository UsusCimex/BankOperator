package ru.nsu.bankbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.nsu.bankbackend.model.Payment;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
}