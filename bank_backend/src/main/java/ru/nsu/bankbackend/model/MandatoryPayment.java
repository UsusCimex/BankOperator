package ru.nsu.bankbackend.model;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Data
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
public class MandatoryPayment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "mandatory_payment_id")
    private Long id;

    @OneToOne
    @JoinColumn(name = "credit_id", referencedColumnName = "credit_id")
    private Credit credit;

    @Column(name = "amount")
    private Double amount;

    @Column(name = "loan_term")
    private Integer loanTerm;

    @OneToOne
    @JoinColumn(name = "penalty_id", referencedColumnName = "penalty_id")
    private Penalty penalty;

    @Column(name = "date")
    private LocalDate dueDate;
}
