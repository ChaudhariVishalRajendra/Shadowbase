package com.infotact.shadowbase.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CorsConfig - Global Cross-Origin Resource Sharing (CORS) Configuration
 * 
 * Why this class exists:
 * In modern full-stack web applications, the frontend (React on port 5173) and 
 * backend (Spring Boot on port 8080) run on different ports (origins).
 * Browsers block requests between different origins for security.
 * This configuration explicitly permits our React Vite frontend to access backend REST APIs.
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173", "http://127.0.0.1:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}

