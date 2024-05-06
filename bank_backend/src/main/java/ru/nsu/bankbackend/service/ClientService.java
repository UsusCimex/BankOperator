package ru.nsu.bankbackend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import ru.nsu.bankbackend.cpecification.ClientSpecification;
import ru.nsu.bankbackend.dto.ClientDetailDTO;
import ru.nsu.bankbackend.model.Blockage;
import ru.nsu.bankbackend.model.Client;
import ru.nsu.bankbackend.model.Credit;
import ru.nsu.bankbackend.repository.BlockageRepository;
import ru.nsu.bankbackend.repository.ClientRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.lang.reflect.InvocationTargetException;
import java.util.*;

@Service
public class ClientService {
    @Autowired
    private ClientRepository clientRepository;
    @Autowired
    private BlockageRepository blockageRepository;
    @PersistenceContext
    private EntityManager entityManager;

    private ClientDetailDTO convertToDTO(Client client) {
        ClientDetailDTO dto = new ClientDetailDTO();
        dto.setId(client.getId());
        dto.setName(client.getName());
        dto.setEmail(client.getEmail());
        dto.setPhone(client.getPhone());
        dto.setPassportData(client.getPassportData());
        dto.setBirthDate(client.getBirthDate());

        // Проверка и установка статуса блокировки
        if (client.getBlockage() != null && client.getBlockage().getEndDate().after(new Date())) {
            dto.setIsBlocked(true);
            dto.setBlockEndDate(client.getBlockage().getEndDate());
        } else {
            dto.setIsBlocked(false);
        }

        if (client.getCredits() != null && !client.getCredits().isEmpty()) {
            Credit latestCredit = client.getCredits().stream()
                    .max(Comparator.comparing(Credit::getStartDate))
                    .orElse(null);

            dto.setCreditStatus(latestCredit.getStatus().toString());
        } else {
            dto.setCreditStatus("N/A");
        }

        return dto;
    }

    @Transactional
    public Page<ClientDetailDTO> findAll(PageRequest pageRequest) {
        return clientRepository.findAll(pageRequest).map(this::convertToDTO);
    }

    @Transactional
    public Page<ClientDetailDTO> findWithFilters(PageRequest pageRequest, String name, String email, String phone, String passport, Date birthDate, String creditStatus, Boolean hasCredit, Boolean hasBlock) {
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
        return clientRepository.findAll(spec, pageRequest).map(this::convertToDTO);
    }

    @Transactional
    public Optional<ClientDetailDTO> findById(Long id) {
        return clientRepository.findById(id).map(this::convertToDTO);
    }

    @Transactional
    public ClientDetailDTO blockClient(Long clientId, Date endDate) {
        Client client = clientRepository.findById(clientId).orElseThrow(() -> new RuntimeException("Client not found"));
        Blockage blockage = new Blockage();
        blockage.setClient(client);
        blockage.setStartDate(new Date());
        blockage.setEndDate(endDate);
        client.setBlockage(blockage);
        return convertToDTO(clientRepository.save(client));
    }

    @Transactional
    public ClientDetailDTO unblockClient(Long clientId) {
        Client client = clientRepository.findById(clientId).orElseThrow(() -> new RuntimeException("Client not found"));
        if (client.getBlockage() != null) {
            Long blockageId = client.getBlockage().getId();
            client.setBlockage(null);
            clientRepository.save(client);
            blockageRepository.deleteById(blockageId);
        }
        return convertToDTO(client);
    }

    @Transactional
    public ClientDetailDTO save(Client client) {
        return convertToDTO(clientRepository.save(client));
    }

    @Transactional
    public void deleteById(Long id) throws Exception {
        clientRepository.findById(id)
                .map(client -> {
                    clientRepository.deleteById(client.getId());
                    return 1;
                })
                .orElseThrow(() -> new Exception("Клиент не найден."));
    }

    @Transactional
    public ClientDetailDTO update(Long id, Client clientDetail) throws Exception {
        return clientRepository.findById(id)
                .map(existingClient -> {
                    existingClient.setBirthDate(clientDetail.getBirthDate());
                    existingClient.setName(clientDetail.getName());
                    existingClient.setEmail(clientDetail.getEmail());
                    existingClient.setPhone(clientDetail.getPhone());
                    existingClient.setPassportData(clientDetail.getPassportData());
                    return convertToDTO(clientRepository.save(existingClient));
                })
                .orElseThrow(() -> new Exception("Клиент не найден."));
    }

    // Весьма опасненько...
    @Transactional
    public List<ClientDetailDTO> executeCustomQuery(String queryJson) throws JsonProcessingException, NoSuchMethodException, InvocationTargetException, InstantiationException, IllegalAccessException {
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

        String modifiedQuery = "SELECT c FROM Client c " + query.substring(query.indexOf("FROM client") + "FROM client".length());

        TypedQuery<Client> nativeQuery = entityManager.createQuery(modifiedQuery, Client.class);
        List<Client> queryResult = nativeQuery.getResultList();

        return queryResult.stream().map(this::convertToDTO).toList();
    }
}