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
import ru.nsu.bankbackend.model.Client;
import ru.nsu.bankbackend.model.Credit;
import ru.nsu.bankbackend.model.Tariff;
import ru.nsu.bankbackend.repository.ClientRepository;
import ru.nsu.bankbackend.repository.CreditRepository;
import ru.nsu.bankbackend.repository.TariffRepository;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CreditService {

    @Autowired
    private CreditRepository creditRepository;
    @Autowired
    private ClientRepository clientRepository;
    @Autowired
    private TariffRepository tariffRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public List<Credit> findAll() {
        return creditRepository.findAll();
    }

    public Optional<Credit> findById(Long id) {
        return creditRepository.findById(id);
    }

    @Transactional
    public Credit save(Credit creditDetail) {
        Client client = clientRepository.findById(creditDetail.getClient().getId())
                .orElseThrow(() -> new RuntimeException("Client not found"));
        Tariff tariff = tariffRepository.findById(creditDetail.getTariff().getId())
                .orElseThrow(() -> new RuntimeException("Tariff not found"));

        Credit credit = new Credit();
        credit.setClient(client);
        credit.setTariff(tariff);
        credit.setAmount(creditDetail.getAmount());
        credit.setStatus(creditDetail.getStatus());
        credit.setStartDate(creditDetail.getStartDate());
        credit.setEndDate(creditDetail.getEndDate());
        return creditRepository.save(credit);
    }

    public void deleteById(Long id) {
        creditRepository.deleteById(id);
    }

    public Optional<Credit> update(Long id, Credit creditDetails) {
        return creditRepository.findById(id)
                .map(existingCredit -> {
                    existingCredit.setClient(creditDetails.getClient());
                    existingCredit.setTariff(creditDetails.getTariff());
                    existingCredit.setAmount(creditDetails.getAmount());
                    existingCredit.setStatus(creditDetails.getStatus());
                    return creditRepository.save(existingCredit);
                });
    }

    @Transactional
    public List<Credit> executeCustomQuery(String queryJson) throws JsonProcessingException {
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
        if (!testQuery.contains("from credit")) {
            throw new IllegalArgumentException("Запрос должен содержать FROM credit.");
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
            Client client = clientRepository.findById((Long) obj[5])
                    .orElseThrow(() -> new RuntimeException("Client not found"));
            Tariff tariff = tariffRepository.findById((Long) obj[6])
                    .orElseThrow(() -> new RuntimeException("Tariff not found"));
            return new Credit(
                    ((Number) obj[0]).longValue(),
                    (Long) obj[1],
                    (Date) obj[2],
                    (Date) obj[3],
                    (String) obj[4],
                    client,
                    tariff
            );
        }).collect(Collectors.toList());
    }
}