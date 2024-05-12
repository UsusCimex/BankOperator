package ru.nsu.bankbackend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import ru.nsu.bankbackend.cpecification.CreditSpecification;
import ru.nsu.bankbackend.dto.CreditDTO;
import ru.nsu.bankbackend.dto.CreditDetailDTO;
import ru.nsu.bankbackend.model.Client;
import ru.nsu.bankbackend.model.Credit;
import ru.nsu.bankbackend.model.MandatoryPayment;
import ru.nsu.bankbackend.model.Tariff;
import ru.nsu.bankbackend.repository.ClientRepository;
import ru.nsu.bankbackend.repository.CreditRepository;
import ru.nsu.bankbackend.repository.MandatoryPaymentRepository;
import ru.nsu.bankbackend.repository.TariffRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
public class CreditService {
    @Autowired
    private CreditRepository creditRepository;
    @Autowired
    private ClientRepository clientRepository;
    @Autowired
    private TariffRepository tariffRepository;
    @Autowired
    private MandatoryPaymentRepository mandatoryPaymentRepository;

    @PersistenceContext
    private EntityManager entityManager;

    private CreditDetailDTO convertToCreditDetailDTO(Credit credit) {
        CreditDetailDTO dto = new CreditDetailDTO();
        dto.setId(credit.getId());
        dto.setAmount(credit.getAmount());
        dto.setStatus(credit.getStatus().toString());
        dto.setStartDate(credit.getStartDate());
        dto.setEndDate(credit.getEndDate());
        dto.setClientId(credit.getClient().getId());
        dto.setClientName(credit.getClient().getName());
        dto.setTariffId(credit.getTariff().getId());
        dto.setTariffName(credit.getTariff().getName());
        dto.setMandatoryPaymentAmount(credit.getMandatoryPayment().getAmount());
        dto.setMandatoryPaymentDate(credit.getMandatoryPayment().getDueDate());
        return dto;
    }

    public Credit mapToCredit(CreditDTO creditDTO) {
        Client client = clientRepository.findById(creditDTO.getClientId())
                .orElseThrow(() -> new RuntimeException("Client not found"));
        Tariff tariff = tariffRepository.findById(creditDTO.getTariffId())
                .orElseThrow(() -> new RuntimeException("Tariff not found"));

        Credit credit = new Credit();
        credit.setId(creditDTO.getId());
        credit.setAmount(creditDTO.getAmount());
        credit.setStartDate(creditDTO.getStartDate());
        credit.setEndDate(creditDTO.getStartDate().plusMonths(tariff.getLoanTerm()));
        credit.setStatus(creditDTO.getStatus());
        credit.setClient(client);
        credit.setTariff(tariff);
        return credit;
    }

    @Transactional
    public Page<CreditDetailDTO> findAll(PageRequest pageRequest) {
        return creditRepository.findAll(pageRequest).map(this::convertToCreditDetailDTO);
    }

    @Transactional
    public Page<CreditDetailDTO> findWithFilters(PageRequest pageRequest, String clientName, String tariffName, Long amount, String status, Date startDate, Date endDate) {
        Specification<Credit> spec = Specification.where(null);

        if (clientName != null) {
            spec = spec.and(CreditSpecification.hasClientNameLike(clientName));
        }
        if (tariffName != null) {
            spec = spec.and(CreditSpecification.hasTariffNameLike(tariffName));
        }
        if (amount != null) {
            spec = spec.and(CreditSpecification.hasAmount(amount));
        }
        if (status != null) {
            spec = spec.and(CreditSpecification.hasStatus(Credit.convertStringToStatus(status)));
        }
        if (startDate != null) {
            spec = spec.and(CreditSpecification.hasStartDateAfter(startDate));
        }
        if (endDate != null) {
            spec = spec.and(CreditSpecification.hasEndDateBefore(endDate));
        }

        return creditRepository.findAll(spec, pageRequest).map(this::convertToCreditDetailDTO);
    }

    @Transactional
    public Optional<CreditDetailDTO> findById(Long id) {
        return creditRepository.findById(id).map(this::convertToCreditDetailDTO);
    }

    @Transactional
    public List<CreditDetailDTO> findByClientId(Long clientId) {
        return creditRepository.findByClientId(clientId).stream().map(this::convertToCreditDetailDTO).toList();
    }

    private void checkCredit(Credit credit) {
        if (credit.getAmount() > credit.getTariff().getMaxAmount()) {
            throw new IllegalArgumentException("Requested amount exceeds the maximum allowed by the Tariff");
        }

        List<Credit> currentCredits = creditRepository.findByClientId(credit.getClient().getId()).stream().toList();

        long activeOrExpiredCount = currentCredits.stream()
                .filter(c -> c.getStatus() == Credit.Status.ACTIVE || c.getStatus() == Credit.Status.EXPIRED)
                .count();

        if ((credit.getStatus() == Credit.Status.ACTIVE || credit.getStatus() == Credit.Status.EXPIRED) &&
                activeOrExpiredCount >= 1) {
            throw new IllegalStateException("Client cannot have more than one ACTIVE or EXPIRED credit.");
        }
    }

    public MandatoryPayment createInitialMandatoryPayment(Credit credit) {
        MandatoryPayment payment = new MandatoryPayment();
        Tariff tariff = credit.getTariff();
        payment.setCredit(credit);
        Double initialAmount = credit.getAmount() / tariff.getLoanTerm() + credit.getAmount() * tariff.getInterestRate() / 100.0;
        payment.setAmount(initialAmount);
        payment.setDueDate(credit.getStartDate().plusMonths(1));
        payment.setLoanTerm(tariff.getLoanTerm());
        return mandatoryPaymentRepository.save(payment);
    }

    @Transactional
    public CreditDetailDTO save(CreditDTO creditDetail) {
        Credit credit = mapToCredit(creditDetail);
        checkCredit(credit);
        Credit savedCredit = creditRepository.save(credit);
        createInitialMandatoryPayment(savedCredit);
        return convertToCreditDetailDTO(savedCredit);
    }

    @Transactional
    public CreditDetailDTO update(Long id, CreditDTO creditDetails) throws Exception {
        return creditRepository.findById(id)
                .map(existingCredit -> {
                    Credit credit = mapToCredit(creditDetails);
                    credit.setId(id);
                    checkCredit(credit);
                    return convertToCreditDetailDTO(creditRepository.save(credit));
                })
                .orElseThrow(() -> new Exception("Credit not found"));
    }

    @Transactional
    public void deleteById(Long id) {
        creditRepository.deleteById(id);
    }

    @Transactional
    public List<CreditDetailDTO> executeCustomQuery(String queryJson) throws JsonProcessingException {
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

        String modifiedQuery = "SELECT c FROM Credit c " + query.substring(query.indexOf("FROM credit") + "FROM credit".length());

        TypedQuery<Credit> nativeQuery = entityManager.createQuery(modifiedQuery, Credit.class);
        List<Credit> queryResult = nativeQuery.getResultList();

        return queryResult.stream().map(this::convertToCreditDetailDTO).toList();
    }
}