package ru.nsu.bankbackend.model;

import jakarta.persistence.*;

@Entity
public class Tariff {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tariff_id")
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;
    @Column(name = "loan_term", nullable = false)
    private Integer loanTerm; // Срок кредитования в месяцах
    @Column(name = "interest_rate", nullable = false)
    private Double interestRate; // Процентная ставка по тарифу
    @Column(name = "max_amount", nullable = false)
    private Long maxAmount; // Максимальная сумма кредита

    public Tariff(Long id, Double interestRate, Integer loanTerm, Long maxAmount, String name) {
        this.id = id;
        this.name = name;
        this.loanTerm = loanTerm;
        this.interestRate = interestRate;
        this.maxAmount = maxAmount;
    }

    public Tariff() {

    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getLoanTerm() {
        return loanTerm;
    }

    public void setLoanTerm(Integer loanTerm) {
        this.loanTerm = loanTerm;
    }

    public Double getInterestRate() {
        return interestRate;
    }

    public void setInterestRate(Double interestRate) {
        this.interestRate = interestRate;
    }

    public Long getMaxAmount() {
        return maxAmount;
    }

    public void setMaxAmount(Long maxAmount) {
        this.maxAmount = maxAmount;
    }
}