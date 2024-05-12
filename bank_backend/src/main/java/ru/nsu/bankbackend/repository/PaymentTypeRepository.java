package ru.nsu.bankbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.nsu.bankbackend.model.PaymentType;

@Repository
public interface PaymentTypeRepository extends JpaRepository<PaymentType, Long> {
}
