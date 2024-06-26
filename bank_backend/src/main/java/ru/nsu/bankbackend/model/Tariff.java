package ru.nsu.bankbackend.model;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data
@Entity
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
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
}