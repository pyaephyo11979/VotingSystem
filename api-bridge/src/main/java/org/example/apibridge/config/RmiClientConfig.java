package org.example.apibridge.config;

import org.example.shared.VotingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.rmi.Naming;

@Configuration
public class RmiClientConfig {
    private static final Logger log = LoggerFactory.getLogger(RmiClientConfig.class);

    @Value("${rmi.voting-service.url}")
    private String rmiUrl;

    @Bean
    public VotingService votingService() {
        try {
            log.info("Looking up RMI service at {}", rmiUrl);
            return (VotingService) Naming.lookup(rmiUrl);
        } catch (Exception e) {
            log.error("Could not connect to RMI service at {}", rmiUrl, e);
            throw new IllegalStateException("RMI service unavailable: " + rmiUrl, e);
        }
    }
}
