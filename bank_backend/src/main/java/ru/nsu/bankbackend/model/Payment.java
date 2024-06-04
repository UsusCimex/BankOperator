package ru.nsu.bankbackend.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_id")
    private Long id;

    @ManyToOne
    @NotNull
    @JoinColumn(name = "credit_id")
    private Credit credit;

    @NotNull
    @Column(name = "amount")
    private Double amount;

    @PastOrPresent
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm")
    @NotNull
    @Column(name = "payment_date")
    private LocalDateTime paymentDate;

    @NotNull
    @ManyToOne
    @JoinColumn(name = "payment_type_id", referencedColumnName = "payment_type_id")
    private PaymentType paymentType;
}