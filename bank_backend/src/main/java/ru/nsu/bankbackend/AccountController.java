package ru.nsu.bankbackend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    @Autowired
    private AccountService accountService;

    @PostMapping("/deposit/{username}")
    public ResponseEntity<?> deposit(@PathVariable String username, @RequestBody DepositRequest depositRequest) {
        accountService.deposit(username, depositRequest.getAmount());
        return ResponseEntity.ok("{}");
    }

    @PostMapping("/withdraw/{username}")
    public ResponseEntity<?> withdraw(@PathVariable String username, @RequestBody DepositRequest depositRequest) {
        accountService.withdraw(username, depositRequest.getAmount());
        return ResponseEntity.ok("{}");
    }
}