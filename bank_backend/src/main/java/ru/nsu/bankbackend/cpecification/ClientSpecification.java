package ru.nsu.bankbackend.cpecification;

import jakarta.persistence.criteria.Join;
import org.springframework.data.jpa.domain.Specification;
import ru.nsu.bankbackend.model.Client;
import ru.nsu.bankbackend.model.Credit;

import java.util.Date;

public class ClientSpecification {
    public static Specification<Client> hasNameLike(String name) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.like(root.<String>get("name"), "%" + name + "%");
    }

    public static Specification<Client> hasEmailLike(String email) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.like(root.<String>get("email"), "%" + email + "%");
    }

    public static Specification<Client> hasPhoneLike(String phone) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.like(root.<String>get("phone"), "%" + phone + "%");
    }

    public static Specification<Client> hasPassportLike(String passport) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.like(root.<String>get("passport_data"), "%" + passport + "%");
    }

    public static Specification<Client> hasBirthdate(Date birthdate) {
        return (root, query, criteriaBuilder) -> {
            if (birthdate != null) {
                return criteriaBuilder.equal(root.get("birthDate"), birthdate);  // Ensure this matches your entity field name
            } else {
                return criteriaBuilder.conjunction();
            }
        };
    }

    public static Specification<Client> hasCreditStatus(Credit.Status creditStatus) {
        return (root, query, criteriaBuilder) -> {
            Join<Credit, Client> creditClientJoin = root.join("credit");
            return criteriaBuilder.equal(creditClientJoin.get("status"), creditStatus);
        };
    }

    public static Specification<Client> hasCredit(Boolean status) {
        if (status) {
            return (root, query, criteriaBuilder) ->
                    criteriaBuilder.isNotNull(root.get("credit"));
        }
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.isNull(root.get("credit"));
    }

    public static Specification<Client> hasBlock(Boolean status) {
        if (status) {
            return (root, query, criteriaBuilder) ->
                    criteriaBuilder.isNotNull(root.get("blockage"));
        }
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.isNull(root.get("blockage"));
    }
}