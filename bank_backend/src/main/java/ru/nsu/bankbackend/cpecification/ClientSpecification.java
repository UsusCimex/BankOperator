package ru.nsu.bankbackend.cpecification;

import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;
import ru.nsu.bankbackend.model.Blockage;
import ru.nsu.bankbackend.model.Client;
import ru.nsu.bankbackend.model.Credit;

import java.util.Date;

public class ClientSpecification {
    public static Specification<Client> hasNameLike(String name) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.like(criteriaBuilder.lower(root.<String>get("name")), "%" + name.toLowerCase() + "%");
    }

    public static Specification<Client> hasEmailLike(String email) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.like(criteriaBuilder.lower(root.<String>get("email")), "%" + email.toLowerCase() + "%");
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
            // Подзапрос для получения максимального id кредита каждого клиента
            Subquery<Long> subquery = query.subquery(Long.class);
            Root<Credit> creditSubRoot = subquery.from(Credit.class);
            subquery.select(criteriaBuilder.greatest(creditSubRoot.<Long>get("id")))
                    .where(criteriaBuilder.equal(creditSubRoot.get("client").get("id"), root.get("id")));

            // Основной запрос, присоединяем список кредитов
            Join<Client, Credit> creditClientJoin = root.join("credits", JoinType.INNER);

            // Условие, сравнивающее id кредитов с максимальным id и проверяющее статус
            Predicate statusPredicate = criteriaBuilder.equal(creditClientJoin.get("status"), creditStatus);
            Predicate idPredicate = criteriaBuilder.equal(creditClientJoin.get("id"), subquery);

            return criteriaBuilder.and(statusPredicate, idPredicate);
        };
    }


    public static Specification<Client> hasCredit(Boolean status) {
        if (status) {
            return (root, query, criteriaBuilder) ->
                    criteriaBuilder.greaterThan(criteriaBuilder.size(root.get("credits")), 0);
        }
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(criteriaBuilder.size(root.get("credits")), 0);
    }


    public static Specification<Client> hasBlock(Boolean status) {
        return (Root<Client> root, CriteriaQuery<?> query, CriteriaBuilder criteriaBuilder) -> {
            if (status) {
                // Создаем LEFT JOIN к Blockage
                Join<Client, Blockage> blockageJoin = root.join("blockage", JoinType.LEFT);
                // Проверяем, что Blockage существует и endDate больше текущей даты
                return criteriaBuilder.and(
                        criteriaBuilder.isNotNull(blockageJoin.get("id")),
                        criteriaBuilder.greaterThanOrEqualTo(blockageJoin.get("endDate"), new Date())
                );
            } else {
                // Если блокировка не должна быть активной, проверяем отсутствие Blockage или истечение срока блокировки
                Join<Client, Blockage> blockageJoin = root.join("blockage", JoinType.LEFT);
                return criteriaBuilder.or(
                        criteriaBuilder.isNull(blockageJoin.get("id")),
                        criteriaBuilder.lessThanOrEqualTo(blockageJoin.get("endDate"), new Date())
                );
            }
        };
    }
}