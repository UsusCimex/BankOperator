package ru.nsu.bankbackend.service;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import ru.nsu.bankbackend.model.MandatoryPayment;
import ru.nsu.bankbackend.model.Penalty;
import ru.nsu.bankbackend.repository.MandatoryPaymentRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class MandatoryPaymentService {
    @Autowired
    private MandatoryPaymentRepository mandatoryPaymentRepository;

    @Transactional
    public List<MandatoryPayment> getAllMandatoryPayments() {
        return mandatoryPaymentRepository.findAll();
    }

    @Transactional
    public Optional<MandatoryPayment> getMandatoryPaymentById(Long id) {
        return mandatoryPaymentRepository.findById(id);
    }

    @Transactional
    public MandatoryPayment save(MandatoryPayment mandatoryPayment) {
        return mandatoryPaymentRepository.save(mandatoryPayment);
    }

    @Transactional
    public void delete(Long id) {
        mandatoryPaymentRepository.deleteById(id);
    }

    @Scheduled(cron = "0 0 0 * * ?")
    public void checkForOverduePayments() {
        LocalDate today = LocalDate.now();
        List<MandatoryPayment> overduePayments = mandatoryPaymentRepository.findOverduePayments(today);

        for (MandatoryPayment payment : overduePayments) {
            if (payment.getDueDate().isBefore(today)) {
                // Просроченный платеж найден, назначаем штраф
                applyPenalty(payment);
            }
        }
    }

    private void applyPenalty(MandatoryPayment payment) {
        // Создание или обновление объекта штрафа
        if (payment.getPenalty() == null) {
            Penalty newPenalty = new Penalty();
            newPenalty.setAmount(calculatePenaltyAmount(payment.getAmount()));
            payment.setPenalty(newPenalty);
        } else {
            payment.getPenalty().setAmount(payment.getPenalty().getAmount() + calculatePenaltyAmount(payment.getAmount()));
        }
        // Сохраняем изменения
        mandatoryPaymentRepository.save(payment);
    }

    private Double calculatePenaltyAmount(Double baseAmount) {
        return baseAmount * 10.0 / 100.0;
    }
}
