package ru.nsu.bankbackend;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class AccountService {

    @Autowired
    private AccountRepository accountRepository;

    @Transactional
    public void deposit(String username, Long amount) {
        Account account = accountRepository.findByUsername(username)
                .orElseGet(() -> {
                    Account newAccount = new Account();
                    newAccount.setUsername(username);
                    newAccount.setBalance(0L); // Начальный баланс
                    return newAccount;
                });
        account.setBalance(account.getBalance() + amount);
        accountRepository.save(account);
    }

    @Transactional
    public void withdraw(String username, Long amount) {
        Account account = accountRepository.findByUsername(username)
                .orElseGet(() -> {
                    Account newAccount = new Account();
                    newAccount.setUsername(username);
                    newAccount.setBalance(0L); // Начальный баланс
                    return newAccount;
                });
        account.setBalance(account.getBalance() - amount);
        accountRepository.save(account);
    }
}
