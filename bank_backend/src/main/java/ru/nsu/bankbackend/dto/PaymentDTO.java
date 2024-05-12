package ru.nsu.bankbackend.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PaymentDTO {
    private Long id;
    private Long creditId;
    private Double amount;
    private LocalDateTime paymentDate;
    private Long paymentTypeId; // Тип платежа(Кредит, Наличка, Перевод)
}
