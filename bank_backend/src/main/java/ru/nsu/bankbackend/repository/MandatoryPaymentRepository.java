package ru.nsu.bankbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import ru.nsu.bankbackend.model.MandatoryPayment;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MandatoryPaymentRepository extends JpaRepository<MandatoryPayment, Long> {
    @Query("select mp from MandatoryPayment mp where mp.dueDate < :date")
    List<MandatoryPayment> findOverduePayments(LocalDate date);
}
