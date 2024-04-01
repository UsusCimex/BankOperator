package ru.nsu.bankbackend.model;

import jakarta.persistence.*;

import java.util.Date;

@Entity
public class Blockage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "blockage_id")
    private Long id;

    @OneToOne
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;
    @Column(name = "start_date", nullable = false)
    private Date startDate;
    @Column(name = "end_date", nullable = false)
    private Date endDate;


    public void setId(Long id) {
        this.id = id;
    }

    public Long getId() {
        return id;
    }
}
