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

    public Payment save(Payment paymentDetail) {
        Credit credit = creditRepository.findById(paymentDetail.getCredit().getId())
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

    public Payment update(Long id, Payment paymentDetails) throws Exception {
        return paymentRepository.findById(id)
                .map(existingPayment -> {
                    existingPayment.setPaymentDate(paymentDetails.getPaymentDate());
                    existingPayment.setPaymentType(paymentDetails.getPaymentType());
                    existingPayment.setCommission(paymentDetails.getCommission());
                    existingPayment.setAmount(paymentDetails.getAmount());
                    existingPayment.setCredit(paymentDetails.getCredit());
                    return paymentRepository.save(existingPayment);
                })
                .orElseThrow(() -> new Exception("Клиент не найден."));
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
        System.out.println("Received query: " + query);

        // Базовая проверка FROM client
        if (!testQuery.contains("from payment")) {
            throw new IllegalArgumentException("Запрос должен содержать FROM payment.");
        }

        // Проверка на запрещённые выражения для безопасности
        if (testQuery.contains("join") || testQuery.contains("group by") || testQuery.contains(";") || testQuery.contains(",")) {
            throw new IllegalArgumentException("JOIN, GROUP BY и использование ';' и ',' не разрешены.");
        }

        System.out.println("Executing Query: " + query);

        Query nativeQuery = entityManager.createNativeQuery(query);
        @SuppressWarnings("unchecked")
        List<Object[]> queryResult = nativeQuery.getResultList();

        return queryResult.stream().map(obj -> {
            Credit credit = creditRepository.findById((Long) obj[1])
                    .orElseThrow(() -> new RuntimeException("Credit not found"));
            return new Payment(
                    ((Number) obj[0]).longValue(),
                    credit,
                    (Long) obj[2],
                    (Date) obj[3],
                    (String) obj[4],
                    (Long) obj[5]
            );
        }).collect(Collectors.toList());
    }
}