package ru.nsu.bankbackend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data
@Entity
public class Tariff {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tariff_id")
    private Long id;

    @Column(name = "name")
    @NotNull
    private String name;
    @Positive
    @Column(name = "loan_term")
    @NotNull
    private Integer loanTerm; // Срок кредитования в месяцах
    @PositiveOrZero
    @Column(name = "interest_rate")
    @NotNull
    private Double interestRate; // Процентная ставка по тарифу
    @Positive
    @Column(name = "max_amount")
    @NotNull
    private Long maxAmount; // Максимальная сумма кредита

    public Tariff() {}

    public Tariff(Long id, Double interestRate, Integer loanTerm, Long maxAmount, String name) {
        this.id = id;
        this.name = name;
        this.loanTerm = loanTerm;
        this.interestRate = interestRate;
        this.maxAmount = maxAmount;
    }
}