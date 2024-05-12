package ru.nsu.bankbackend.cpecification;

import org.springframework.data.jpa.domain.Specification;
import ru.nsu.bankbackend.model.Tariff;

public class TariffSpecification {
    public static Specification<Tariff> hasNameLike(String name) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), "%" + name.toLowerCase() + "%");
    }

    public static Specification<Tariff> hasLoanTermEqualTo(Long loanTerm) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(root.get("loanTerm"), loanTerm);
    }

    public static Specification<Tariff> hasInterestRateEqualTo(Long interestRate) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(root.get("interestRate"), interestRate);
    }

    public static Specification<Tariff> hasMaxAmountEqualTo(Long maxAmount) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(root.get("maxAmount"), maxAmount);
    }
}
