package org.example.apibridge.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    @Value("${app.cors.allowed-origins:*}")
    private String allowedOrigins;

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                String[] originsArray = allowedOrigins.split(",");
                var mapping = registry.addMapping("/api/**")
                        .allowedMethods("GET","POST","PUT","DELETE","OPTIONS")
                        .allowedHeaders("*")
                        .exposedHeaders("Content-Disposition")
                        .allowCredentials(false) // set true only if you specifically need cookies/auth
                        .maxAge(3600);
                // If wildcard present use pattern to allow subdomains
                boolean wildcard = false;
                for (String o : originsArray) { if (o.trim().equals("*")) { wildcard = true; break; } }
                if (wildcard) {
                    mapping.allowedOriginPatterns("*");
                } else {
                    mapping.allowedOrigins(originsArray);
                }
            }
        };
    }
}
