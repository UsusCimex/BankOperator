package ru.nsu.bankbackend.dto;

import lombok.Data;
import java.util.Date;

@Data
public class ClientDetailDTO {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String passportData;
    private Date birthDate;
    private Boolean isBlocked;
    private Date blockEndDate;
    private String creditStatus;
}
