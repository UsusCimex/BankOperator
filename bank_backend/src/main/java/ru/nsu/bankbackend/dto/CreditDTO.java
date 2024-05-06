package ru.nsu.bankbackend.dto;

import lombok.Data;
import ru.nsu.bankbackend.model.Credit;

import java.util.Date;

@Data
public class CreditDTO {
    private Long id;
    private Long clientId;
    private Long tariffId;
    private Long amount; // Сумма кредита
    private Credit.Status status;
    private Date startDate;
}
