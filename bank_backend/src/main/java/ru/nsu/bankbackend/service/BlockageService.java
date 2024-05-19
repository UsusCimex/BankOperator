package ru.nsu.bankbackend.service;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import ru.nsu.bankbackend.model.Blockage;
import ru.nsu.bankbackend.repository.BlockageRepository;

import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class BlockageService {
    private final BlockageRepository blockageRepository;

    public List<Blockage> findAll() {
        return blockageRepository.findAll();
    }

    public Optional<Blockage> findById(Long id) {
        return blockageRepository.findById(id);
    }
    public Blockage save(Blockage blockage) {
        return blockageRepository.save(blockage);
    }
    public void deleteById(Long id) {
        blockageRepository.deleteById(id);
    }
}
