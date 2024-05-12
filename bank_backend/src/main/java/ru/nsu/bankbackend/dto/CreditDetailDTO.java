package ru.nsu.bankbackend.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class CreditDetailDTO {
    private Long id;
    private Long clientId;
    private String clientName;
    private Long tariffId;
    private String tariffName;
    private Double amount;
    private String status;
    private LocalDate startDate;
    private LocalDate endDate;
    private Double mandatoryPaymentAmount;
    private LocalDate mandatoryPaymentDate;
    private Double mandatoryPenalty;
}
