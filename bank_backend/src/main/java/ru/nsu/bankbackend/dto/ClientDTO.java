package ru.nsu.bankbackend.dto;

public class ClientDTO {
    private Long id;
    private String birthDate;
    private String passportData;
    private String name;

    public ClientDTO(Long id, String birthDate, String passportData, String name) {
        this.id = id;
        this.birthDate = birthDate;
        this.passportData = passportData;
        this.name = name;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(String birthDate) {
        this.birthDate = birthDate;
    }

    public String getPassportData() {
        return passportData;
    }

    public void setPassportData(String passportData) {
        this.passportData = passportData;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
