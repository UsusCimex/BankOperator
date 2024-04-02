package ru.nsu.bankbackend.service;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import ru.nsu.bankbackend.dto.ClientDTO;
import ru.nsu.bankbackend.model.Client;
import ru.nsu.bankbackend.repository.ClientRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.sql.Timestamp;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ClientService {

    @Autowired
    private ClientRepository clientRepository;
    @PersistenceContext
    private EntityManager entityManager;

    public List<Client> findAll() {
        return clientRepository.findAll();
    }

    public Optional<Client> findById(Long id) {
        return clientRepository.findById(id);
    }

    public Client save(Client client) {
        return clientRepository.save(client);
    }

    public void deleteById(Long id) {
        clientRepository.deleteById(id);
    }

    public Optional<Client> update(Long id, Client clientDetail) {
        return clientRepository.findById(id)
                .map(existingClient -> {
                    existingClient.setBirthDate(clientDetail.getBirthDate());
                    existingClient.setName(clientDetail.getName());
                    existingClient.setContactInfo(clientDetail.getContactInfo());
                    existingClient.setPassportData(clientDetail.getPassportData());
                    return clientRepository.save(existingClient);
                });
    }

    // Весьма опасненько...
    @Transactional
    public ResponseEntity<?> executeCustomQuery(String queryJson) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode rootNode = objectMapper.readTree(queryJson);
            JsonNode queryNode = rootNode.get("query");

            if (queryNode == null) {
                throw new IllegalArgumentException("JSON должен содержать элемент 'query'.");
            }

            String query = queryNode.asText().toLowerCase();
            System.out.println("Received query: " + query);

            // Базовая проверка FROM client
            if (!query.contains("from client")) {
                throw new IllegalArgumentException("Запрос должен содержать FROM client.");
            }

            // Проверка на запрещённые выражения для безопасности
            if (query.contains("join") || query.contains("group by") || query.contains(";")) {
                throw new IllegalArgumentException("JOIN, GROUP BY и использование ';' не разрешены.");
            }

            System.out.println("Executing Query: " + query);

            Query nativeQuery = entityManager.createNativeQuery(query);
            @SuppressWarnings("unchecked")
            List<Object[]> queryResult = nativeQuery.getResultList();

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

            List<ClientDTO> result = queryResult.stream().map(obj -> new ClientDTO(
                    ((Number) obj[0]).longValue(),
                    ((Timestamp) obj[1]).toLocalDateTime().format(formatter),
                    (String) obj[2],
                    (String) obj[3]
            )).collect(Collectors.toList());

            return ResponseEntity.ok(result); // Успешный ответ с данными
        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", e.getMessage())); // Ответ с сообщением об ошибке
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Внутренняя ошибка сервера: " + e.getMessage())); // Ответ с сообщением о внутренней ошибке
        }
    }

}