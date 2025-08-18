package org.example.apibridge;

import org.example.shared.VotingService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.rmi.Naming;

@Configuration
public class RmiClientConfig {
    @Bean
    public VotingService votingService() {
        try {
            // This looks up the service running from your RMI Server
            return (VotingService) Naming.lookup("rmi://localhost:1099/VotingService");
        } catch (Exception e) {
            throw new RuntimeException("❌ Could not connect to RMI service. Make sure it's running.", e);
        }
    }
}