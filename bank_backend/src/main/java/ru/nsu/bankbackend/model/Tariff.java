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

    @NotNull
    @Column(name = "name", unique = true)
    private String name;

    @Positive
    @NotNull
    @Column(name = "loan_term")
    private Integer loanTerm; // Срок кредитования в месяцах

    @PositiveOrZero
    @NotNull
    @Column(name = "interest_rate")
    private Double interestRate; // Процентная ставка по тарифу

    @Positive
    @NotNull
    @Column(name = "max_amount")
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