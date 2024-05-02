package ru.nsu.bankbackend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.micrometer.observation.ObservationFilter;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ru.nsu.bankbackend.dto.PaymentDTO;
import ru.nsu.bankbackend.model.Client;
import ru.nsu.bankbackend.model.Credit;
import ru.nsu.bankbackend.model.Payment;
import ru.nsu.bankbackend.model.Tariff;
import ru.nsu.bankbackend.repository.CreditRepository;
import ru.nsu.bankbackend.repository.PaymentRepository;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;
    @PersistenceContext
    private EntityManager entityManager;
    @Autowired
    private CreditRepository creditRepository;

    public List<Payment> findAll() {
        return paymentRepository.findAll();
    }

    public Optional<Payment> findById(Long id) {
        return paymentRepository.findById(id);
    }

    public Payment save(PaymentDTO paymentDetail) {
        Credit credit = creditRepository.findById(paymentDetail.getCreditId())
                .orElseThrow(() -> new RuntimeException("Credit not found"));

        Payment payment = new Payment();
        payment.setCredit(credit);
        payment.setPaymentDate(paymentDetail.getPaymentDate());
        payment.setAmount(paymentDetail.getAmount());
        payment.setPaymentType(paymentDetail.getPaymentType());
        payment.setCommission(paymentDetail.getCommission());
        return paymentRepository.save(payment);
    }

    public void deleteById(Long id) {
        paymentRepository.deleteById(id);
    }

    public Payment update(Long id, PaymentDTO paymentDetails) throws Exception {
        return paymentRepository.findById(id)
                .map(existingPayment -> {
                    Credit credit = creditRepository.findById(paymentDetails.getCreditId())
                            .orElseThrow(() -> new RuntimeException("Credit not found"));

                    existingPayment.setPaymentDate(paymentDetails.getPaymentDate());
                    existingPayment.setPaymentType(paymentDetails.getPaymentType());
                    existingPayment.setCommission(paymentDetails.getCommission());
                    existingPayment.setAmount(paymentDetails.getAmount());
                    existingPayment.setCredit(credit);
                    return paymentRepository.save(existingPayment);
                })
                .orElseThrow(() -> new Exception("Клиент не найден."));
    }

    public Payment mapToPayment(PaymentDTO paymentDTO) {
        Payment payment = new Payment();
        payment.setPaymentDate(paymentDTO.getPaymentDate());
        payment.setPaymentType(paymentDTO.getPaymentType());
        payment.setCommission(paymentDTO.getCommission());
        payment.setAmount(paymentDTO.getAmount());
        payment.setCredit(creditRepository.findById(paymentDTO.getCreditId()).orElseThrow(() -> new RuntimeException("Credit not found")));
        return payment;
    }

    public PaymentDTO mapToPaymentDTO(Payment payment) {
        PaymentDTO paymentDTO = new PaymentDTO();
        paymentDTO.setPaymentDate(payment.getPaymentDate());
        paymentDTO.setPaymentType(payment.getPaymentType());
        paymentDTO.setCommission(payment.getCommission());
        paymentDTO.setAmount(payment.getAmount());
        paymentDTO.setCreditId(payment.getCredit().getId());
        return paymentDTO;
    }

    @Transactional
    public List<Payment> executeCustomQuery(String queryJson) throws JsonProcessingException {
        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode rootNode = objectMapper.readTree(queryJson);
        JsonNode queryNode = rootNode.get("query");

        if (queryNode == null) {
            throw new IllegalArgumentException("JSON должен содержать элемент 'query'.");
        }

        String query = queryNode.asText();
        String testQuery = query.toLowerCase();

        // Базовая проверка FROM client
        if (!testQuery.contains("select * from payment")) {
            throw new IllegalArgumentException("Запрос должен содержать SELECT * FROM payment.");
        }

        // Проверка на запрещённые выражения для безопасности
        if (testQuery.contains("join") || testQuery.contains("group by") || testQuery.contains(";") || testQuery.contains(",")) {
            throw new IllegalArgumentException("JOIN, GROUP BY и использование ';' и ',' не разрешены.");
        }

        String sql = "SELECT p.payment_id, p.amount, p.commission, p.payment_date, p.payment_type, p.credit_id FROM payment p " + query.substring(query.indexOf("FROM payment") + "FROM payment".length());

        Query nativeQuery = entityManager.createNativeQuery(sql);
        List<Object[]> queryResult = nativeQuery.getResultList();

        return queryResult.stream().map(obj -> {
            Credit credit = creditRepository.findById(((Number) obj[5]).longValue())
                    .orElseThrow(() -> new RuntimeException("Credit not found"));
            return new Payment(
                    ((Number) obj[0]).longValue(),
                    (Long) obj[1],
                    (Long) obj[2],
                    (Date) obj[3],
                    (String) obj[4],
                    credit
            );
        }).collect(Collectors.toList());
    }
}