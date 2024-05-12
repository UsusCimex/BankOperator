package ru.nsu.bankbackend.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PaymentDetailDTO {
    private Long id;
    private Long creditId;
    private String clientName;
    private String tariffName;
    private Double amount;
    private LocalDateTime paymentDate;
    private String paymentType;
    private Double commission;
}
