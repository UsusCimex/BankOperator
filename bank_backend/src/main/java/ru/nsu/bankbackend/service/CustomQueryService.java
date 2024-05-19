package ru.nsu.bankbackend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CustomQueryService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Transactional
    public Map<String, Object> execute(String queryJson) {
        ObjectMapper objectMapper = new ObjectMapper();
        Map<String, Object> response = new HashMap<>();
        try {
            JsonNode jsonNode = objectMapper.readTree(queryJson);
            String query = jsonNode.get("query").asText();

            if (query.trim().toUpperCase().startsWith("SELECT")) {
                List<Map<String, Object>> result = jdbcTemplate.query(query, this::extractData);
                response.put("columns", result.get(0).get("columns"));
                result.remove(0);
                response.put("data", result);
            } else {
                int affectedRows = jdbcTemplate.update(query);
                response.put("affectedRows", affectedRows);
            }
        } catch (Exception e) {
            System.err.println(e.getMessage());
            response.put("error", "Failed to execute query: " + e.getMessage());
        }
        return response;
    }

    private List<Map<String, Object>> extractData(ResultSet rs) throws SQLException {
        List<Map<String, Object>> result = new ArrayList<>();
        int columnCount = rs.getMetaData().getColumnCount();
        List<String> columns = new ArrayList<>();
        for (int i = 1; i <= columnCount; i++) {
            columns.add(rs.getMetaData().getColumnName(i));
        }
        result.add(Map.of("columns", columns));
        while (rs.next()) {
            Map<String, Object> row = new HashMap<>();
            for (String column : columns) {
                row.put(column, rs.getObject(column));
            }
            result.add(row);
        }
        return result;
    }
}
