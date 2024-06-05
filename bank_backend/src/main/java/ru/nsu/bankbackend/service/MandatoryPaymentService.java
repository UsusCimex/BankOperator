package ru.nsu.bankbackend.service;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import ru.nsu.bankbackend.model.*;
import ru.nsu.bankbackend.repository.CreditRepository;
import ru.nsu.bankbackend.repository.MandatoryPaymentRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class MandatoryPaymentService {
    private final MandatoryPaymentRepository mandatoryPaymentRepository;

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

    private void applyPenalty(MandatoryPayment payment) {
        if (payment.getPenalty() == null) {
            Penalty newPenalty = new Penalty();
            newPenalty.setAmount(payment.getAmount());
            payment.setPenalty(newPenalty);
        } else {
            payment.getPenalty().setAmount(payment.getPenalty().getAmount() + payment.getAmount());
        }
        mandatoryPaymentRepository.save(payment);
    }

    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void checkForOverduePayments() {
        System.err.println("TARRAR");
        LocalDate today = LocalDate.now();
        List<MandatoryPayment> overduePayments = mandatoryPaymentRepository.findOverduePayments(today);

        for (MandatoryPayment payment : overduePayments) {
            if (payment.getDueDate().isBefore(today)) {
                Credit credit = payment.getCredit();
                RemainingDebt remainingDebt = credit.getRemainingDebt();
                remainingDebt.setRemainingAmount(remainingDebt.getRemainingAmount() - payment.getPaymentAmount());
                if (payment.getPaymentAmount() < payment.getAmount()) {
                    payment.setAmount(payment.getAmount() - payment.getPaymentAmount());
                    applyPenalty(payment);
                }
                payment.setPaymentAmount(0.0);
                payment.setAmount(0.0);

                payment.setLoanTerm(payment.getLoanTerm() - 1);
                Tariff tariff = credit.getTariff();
                Double monthPercent = tariff.getInterestRate() / 1200.0;
                Integer loanTerm = payment.getLoanTerm();
                Double initialAmount = credit.getAmount() * monthPercent / (1 - Math.pow(1 + monthPercent, -loanTerm));

                payment.setAmount(initialAmount);
                payment.setDueDate(payment.getDueDate().plusMonths(1));
                mandatoryPaymentRepository.save(payment);
            }
        }
    }
}
