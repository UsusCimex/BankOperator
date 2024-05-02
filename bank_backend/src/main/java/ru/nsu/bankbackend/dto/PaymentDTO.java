package ru.nsu.bankbackend.dto;

import lombok.Data;

import java.util.Date;

@Data
public class PaymentDTO {
    private Long id;
    private Long creditId;
    private Long amount;
    private Date paymentDate;
    private String paymentType; // Тип платежа(Кредит, Наличка, Перевод)
    private Long commission;
}
