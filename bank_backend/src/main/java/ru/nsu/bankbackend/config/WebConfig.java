package ru.nsu.bankbackend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class WebConfig {
    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true); // Разрешить отправку учетных данных
        // Явно указываем источники или используем шаблоны
        config.addAllowedOriginPattern("http://localhost:[*]"); // Для разработки
        config.addAllowedOriginPattern("https://*.example.com"); // Для продакшена
        config.addAllowedMethod("*"); // Разрешить все методы HTTP
        config.addAllowedHeader("*"); // Разрешить все заголовки
        source.registerCorsConfiguration("/**", config); // Применить настройки ко всем путям
        return new CorsFilter(source);
    }
}
