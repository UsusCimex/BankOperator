package ru.nsu.bankbackend.model;

import jakarta.persistence.*;

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

    @Column(name = "amount", nullable = false)
    private Long amount; // Сумма кредита
    @Column(name = "status", nullable = false)
    private String status; // "Active", "Closed", "Expired"

    @Column(name = "start_date")
    private Date startDate;

    @Column(name = "end_date")
    private Date endDate;

    public Credit(Long id, Long amount, Date startDate, Date endDate, String status, Client client, Tariff tariff) {
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
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