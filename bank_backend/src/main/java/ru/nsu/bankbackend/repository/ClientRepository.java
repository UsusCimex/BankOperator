package ru.nsu.bankbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.nsu.bankbackend.model.Client;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {
}