package ru.nsu.bankbackend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.Date;

@Data
@Entity
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
public class Blockage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "blockage_id")
    private Long id;

    @OneToOne
    @NotNull
    @JoinColumn(name = "client_id")
    private Client client;

    @NotNull
    @Column(name = "start_date")
    private Date startDate;

    @NotNull
    @Column(name = "end_date")
    private Date endDate;
}
