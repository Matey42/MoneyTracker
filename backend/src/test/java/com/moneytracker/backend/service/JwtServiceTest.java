package com.moneytracker.backend.service;

import com.moneytracker.backend.entity.User;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class JwtServiceTest {

    private static final UUID USER_ID = UUID.fromString("3f6e3bb5-2a3c-4b68-a765-7a82a4d64a7f");

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        String rawSecret = "0123456789ABCDEF0123456789ABCDEF";
        String encodedSecret = Base64.getEncoder().encodeToString(rawSecret.getBytes(StandardCharsets.UTF_8));
        ReflectionTestUtils.setField(jwtService, "secretKey", encodedSecret);
        ReflectionTestUtils.setField(jwtService, "accessTokenExpiration", 60_000L);
        ReflectionTestUtils.setField(jwtService, "refreshTokenExpiration", 120_000L);
    }

    @Test
    void generateAccessToken_containsUserClaims() {
        User user = User.builder()
                .id(USER_ID)
                .email("user@example.com")
                .passwordHash("hashed")
                .firstName("Alex")
                .lastName("River")
                .build();

        String token = jwtService.generateAccessToken(user);

        assertThat(jwtService.extractUsername(token)).isEqualTo("user@example.com");
        assertThat(jwtService.extractUserId(token)).isEqualTo(USER_ID);
        String firstName = jwtService.extractClaim(token, (Claims claims) -> (String) claims.get("firstName"));
        assertThat(firstName).isEqualTo("Alex");

        String lastName = jwtService.extractClaim(token, (Claims claims) -> (String) claims.get("lastName"));
        assertThat(lastName).isEqualTo("River");
    }

    @Test
    void isTokenValid_returnsTrueForMatchingUser() {
        User user = User.builder()
                .id(USER_ID)
                .email("user@example.com")
                .passwordHash("hashed")
                .firstName("Alex")
                .lastName("River")
                .build();

        String token = jwtService.generateAccessToken(user);

        assertThat(jwtService.isTokenValid(token, user)).isTrue();
    }
}
