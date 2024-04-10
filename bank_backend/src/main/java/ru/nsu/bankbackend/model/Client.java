package ru.nsu.bankbackend.model;

import jakarta.persistence.*;

import java.util.Date;

@Entity
public class Client {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "client_id")
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;
    @Column(name = "contact_info")
    private String contactInfo; // JSON
    @Column(name = "passport_data", nullable = false)
    private String passportData;
    @Column(name = "birth_date", nullable = false)
    private Date birthDate;

    public Client() {}

    public Client(Long id, Date birthDate, String contactInfo, String name, String passportData) {
        this.id = id;
        this.name = name;
        this.contactInfo = contactInfo;
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

    public String getContactInfo() {
        return contactInfo;
    }

    public void setContactInfo(String contactInfo) {
        this.contactInfo = contactInfo;
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