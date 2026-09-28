package com.disaster;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableAsync
@EnableScheduling
public class DisasterApplication {

    public static void main(String[] args) {
        loadEnv();
        SpringApplication.run(DisasterApplication.class, args);
    }

    @org.springframework.context.annotation.Bean(name = "taskExecutor")
    public org.springframework.core.task.TaskExecutor taskExecutor() {
        org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor executor = new org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor();
        executor.setCorePoolSize(4);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(50);
        executor.setThreadNamePrefix("disaster-async-");
        executor.initialize();
        return executor;
    }

    private static void loadEnv() {
        java.io.File envFile = new java.io.File(".env");
        if (!envFile.exists()) {
            envFile = new java.io.File("backend/.env");
        }
        if (!envFile.exists()) {
            envFile = new java.io.File("disaster-management-system/backend/.env");
        }
        if (envFile.exists()) {
            try (java.io.BufferedReader reader = new java.io.BufferedReader(new java.io.FileReader(envFile))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    line = line.trim();
                    if (line.isEmpty() || line.startsWith("#")) {
                        continue;
                    }
                    int eqIdx = line.indexOf('=');
                    if (eqIdx > 0) {
                        String key = line.substring(0, eqIdx).trim();
                        String value = line.substring(eqIdx + 1).trim();
                        if (value.startsWith("\"") && value.endsWith("\"")) {
                            value = value.substring(1, value.length() - 1);
                        } else if (value.startsWith("'") && value.endsWith("'")) {
                            value = value.substring(1, value.length() - 1);
                        }
                        if (System.getProperty(key) == null && System.getenv(key) == null) {
                            System.setProperty(key, value);
                        }
                    }
                }
                System.out.println("Successfully loaded properties from " + envFile.getAbsolutePath());
            } catch (java.io.IOException e) {
                System.err.println("Could not load .env file: " + e.getMessage());
            }
        }
    }
}
