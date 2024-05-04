package ru.nsu.bankbackend.cpecification;

import jakarta.persistence.criteria.Join;
import org.springframework.data.jpa.domain.Specification;
import ru.nsu.bankbackend.model.Client;
import ru.nsu.bankbackend.model.Credit;

import java.util.Date;

public class CreditSpecification {
    public static Specification<Credit> hasClientNameLike(String name) {
        return (root, query, criteriaBuilder) -> {
            Join<Credit, Client> clientJoin = root.join("client");
            return criteriaBuilder.like(clientJoin.get("name"), "%" + name + "%");
        };
    }

    public static Specification<Credit> hasTariffNameLike(String tariffName) {
        return (root, query, criteriaBuilder) -> {
            Join<Credit, Client> tariffJoin = root.join("tariff");
            return criteriaBuilder.like(tariffJoin.get("name"), "%" + tariffName + "%");
        };
    }

    public static Specification<Credit> hasAmount(Long amount) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(root.get("amount"), amount);
    }

    public static Specification<Credit> hasStatus(Credit.Status status) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(root.get("status"), status);
    }

    public static Specification<Credit> hasStartDateAfter(Date startDate) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.greaterThanOrEqualTo(root.get("startDate"), startDate);
    }

    public static Specification<Credit> hasEndDateBefore(Date endDate) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.lessThanOrEqualTo(root.get("endDate"), endDate);
    }
}