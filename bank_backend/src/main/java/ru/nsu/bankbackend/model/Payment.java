package ru.nsu.bankbackend.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import lombok.Data;

import java.util.Date;

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
    private Long amount;

    @PastOrPresent
    @JsonFormat(pattern="yyyy-MM-dd'T'HH:mm")
    @NotNull
    @Column(name = "payment_date")
    private Date paymentDate;

    @NotNull
    @Column(name = "payment_type")
    private String paymentType; // Тип платежа(Кредит, Наличка, Перевод)

    @Column(name = "commission")
    private Long commission;

    public Payment() {}

    public Payment(Long id, Long amount, Long commission, Date paymentDate, String paymentType, Credit credit) {
        this.id = id;
        this.credit = credit;
        this.amount = amount;
        this.paymentDate = paymentDate;
        this.paymentType = paymentType;
        this.commission = commission;
    }
}