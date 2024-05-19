package ru.nsu.bankbackend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.nsu.bankbackend.service.CustomQueryService;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/custom")
public class CustomQueryController {

    @Autowired
    private CustomQueryService customQueryService;

    @PostMapping("/query")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> executeCustomQuery(@RequestBody String queryJson) {
        try {
            Map<String, Object> result = customQueryService.execute(queryJson);
            result.put("message", "Запрос выполнен успешно.");
            return ResponseEntity.ok().body(result);
        } catch (Exception e) {
            Map<String, String> errorMap = new HashMap<>();
            errorMap.put("error", e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorMap);
        }
    }
}
