package ru.nsu.bankbackend.service;

import jakarta.transaction.Transactional;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ru.nsu.bankbackend.model.PaymentType;
import ru.nsu.bankbackend.repository.PaymentTypeRepository;

import java.util.List;
import java.util.Optional;

@Service
public class PaymentTypeService {
    @Autowired
    private PaymentTypeRepository paymentTypeRepository;

    @Transactional
    public List<PaymentType> getAllPaymentTypes() {
        return paymentTypeRepository.findAll();
    }

    @Transactional
    public Optional<PaymentType> getPaymentTypeById(Long id) {
        return paymentTypeRepository.findById(id);
    }

    @Transactional
    public PaymentType save(PaymentType paymentType) {
        return paymentTypeRepository.save(paymentType);
    }

    @Transactional
    public void delete(Long id) {
        paymentTypeRepository.deleteById(id);
    }
}
