package ru.nsu.bankbackend.dto;

import lombok.Data;
import ru.nsu.bankbackend.model.Credit;

import java.time.LocalDate;

@Data
public class CreditDTO {
    private Long id;
    private Long clientId;
    private Long tariffId;
    private Double amount; // Сумма кредита
    private Credit.Status status;
    private LocalDate startDate;
}
