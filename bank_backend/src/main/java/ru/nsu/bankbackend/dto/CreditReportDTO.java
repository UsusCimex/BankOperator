package ru.nsu.bankbackend.dto;


import lombok.Data;

@Data
public class CreditReportDTO {
    private String period;
    private Double totalIssued;
    private Double totalReturned;
    private Double overduePercentage;
    private Double profitability;
}