package ru.nsu.bankbackend.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.util.Date;

@Data
@Entity
public class Credit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "credit_id")
    private Long id;

    @OneToOne
    @JsonManagedReference("client-credit")
    @NotNull
    @JoinColumn(name = "client_id", referencedColumnName = "client_id")
    private Client client;

    @ManyToOne
    @NotNull
    @JoinColumn(name = "tarif_id", referencedColumnName = "tariff_id")
    private Tariff tariff;

    @Positive
    @NotNull
    @Column(name = "amount")
    private Long amount; // Сумма кредита

    public enum Status {
        ACTIVE, CLOSED, EXPIRED
    }
    @Enumerated(EnumType.STRING)
    @NotNull
    @Column(name = "status")
    private Status status;

    @PastOrPresent
    @JsonFormat(pattern="yyyy-MM-dd'T'HH:mm")
    @Column(name = "start_date")
    private Date startDate;

    @JsonFormat(pattern="yyyy-MM-dd'T'HH:mm")
    @Column(name = "end_date")
    private Date endDate;

    public Credit() {}

    public Credit(Long id, Long amount, Date endDate, Date startDate, Status status, Client client, Tariff tariff) {
        this.id = id;
        this.client = client;
        this.tariff = tariff;
        this.amount = amount;
        this.status = status;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    public static Status convertStringToStatus(String statusStr) {
        try {
            return Status.valueOf(statusStr.toUpperCase());
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new IllegalArgumentException("Invalid status value: " + statusStr);
        }
    }
}