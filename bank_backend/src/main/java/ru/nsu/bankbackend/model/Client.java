package ru.nsu.bankbackend.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;

import java.util.Date;

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

    public Client(Long id, Date birthDate, String email, String name, String passportData, String phone) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.passportData = passportData;
        this.birthDate = birthDate;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getPassportData() {
        return passportData;
    }

    public void setPassportData(String passportData) {
        this.passportData = passportData;
    }

    public Date getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(Date birthDate) {
        this.birthDate = birthDate;
    }
}