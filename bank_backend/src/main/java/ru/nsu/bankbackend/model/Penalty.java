package ru.nsu.bankbackend.model;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
public class Penalty {
    @Id
    @Column(name = "penalty_id")
    private Long id;

    @Column(name = "amount")
    private Double amount;

    @OneToOne(mappedBy = "penalty", fetch = FetchType.EAGER)
    private MandatoryPayment mandatoryPayment;
}
