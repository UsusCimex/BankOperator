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
import ru.nsu.bankbackend.dto.CreditDTO;
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

    public List<Credit> findByClientId(Long clientId) {
        return creditRepository.findByClientId(clientId);
    }

    @Transactional
    public Credit save(CreditDTO creditDetail) {
        Client client = clientRepository.findById(creditDetail.getClientId())
                .orElseThrow(() -> new RuntimeException("Client not found"));
        Tariff tariff = tariffRepository.findById(creditDetail.getTariffId())
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
    public Optional<Credit> update(Long id, CreditDTO creditDetails) {
        return creditRepository.findById(id)
                .map(existingCredit -> {
                    Client client = clientRepository.findById(creditDetails.getClientId())
                            .orElseThrow(() -> new RuntimeException("Client not found"));
                    Tariff tariff = tariffRepository.findById(creditDetails.getTariffId())
                            .orElseThrow(() -> new RuntimeException("Tariff not found"));

                    if (creditDetails.getAmount() > tariff.getMaxAmount()) {
                        throw new IllegalArgumentException("Requested amount exceeds the maximum allowed by the tariff");
                    }

                    existingCredit.setClient(client);
                    existingCredit.setTariff(tariff);
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

    public CreditDTO mapToCreditDTO(Credit credit) {
        CreditDTO creditDTO = new CreditDTO();
        creditDTO.setId(credit.getId());
        creditDTO.setAmount(credit.getAmount());
        creditDTO.setClientId(credit.getClient().getId());
        creditDTO.setTariffId(credit.getTariff().getId());
        creditDTO.setStartDate(credit.getStartDate());
        creditDTO.setStatus(credit.getStatus());
        creditDTO.setEndDate(credit.getEndDate());
        return creditDTO;
    }

    public Credit mapToCredit(CreditDTO creditDTO) {
        Credit credit = new Credit();
        credit.setId(creditDTO.getId());
        credit.setAmount(creditDTO.getAmount());
        credit.setStartDate(creditDTO.getStartDate());
        credit.setEndDate(creditDTO.getEndDate());
        credit.setStatus(credit.getStatus());
        credit.setClient(clientRepository.findById(creditDTO.getClientId()).orElseThrow(() -> new RuntimeException("Client not found")));
        credit.setTariff(tariffRepository.findById(creditDTO.getTariffId()).orElseThrow(() -> new RuntimeException("Tariff not found")));
        return credit;
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

        // Базовая проверка FROM client
        if (!testQuery.contains("select * from credit")) {
            throw new IllegalArgumentException("Запрос должен содержать SELECT * FROM credit.");
        }

        // Проверка на запрещённые выражения для безопасности
        if (testQuery.contains("join") || testQuery.contains("group by") || testQuery.contains(";") || testQuery.contains(",")) {
            throw new IllegalArgumentException("JOIN, GROUP BY и использование ';' и ',' не разрешены.");
        }

        String sql = "SELECT c.credit_id, c.amount, c.end_date, c.start_date, c.status, c.client_id, c.tarif_id FROM credit c " + query.substring(query.indexOf("FROM credit") + "FROM credit".length());

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