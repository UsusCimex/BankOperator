package ru.nsu.bankbackend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ru.nsu.bankbackend.model.Credit;
import ru.nsu.bankbackend.model.Tariff;
import ru.nsu.bankbackend.repository.TariffRepository;

import java.util.List;
import java.util.Optional;

@Service
public class TariffService {

    @Autowired
    private TariffRepository tariffRepository;

    public List<Tariff> findAll() {
        return tariffRepository.findAll();
    }

    public Optional<Tariff> findById(Long id) {
        return tariffRepository.findById(id);
    }

    public Tariff save(Tariff tariff) {
        return tariffRepository.save(tariff);
    }

    public void deleteById(Long id) {
        tariffRepository.deleteById(id);
    }

    public Optional<Tariff> update(Long id, Tariff tariffDetail) {
        return tariffRepository.findById(id)
                .map(existingTariff -> {
                    existingTariff.setId(tariffDetail.getId());
                    existingTariff.setName(tariffDetail.getName());
                    existingTariff.setLoanTerm(tariffDetail.getLoanTerm());
                    existingTariff.setInterestRate(tariffDetail.getInterestRate());
                    existingTariff.setMaxAmount(tariffDetail.getMaxAmount());
                    return tariffRepository.save(existingTariff);
                });
    }

}