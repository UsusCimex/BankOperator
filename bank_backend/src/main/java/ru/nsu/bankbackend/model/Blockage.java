package ru.nsu.bankbackend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.Date;

@Data
@Entity
public class Blockage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "blockage_id")
    private Long id;

    @OneToOne
    @JoinColumn(name = "client_id")
    @NotNull
    private Client client;
    @Column(name = "start_date")
    @NotNull
    private Date startDate;
    @Column(name = "end_date")
    @NotNull
    private Date endDate;
}
