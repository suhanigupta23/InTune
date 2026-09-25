package com.intune.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

@Configuration
public class AiServiceConfig {

    @Bean
    public RestTemplate aiRestTemplate(
            RestTemplateBuilder restTemplateBuilder,
            @Value("${ai.similarity.connect-timeout}") Duration connectTimeout,
            @Value("${ai.similarity.read-timeout}") Duration readTimeout) {
        return restTemplateBuilder
                .setConnectTimeout(connectTimeout)
                .setReadTimeout(readTimeout)
                .build();
    }
}
