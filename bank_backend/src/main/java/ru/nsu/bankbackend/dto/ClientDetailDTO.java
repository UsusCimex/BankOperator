package ru.nsu.bankbackend.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class ClientDetailDTO {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String passportData;
    private LocalDate birthDate;
    private Boolean isBlocked;
    private LocalDateTime blockEndDate;
    private String creditStatus;
}
