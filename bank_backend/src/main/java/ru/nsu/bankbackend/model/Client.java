package ru.nsu.bankbackend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.Date;

@Data
@Entity
public class Client {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "client_id")
    private Long id;

    @NotBlank
    @Column(name = "name")
    private String name;

    @NotBlank
    @Email
    @Column(name = "email", unique = true)
    private String email;

    @Pattern(regexp = "\\+\\d{1,3}\\d{1,12}")
    @NotBlank
    @Column(name = "phone", unique = true)
    private String phone;

    @Pattern(regexp = "\\d{4}-\\d{6}")
    @NotBlank
    @Column(name = "passport_data", unique = true)
    private String passportData;

    @Past
    @JsonFormat(pattern="yyyy-MM-dd")
    @NotNull
    @Column(name = "birth_date")
    private Date birthDate;

    @OneToOne(mappedBy = "client")
    @JsonBackReference("client-blockage")
    private Blockage blockage;

    @OneToOne(mappedBy = "client")
    @JsonBackReference("client-credit")
    private Credit credit;

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