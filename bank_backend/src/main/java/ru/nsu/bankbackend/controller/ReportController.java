package ru.nsu.bankbackend.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.nsu.bankbackend.dto.CreditReportDTO;
import ru.nsu.bankbackend.service.ReportService;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/reports")
public class ReportController {
    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/credit")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<List<CreditReportDTO>> getCreditReport(
            @RequestParam(name = "from") LocalDate from,
            @RequestParam(name = "to") LocalDate to) {
        List<CreditReportDTO> report = reportService.generateReport(from, to);
        return ResponseEntity.ok(report);
    }
}