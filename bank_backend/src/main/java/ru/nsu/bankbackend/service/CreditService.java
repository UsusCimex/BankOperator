package ru.nsu.bankbackend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ru.nsu.bankbackend.model.Client;
import ru.nsu.bankbackend.model.Credit;
import ru.nsu.bankbackend.repository.CreditRepository;

import java.util.List;
import java.util.Optional;

@Service
public class CreditService {

    @Autowired
    private CreditRepository creditRepository;

    public List<Credit> findAll() {
        return creditRepository.findAll();
    }

    public Optional<Credit> findById(Long id) {
        return creditRepository.findById(id);
    }

    public Credit save(Credit credit) {
        return creditRepository.save(credit);
    }

    public void deleteById(Long id) {
        creditRepository.deleteById(id);
    }

    public Optional<Credit> update(Long id, Credit creditDetails) {
        return creditRepository.findById(id)
                .map(existingCredit -> {
                    existingCredit.setClient(creditDetails.getClient());
                    existingCredit.setTariff(creditDetails.getTariff());
                    existingCredit.setAmount(creditDetails.getAmount());
                    existingCredit.setStatus(creditDetails.getStatus());
                    return creditRepository.save(existingCredit);
                });
    }
}