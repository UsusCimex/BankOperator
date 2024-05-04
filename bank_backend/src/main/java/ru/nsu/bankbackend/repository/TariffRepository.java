package ru.nsu.bankbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import ru.nsu.bankbackend.model.Tariff;

@Repository
public interface TariffRepository extends JpaRepository<Tariff, Long>, JpaSpecificationExecutor<Tariff> {
}