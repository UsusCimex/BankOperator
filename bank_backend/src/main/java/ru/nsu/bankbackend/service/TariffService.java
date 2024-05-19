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
import ru.nsu.bankbackend.cpecification.TariffSpecification;
import ru.nsu.bankbackend.model.Tariff;
import ru.nsu.bankbackend.repository.TariffRepository;

import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class TariffService {
    private final TariffRepository tariffRepository;
    @PersistenceContext
    private EntityManager entityManager;

    @Transactional
    public Page<Tariff> findAll(PageRequest pageRequest) {
        return tariffRepository.findAll(pageRequest);
    }

    @Transactional
    public Page<Tariff> findWithFilters(PageRequest pageRequest, String name, Long loanTerm, Long interestRate, Long maxAmount) {
        Specification<Tariff> spec = Specification.where(null);

        if (name != null) {
            spec = spec.and(TariffSpecification.hasNameLike(name));
        }
        if (loanTerm != null) {
            spec = spec.and(TariffSpecification.hasLoanTermEqualTo(loanTerm));
        }
        if (interestRate != null) {
            spec = spec.and(TariffSpecification.hasInterestRateEqualTo(interestRate));
        }
        if (maxAmount != null) {
            spec = spec.and(TariffSpecification.hasMaxAmountEqualTo(maxAmount));
        }

        return tariffRepository.findAll(spec, pageRequest);
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

        String modifiedQuery = "SELECT t FROM Tariff t " + query.substring(query.indexOf("FROM tariff") + "FROM tariff".length());

        TypedQuery<Tariff> nativeQuery = entityManager.createQuery(modifiedQuery, Tariff.class);
        List<Tariff> queryResult = nativeQuery.getResultList();

        return queryResult;
    }
}