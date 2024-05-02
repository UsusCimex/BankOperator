package ru.nsu.bankbackend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ru.nsu.bankbackend.model.Tariff;
import ru.nsu.bankbackend.repository.TariffRepository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TariffService {

    @Autowired
    private TariffRepository tariffRepository;
    @PersistenceContext
    private EntityManager entityManager;

    public List<Tariff> findAll() {
        return tariffRepository.findAll();
    }

    public Optional<Tariff> findById(Long id) {
        return tariffRepository.findById(id);
    }

    public Tariff save(Tariff tariff) {
        return tariffRepository.save(tariff);
    }

    public void deleteById(Long id) {
        tariffRepository.deleteById(id);
    }

    public Optional<Tariff> update(Long id, Tariff tariffDetail) {
        return tariffRepository.findById(id)
                .map(existingTariff -> {
                    existingTariff.setId(tariffDetail.getId());
                    existingTariff.setName(tariffDetail.getName());
                    existingTariff.setLoanTerm(tariffDetail.getLoanTerm());
                    existingTariff.setInterestRate(tariffDetail.getInterestRate());
                    existingTariff.setMaxAmount(tariffDetail.getMaxAmount());
                    return tariffRepository.save(existingTariff);
                });
    }

    @Transactional
    public List<Tariff> executeCustomQuery(String queryJson) throws JsonProcessingException {
        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode rootNode = objectMapper.readTree(queryJson);
        JsonNode queryNode = rootNode.get("query");

        if (queryNode == null) {
            throw new IllegalArgumentException("JSON должен содержать элемент 'query'.");
        }

        String query = queryNode.asText();
        String testQuery = query.toLowerCase();

        // Базовая проверка FROM client
        if (!testQuery.contains("select * from tariff")) {
            throw new IllegalArgumentException("Запрос должен содержать SELECT * FROM tariff.");
        }

        // Проверка на запрещённые выражения для безопасности
        if (testQuery.contains("join") || testQuery.contains("group by") || testQuery.contains(";") || testQuery.contains(",")) {
            throw new IllegalArgumentException("JOIN, GROUP BY и использование ';' и ',' не разрешены.");
        }

        String sql = "SELECT t.tariff_id, t.interest_rate, t.loan_term, t.max_amount, t.name FROM tariff t " + query.substring(query.indexOf("FROM tariff") + "FROM tariff".length());

        Query nativeQuery = entityManager.createNativeQuery(sql);
        List<Object[]> queryResult = nativeQuery.getResultList();

        return queryResult.stream().map(obj -> new Tariff(
                ((Number) obj[0]).longValue(),
                (Double) obj[1],
                (Integer) obj[2],
                (Long) obj[3],
                (String) obj[4]
        )).collect(Collectors.toList());
    }
}