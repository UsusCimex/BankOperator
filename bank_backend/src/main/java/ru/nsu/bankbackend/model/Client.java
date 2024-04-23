package ru.nsu.bankbackend.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.util.Date;

@Data
@Entity
public class Client {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "client_id")
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;
    @Email
    @Column(name = "email")
    private String email;
    @Pattern(regexp = "\\+\\d{1,3}\\d{1,12}")
    @Column(name = "phone")
    private String phone;
    @Pattern(regexp = "\\d{4}-\\d{6}")
    @Column(name = "passport_data", nullable = false)
    private String passportData;
    @Past
    @JsonFormat(pattern="yyyy-MM-dd")
    @Column(name = "birth_date", nullable = false)
    private Date birthDate;

    public Client() {}

    public Client(Long id, String name, String email, String phone, String passportData, Date birthDate) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.passportData = passportData;
        this.birthDate = birthDate;
    }
}