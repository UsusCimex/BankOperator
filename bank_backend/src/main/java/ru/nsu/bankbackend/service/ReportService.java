package ru.nsu.bankbackend.service;

import lombok.AllArgsConstructor;
import ru.nsu.bankbackend.dto.CreditReportDTO;
import ru.nsu.bankbackend.model.Credit;
import ru.nsu.bankbackend.model.Payment;
import ru.nsu.bankbackend.repository.CreditRepository;
import ru.nsu.bankbackend.repository.PaymentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class ReportService {
    private final CreditRepository creditRepository;
    private final PaymentRepository paymentRepository;

    public List<CreditReportDTO> generateReport(LocalDate from, LocalDate to) {
        List<Credit> credits = creditRepository.findAllCreditsBetweenDates(from, to);
        List<Payment> payments = paymentRepository.findAllPaymentsBetweenDates(from.atStartOfDay(), to.plusDays(1).atStartOfDay());

        // Group credits and payments by day, month, and year
        Map<String, List<Credit>> creditsByDay = groupByPeriod(credits, Credit::getStartDate, "DAY");
        Map<String, List<Payment>> paymentsByDay = groupByPeriod(payments, payment -> payment.getPaymentDate().toLocalDate(), "DAY");
        Map<String, List<Credit>> creditsByMonth = groupByPeriod(credits, Credit::getStartDate, "MONTH");
        Map<String, List<Payment>> paymentsByMonth = groupByPeriod(payments, payment -> payment.getPaymentDate().toLocalDate(), "MONTH");
        Map<String, List<Credit>> creditsByYear = groupByPeriod(credits, Credit::getStartDate, "YEAR");
        Map<String, List<Payment>> paymentsByYear = groupByPeriod(payments, payment -> payment.getPaymentDate().toLocalDate(), "YEAR");

        // Generate report data for each period
        List<CreditReportDTO> reportData = new ArrayList<>();
        reportData.addAll(compileReports(creditsByDay, paymentsByDay, "Day"));
        reportData.addAll(compileReports(creditsByMonth, paymentsByMonth, "Month"));
        reportData.addAll(compileReports(creditsByYear, paymentsByYear, "Year"));

        return reportData;
    }

    private <T> Map<String, List<T>> groupByPeriod(List<T> items, Function<T, LocalDate> dateExtractor, String periodType) {
        Map<String, List<T>> grouped = items.stream().collect(Collectors.groupingBy(item -> {
            LocalDate date = dateExtractor.apply(item);
            return switch (periodType) {
                case "DAY" -> date.toString();
                case "MONTH" -> date.withDayOfMonth(1).toString().substring(0, 7);
                case "YEAR" -> String.valueOf(date.getYear());
                default -> date.toString();
            };
        }));
        return grouped;
    }

    private List<CreditReportDTO> compileReports(Map<String, List<Credit>> creditsPeriodMap,
                                                 Map<String, List<Payment>> paymentsPeriodMap,
                                                 String periodType) {
        return creditsPeriodMap.keySet().stream().map(period -> {
            List<Credit> credits = creditsPeriodMap.getOrDefault(period, Collections.emptyList());
            List<Payment> payments = paymentsPeriodMap.getOrDefault(period, Collections.emptyList());

            double totalIssued = credits.stream().mapToDouble(Credit::getAmount).sum();
            double totalReturned = payments.stream().mapToDouble(Payment::getAmount).sum();

            double overduePercentage = calculateOverduePercentage(credits);
            double profitabilityNow = calculateProfitability(credits, payments);

            CreditReportDTO dto = new CreditReportDTO();
            dto.setPeriod(periodType + ": " + period);
            dto.setTotalIssued(totalIssued);
            dto.setTotalReturned(totalReturned);
            dto.setOverduePercentage(overduePercentage);
            dto.setProfitability(profitabilityNow);

            return dto;
        }).collect(Collectors.toList());
    }

    private double calculateOverduePercentage(List<Credit> credits) {
        long totalCredits = credits.size();
        long overdueCredits = credits.stream()
                .filter(credit -> credit.getStatus() == Credit.Status.EXPIRED)
                .count();

        return totalCredits > 0 ? (double) overdueCredits / totalCredits * 100.0 : 0.0;
    }

    private double calculateProfitability(List<Credit> credits, List<Payment> payments) {
        double totalPayments = payments.stream().mapToDouble(Payment::getAmount).sum();
        double totalCreditsIssued = credits.stream().mapToDouble(Credit::getAmount).sum();

        return totalCreditsIssued > 0 ? totalPayments / totalCreditsIssued - 1.0 : 0.0;
    }
}
