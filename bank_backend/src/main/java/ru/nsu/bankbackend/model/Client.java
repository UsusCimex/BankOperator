package ru.nsu.bankbackend.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.Date;
import java.util.List;

@Data
@Entity
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
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

    @OneToOne(mappedBy = "client", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private Blockage blockage;

    @OneToMany(mappedBy = "client", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<Credit> credits;

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