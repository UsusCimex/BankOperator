package ru.nsu.bankbackend.service;

import jakarta.transaction.Transactional;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import ru.nsu.bankbackend.model.Penalty;
import ru.nsu.bankbackend.repository.PenaltyRepository;

import java.util.List;
import java.util.Optional;

@Service
public class PenaltyService {
    @Autowired
    private PenaltyRepository penaltyRepository;

    @Transactional
    public List<Penalty> findAll() {
        return penaltyRepository.findAll();
    }

    @Transactional
    public Optional<Penalty> findById(Long id) {
        return penaltyRepository.findById(id);
    }

    @Transactional
    public Penalty save(Penalty penalty) {
        return penaltyRepository.save(penalty);
    }

    @Transactional
    public Penalty update(Penalty penalty) {
        return penaltyRepository.save(penalty);
    }

    @Transactional
    public void delete(Long id) {
        penaltyRepository.deleteById(id);
    }

    @Scheduled(cron = "0 0 0 * * ?")
    public void applyPenalties() {
        List<Penalty> penalties = penaltyRepository.findAll();

        for (Penalty penalty : penalties) {
            if (penalty.getAmount() > 0L) { // Если платеж не погашен
                penalty.setAmount(penalty.getAmount() * 1.1);
                penaltyRepository.save(penalty);
            } else {
                penaltyRepository.delete(penalty);
            }
        }
    }
}
