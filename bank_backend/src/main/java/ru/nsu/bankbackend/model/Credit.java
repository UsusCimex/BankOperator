package ru.nsu.bankbackend.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;

import java.util.Date;

@Entity
public class Credit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "credit_id")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "client_id", referencedColumnName = "client_id", nullable = false)
    private Client client;

    @ManyToOne
    @JoinColumn(name = "tarif_id", referencedColumnName = "tariff_id", nullable = false)
    private Tariff tariff;

    @Positive
    @Column(name = "amount", nullable = false)
    private Long amount; // Сумма кредита

    public enum Status {
        ACTIVE, CLOSED, EXPIRED
    }
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status;

    @PastOrPresent
    @JsonFormat(pattern="yyyy-MM-dd'T'HH:mm")
    @Column(name = "start_date")
    private Date startDate;

    @JsonFormat(pattern="yyyy-MM-dd'T'HH:mm")
    @Column(name = "end_date")
    private Date endDate;

    public Credit(Long id, Long amount, Date endDate, Date startDate, Status status, Client client, Tariff tariff) {
        this.id = id;
        this.client = client;
        this.tariff = tariff;
        this.amount = amount;
        this.status = status;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    public Credit() {

    }

    public static Status convertStringToStatus(String statusStr) {
        try {
            return Status.valueOf(statusStr.toUpperCase());
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new IllegalArgumentException("Invalid status value: " + statusStr);
        }
    }


    public void setId(Long id) {
        this.id = id;
    }

    public Long getId() {
        return id;
    }

    public Client getClient() {
        return client;
    }

    public void setClient(Client client) {
        this.client = client;
    }

    public Tariff getTariff() {
        return tariff;
    }

    public void setTariff(Tariff tariff) {
        this.tariff = tariff;
    }

    public Long getAmount() {
        return amount;
    }

    public void setAmount(Long amount) {
        this.amount = amount;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public Date getStartDate() {
        return startDate;
    }

    public void setStartDate(Date startDate) {
        this.startDate = startDate;
    }

    public Date getEndDate() {
        return endDate;
    }

    public void setEndDate(Date endDate) {
        this.endDate = endDate;
    }
}