package ru.nsu.bankbackend.service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomQueryService {

    @PersistenceContext
    private EntityManager entityManager;

    public List<?> execute(String query) {
        // Возможная валидация запроса
        return entityManager.createNativeQuery(query).getResultList();
    }
}