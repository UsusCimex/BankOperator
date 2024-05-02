package ru.nsu.bankbackend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import ru.nsu.bankbackend.cpecification.ClientSpecification;
import ru.nsu.bankbackend.model.Client;
import ru.nsu.bankbackend.model.Credit;
import ru.nsu.bankbackend.repository.ClientRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.lang.reflect.InvocationTargetException;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ClientService {
    @Autowired
    private ClientRepository clientRepository;
    @PersistenceContext
    private EntityManager entityManager;

    @Transactional
    public List<Client> findWithFilters(String name, String email, String phone, String passport, Date birthDate, String creditStatus, Boolean hasCredit, Boolean hasBlock) {
        Specification<Client> spec = Specification.where(null);

        if (name != null) {
            spec = spec.and(ClientSpecification.hasNameLike(name));
        }
        if (email != null) {
            spec = spec.and(ClientSpecification.hasEmailLike(email));
        }
        if (phone != null) {
            spec = spec.and(ClientSpecification.hasPhoneLike(phone));
        }
        if (passport != null) {
            spec = spec.and(ClientSpecification.hasPassportLike(passport));
        }
        if (birthDate != null) {
            spec = spec.and(ClientSpecification.hasBirthdate(birthDate));
        }
        if (creditStatus != null) {
            spec = spec.and(ClientSpecification.hasCreditStatus(Credit.convertStringToStatus(creditStatus)));
        }
        if (hasCredit != null) {
            spec = spec.and(ClientSpecification.hasCredit(hasCredit));
        }
        if (hasBlock != null) {
            spec = spec.and(ClientSpecification.hasBlock(hasBlock));
        }

        return clientRepository.findAll(spec);
    }

    public Optional<Client> findById(Long id) {
        return clientRepository.findById(id);
    }

    public Client save(Client client) {
        return clientRepository.save(client);
    }

    public void deleteById(Long id) throws Exception {
        clientRepository.findById(id)
                .map(client -> {
                    clientRepository.deleteById(client.getId());
                    return 1;
                })
                .orElseThrow(() -> new Exception("Клиент не найден."));
    }

    public Client update(Long id, Client clientDetail) throws Exception {
        return clientRepository.findById(id)
                .map(existingClient -> {
                    existingClient.setBirthDate(clientDetail.getBirthDate());
                    existingClient.setName(clientDetail.getName());
                    existingClient.setEmail(clientDetail.getEmail());
                    existingClient.setPhone(clientDetail.getPhone());
                    existingClient.setPassportData(clientDetail.getPassportData());
                    return clientRepository.save(existingClient);
                })
                .orElseThrow(() -> new Exception("Клиент не найден."));
    }

    // Весьма опасненько...
    @Transactional
    public List<Client> executeCustomQuery(String queryJson) throws JsonProcessingException, NoSuchMethodException, InvocationTargetException, InstantiationException, IllegalAccessException {
        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode rootNode = objectMapper.readTree(queryJson);
        JsonNode queryNode = rootNode.get("query");

        if (queryNode == null) {
            throw new IllegalArgumentException("JSON должен содержать элемент 'query'.");
        }

        String query = queryNode.asText();
        String testQuery = query.toLowerCase();

        // Базовая проверка FROM client
        if (!testQuery.contains("select * from client")) {
            throw new IllegalArgumentException("Запрос должен содержать SELECT * FROM client.");
        }

        // Проверка на запрещённые выражения для безопасности
        if (testQuery.contains("join") || testQuery.contains("group by") || testQuery.contains(";") || testQuery.contains(",")) {
            throw new IllegalArgumentException("JOIN, GROUP BY и использование ';' и ',' не разрешены.");
        }

        String modifiedQuery = "SELECT c.client_id, c.name, c.email, c.phone, c.passport_data, c.birth_date FROM client c " + query.substring(query.indexOf("FROM client") + "FROM client".length());

        Query nativeQuery = entityManager.createNativeQuery(modifiedQuery);
        List<Object[]> queryResult = nativeQuery.getResultList();

        return queryResult.stream().map(obj ->
            new Client(
                    ((Number) obj[0]).longValue(), // ID
                    (String) obj[1],               // name
                    (String) obj[2],               // email
                    (String) obj[3],               // phone
                    (String) obj[4],               // passport_data
                    (Date) obj[5]                  // birth_date
            )
        ).collect(Collectors.toList());
    }
}