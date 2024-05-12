package ru.nsu.bankbackend.cpecification;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;
import ru.nsu.bankbackend.model.Client;
import ru.nsu.bankbackend.model.Payment;

import java.util.Date;

public class PaymentSpecification {

    public static Specification<Payment> hasClientNameLike(String clientName) {
        return (root, query, criteriaBuilder) -> {
            Join<Payment, Client> creditJoin = root.join("credit", JoinType.LEFT);
            Join<Payment, Client> clientJoin = creditJoin.join("client", JoinType.LEFT);
            return criteriaBuilder.like(criteriaBuilder.lower(clientJoin.get("name")), "%" + clientName.toLowerCase() + "%");
        };
    }

    public static Specification<Payment> hasAmountEqualTo(Long amount) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(root.get("amount"), amount);
    }

    public static Specification<Payment> hasPaymentDateOn(Date paymentDate) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(root.get("paymentDate"), paymentDate);
    }

    public static Specification<Payment> hasCommissionEqualTo(Long commission) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(root.get("commission"), commission);
    }
}
