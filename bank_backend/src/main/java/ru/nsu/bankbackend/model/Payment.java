package ru.nsu.bankbackend.model;

import jakarta.persistence.*;

import java.util.Date;

@Entity
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_id")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "credit_id", nullable = false)
    private Credit credit;
    @Column(name = "amount", nullable = false)
    private Long amount;
    @Column(name = "payment_date", nullable = false)
    private Date paymentDate;
    @Column(name = "payment_type", nullable = false)
    private String paymentType; // Тип платежа(Кредит, Наличка, Перевод)
    @Column(name = "commission")
    private Long commission;

    public Payment(Long id, Credit credit, Long amount, Date paymentDate, String paymentType, Long commission) {
        this.id = id;
        this.credit = credit;
        this.amount = amount;
        this.paymentDate = paymentDate;
        this.paymentType = paymentType;
        this.commission = commission;
    }

    public Payment() {

    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getId() {
        return id;
    }

    public Credit getCredit() {
        return credit;
    }

    public void setCredit(Credit credit) {
        this.credit = credit;
    }

    public Long getAmount() {
        return amount;
    }

    public void setAmount(Long amount) {
        this.amount = amount;
    }

    public Date getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(Date paymentDate) {
        this.paymentDate = paymentDate;
    }

    public String getPaymentType() {
        return paymentType;
    }

    public void setPaymentType(String paymentType) {
        this.paymentType = paymentType;
    }

    public Long getCommission() {
        return commission;
    }

    public void setCommission(Long commission) {
        this.commission = commission;
    }
}