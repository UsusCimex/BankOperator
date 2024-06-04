package ru.nsu.bankbackend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import ru.nsu.bankbackend.cpecification.PaymentSpecification;
import ru.nsu.bankbackend.dto.PaymentDTO;
import ru.nsu.bankbackend.dto.PaymentDetailDTO;
import ru.nsu.bankbackend.model.*;
import ru.nsu.bankbackend.repository.*;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final CreditRepository creditRepository;
    private final PaymentTypeRepository paymentTypeRepository;
    private final MandatoryPaymentRepository mandatoryPaymentRepository;
    private final PenaltyRepository penaltyRepository;
    private final RemainingDebtRepository remainingDebtRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public PaymentDetailDTO convertToDTO(Payment payment) {
        PaymentDetailDTO dto = new PaymentDetailDTO();
        dto.setId(payment.getId());
        dto.setCreditId(payment.getCredit().getId());
        dto.setAmount(payment.getAmount());
        dto.setPaymentDate(payment.getPaymentDate());
        dto.setCommission(payment.getPaymentType().getCommission());
        dto.setPaymentType(payment.getPaymentType().getPaymentType());
        dto.setClientName(payment.getCredit().getClient().getName());
        dto.setTariffName(payment.getCredit().getTariff().getName());
        return dto;
    }

    public Payment mapToPayment(PaymentDTO paymentDTO) {
        Payment payment = new Payment();
        payment.setPaymentDate(paymentDTO.getPaymentDate());
        PaymentType paymentType = paymentTypeRepository.findById(paymentDTO.getPaymentTypeId())
                .orElseThrow(() -> new RuntimeException("Payment type not found"));
        payment.setPaymentType(paymentType);
        payment.setAmount(paymentDTO.getAmount());
        payment.setCredit(creditRepository.findById(paymentDTO.getCreditId())
                .orElseThrow(() -> new RuntimeException("Credit not found")));
        return payment;
    }

    @Transactional
    public void processPayment(Payment payment) {
        Credit credit = payment.getCredit();
        Tariff tariff = credit.getTariff();
        MandatoryPayment mandatoryPayment = credit.getMandatoryPayment();
        Penalty penalty = mandatoryPayment.getPenalty();
        RemainingDebt remainingDebt = credit.getRemainingDebt();

        Double realAmount = payment.getAmount() / (1.0 + payment.getPaymentType().getCommission() / 100.0);

        if (penalty != null) {
            Double remainingAmount = realAmount - penalty.getAmount();
            if (remainingAmount > 0.0) {
                penaltyRepository.delete(penalty);
                mandatoryPayment.setAmount(mandatoryPayment.getAmount() - remainingAmount);
                mandatoryPayment.setPenalty(null);
            } else {
                penalty.setAmount(-remainingAmount);
                penaltyRepository.save(penalty);
            }
        } else {
            mandatoryPayment.setAmount(mandatoryPayment.getAmount() - realAmount);
        }
        mandatoryPaymentRepository.save(mandatoryPayment);

        if (remainingDebt != null) {
            remainingDebt.setRemainingAmount(remainingDebt.getRemainingAmount() - realAmount);
            remainingDebtRepository.save(remainingDebt);
        }

        while (mandatoryPayment.getAmount() <= 0.0) {
            if (mandatoryPayment.getLoanTerm() > 0) {
                mandatoryPayment.setLoanTerm(mandatoryPayment.getLoanTerm() - 1);
                Double newAmount = credit.getAmount() / tariff.getLoanTerm() +
                        credit.getAmount() * tariff.getInterestRate() / (tariff.getLoanTerm() * 100.0);
                mandatoryPayment.setAmount(newAmount + mandatoryPayment.getAmount());
                mandatoryPayment.setDueDate(mandatoryPayment.getDueDate().plusMonths(1));
                mandatoryPaymentRepository.save(mandatoryPayment);
            }
        }

        if (remainingDebt != null && remainingDebt.getRemainingAmount() <= 0.0) {
            credit.setStatus(Credit.Status.CLOSED);
            remainingDebtRepository.delete(remainingDebt);
            credit.setRemainingDebt(null);
            mandatoryPaymentRepository.delete(mandatoryPayment);
            credit.setMandatoryPayment(null);
            creditRepository.save(credit);
        }
    }

    @Transactional
    public Page<PaymentDetailDTO> findAll(PageRequest pageRequest) {
        return paymentRepository.findAll(pageRequest).map(this::convertToDTO);
    }

    @Transactional
    public Page<PaymentDetailDTO> findWithFilters(PageRequest pageRequest, String clientName, Long amount, Date paymentDate, Long commission) {
        Specification<Payment> spec = Specification.where(null);

        if (clientName != null) {
            spec = spec.and(PaymentSpecification.hasClientNameLike(clientName));
        }
        if (amount != null) {
            spec = spec.and(PaymentSpecification.hasAmountEqualTo(amount));
        }
        if (paymentDate != null) {
            spec = spec.and(PaymentSpecification.hasPaymentDateOn(paymentDate));
        }
        if (commission != null) {
            spec = spec.and(PaymentSpecification.hasCommissionEqualTo(commission));
        }

        return paymentRepository.findAll(spec, pageRequest).map(this::convertToDTO);
    }

    @Transactional
    public List<PaymentDetailDTO> findByCreditId(Long creditId) {
        return paymentRepository.findByCreditId(creditId).stream().map(this::convertToDTO).toList();
    }

    @Transactional
    public Optional<PaymentDetailDTO> findById(Long id) {
        return paymentRepository.findById(id).map(this::convertToDTO);
    }

    @Transactional
    public PaymentDetailDTO save(PaymentDTO paymentDetail) {
        Payment payment = mapToPayment(paymentDetail);
        Payment savedPayment = paymentRepository.save(payment);
        processPayment(savedPayment);
        return convertToDTO(savedPayment);
    }

    @Transactional
    public void deleteById(Long id) throws Exception {
        Payment payment = paymentRepository.findById(id).orElseThrow(() -> new Exception("Платёж не найден."));
        RemainingDebt remainingDebt = payment.getCredit().getRemainingDebt();
        remainingDebt.setRemainingAmount(remainingDebt.getRemainingAmount() + payment.getAmount());
        remainingDebtRepository.save(remainingDebt);
        paymentRepository.deleteById(id);
    }

    @Transactional
    public PaymentDetailDTO update(Long id, PaymentDTO paymentDetails) throws Exception {
        return paymentRepository.findById(id)
                .map(existingPayment -> {
                    MandatoryPayment mandatoryPayment = existingPayment.getCredit().getMandatoryPayment();
                    mandatoryPayment.setAmount(mandatoryPayment.getAmount() + existingPayment.getAmount());
                    mandatoryPaymentRepository.save(mandatoryPayment);

                    Payment updatedPayment = mapToPayment(paymentDetails);
                    updatedPayment.setId(id);
                    Payment savedPayment = paymentRepository.save(updatedPayment);
                    processPayment(savedPayment);
                    return convertToDTO(savedPayment);
                })
                .orElseThrow(() -> new Exception("Платёж не найден."));
    }

    @Transactional
    public List<PaymentDetailDTO> executeCustomQuery(String queryJson) throws JsonProcessingException {
        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode rootNode = objectMapper.readTree(queryJson);
        JsonNode queryNode = rootNode.get("query");

        if (queryNode == null) {
            throw new IllegalArgumentException("JSON должен содержать элемент 'query'.");
        }

        String query = queryNode.asText();
        String testQuery = query.toLowerCase();

        if (!testQuery.contains("select * from payment")) {
            throw new IllegalArgumentException("Запрос должен содержать SELECT * FROM payment.");
        }

        if (testQuery.contains("join") || testQuery.contains("group by") || testQuery.contains(";") || testQuery.contains(",")) {
            throw new IllegalArgumentException("JOIN, GROUP BY и использование ';' и ',' не разрешены.");
        }

        String modifiedQuery = "SELECT p FROM Payment p " + query.substring(query.indexOf("FROM payment") + "FROM payment".length());

        TypedQuery<Payment> nativeQuery = entityManager.createQuery(modifiedQuery, Payment.class);
        List<Payment> queryResult = nativeQuery.getResultList();

        return queryResult.stream().map(this::convertToDTO).toList();
    }
}
