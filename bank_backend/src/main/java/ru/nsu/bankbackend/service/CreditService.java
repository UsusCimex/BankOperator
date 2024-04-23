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

import java.util.Calendar;
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

        if (creditDetail.getAmount() > tariff.getMaxAmount()) {
            throw new IllegalArgumentException("Requested amount exceeds the maximum allowed by the tariff");
        }

        Credit credit = new Credit();
        credit.setClient(client);
        credit.setTariff(tariff);
        credit.setAmount(creditDetail.getAmount());
        credit.setStatus(Credit.convertStringToStatus(creditDetail.getStatus().name()));  // Преобразование статуса
        credit.setStartDate(creditDetail.getStartDate());
        credit.setEndDate(calculateEndDate(creditDetail.getStartDate(), tariff.getLoanTerm()));
        return creditRepository.save(credit);
    }

    @Transactional
    public Optional<Credit> update(Long id, Credit creditDetails) {
        return creditRepository.findById(id)
                .map(existingCredit -> {
                    Tariff tariff = tariffRepository.findById(creditDetails.getTariff().getId())
                            .orElseThrow(() -> new RuntimeException("Tariff not found"));

                    existingCredit.setClient(creditDetails.getClient());
                    existingCredit.setTariff(creditDetails.getTariff());
                    existingCredit.setAmount(creditDetails.getAmount());
                    existingCredit.setStatus(Credit.convertStringToStatus(creditDetails.getStatus().name()));  // Преобразование статуса
                    existingCredit.setStartDate(creditDetails.getStartDate());
                    existingCredit.setEndDate(calculateEndDate(creditDetails.getStartDate(), tariff.getLoanTerm()));
                    return creditRepository.save(existingCredit);
                });
    }


    private Date calculateEndDate(Date startDate, int loanTermMonths) {
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(startDate);
        calendar.add(Calendar.MONTH, loanTermMonths);
        return calendar.getTime();
    }

    public void deleteById(Long id) {
        creditRepository.deleteById(id);
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
        if (!testQuery.contains("select * from credit")) {
            throw new IllegalArgumentException("Запрос должен содержать SELECT * FROM credit.");
        }

        // Проверка на запрещённые выражения для безопасности
        if (testQuery.contains("join") || testQuery.contains("group by") || testQuery.contains(";") || testQuery.contains(",")) {
            throw new IllegalArgumentException("JOIN, GROUP BY и использование ';' и ',' не разрешены.");
        }

        System.out.println("Executing Query: " + query);

        String sql = "SELECT c.credit_id, c.amount, c.end_date, c.start_date, c.status, c.client_id, c.tarif_id FROM credits c WHERE " + query.substring(query.indexOf("FROM credit") + "FROM credit".length());

        Query nativeQuery = entityManager.createNativeQuery(sql);
        List<Object[]> queryResult = nativeQuery.getResultList();

        return queryResult.stream().map(obj -> {
            Client client = clientRepository.findById(((Number) obj[5]).longValue())
                    .orElseThrow(() -> new RuntimeException("Client not found"));
            Tariff tariff = tariffRepository.findById(((Number) obj[6]).longValue())
                    .orElseThrow(() -> new RuntimeException("Tariff not found"));
            return new Credit(
                    ((Number) obj[0]).longValue(),
                    (Long) obj[1],
                    (Date) obj[2],
                    (Date) obj[3],
                    Credit.convertStringToStatus((String) obj[4]),
                    client,
                    tariff
            );
        }).collect(Collectors.toList());
    }
}