package ru.nsu.bankbackend.dto;

import lombok.Data;

import java.util.Date;

@Data
public class CreditDetailDTO {
    private Long id;
    private String clientName;
    private String tariffName;
    private Long amount;
    private String status;
    private Date startDate;
    private Date endDate;
}
