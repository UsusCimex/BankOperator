package ru.nsu.bankbackend.dto;

import lombok.Data;

import java.util.Date;

@Data
public class PaymentDetailDTO {
    private Long id;
    private String clientName;
    private String tariffName;
    private Long amount;
    private Date paymentDate;
    private String paymentType;
    private Long commission;
}
