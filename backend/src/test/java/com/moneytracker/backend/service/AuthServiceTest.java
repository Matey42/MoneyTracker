package com.moneytracker.backend.service;

import com.moneytracker.backend.dto.AuthResponse;
import com.moneytracker.backend.dto.LoginRequest;
import com.moneytracker.backend.dto.RefreshTokenRequest;
import com.moneytracker.backend.dto.RegisterRequest;
import com.moneytracker.backend.entity.RefreshToken;
import com.moneytracker.backend.entity.User;
import com.moneytracker.backend.exception.BadRequestException;
import com.moneytracker.backend.repository.RefreshTokenRepository;
import com.moneytracker.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    private static final UUID USER_ID = UUID.fromString("6c1c1a5e-9f7a-4a8d-9c4b-6c44b9d3b1f2");

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(USER_ID)
                .email("user@example.com")
                .passwordHash("hashed")
                .firstName("Alex")
                .lastName("River")
                .build();
    }

    @Test
    void register_newEmail_savesUserAndReturnsTokens() {
        RegisterRequest request = new RegisterRequest("User@Example.com", "Password123", "Alex", "River");

        when(userRepository.existsByEmail("user@example.com")).thenReturn(false);
        when(passwordEncoder.encode("Password123")).thenReturn("hashed");
        when(jwtService.generateAccessToken(any(User.class))).thenReturn("access-token");
        when(jwtService.generateRefreshToken(any(User.class))).thenReturn("refresh-token");
        when(jwtService.getAccessTokenExpiration()).thenReturn(900_000L);
        when(jwtService.getRefreshTokenExpiration()).thenReturn(604_800_000L);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User saved = invocation.getArgument(0);
            saved.setId(USER_ID);
            return saved;
        });

        AuthResponse response = authService.register(request);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User savedUser = userCaptor.getValue();

        assertThat(savedUser.getEmail()).isEqualTo("user@example.com");
        assertThat(savedUser.getPasswordHash()).isEqualTo("hashed");
        assertThat(response.accessToken()).isEqualTo("access-token");
        assertThat(response.refreshToken()).isEqualTo("refresh-token");
        assertThat(response.user().email()).isEqualTo("user@example.com");
    }

    @Test
    void register_existingEmail_throwsBadRequest() {
        RegisterRequest request = new RegisterRequest("user@example.com", "Password123", "Alex", "River");
        when(userRepository.existsByEmail("user@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Email already registered");
    }

    @Test
    void login_validCredentials_returnsTokensAndClearsOldRefreshTokens() {
        LoginRequest request = new LoginRequest("User@Example.com", "Password123");

        doNothing().when(authenticationManager).authenticate(any(Authentication.class));
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(jwtService.generateAccessToken(user)).thenReturn("access-token");
        when(jwtService.generateRefreshToken(user)).thenReturn("refresh-token");
        when(jwtService.getAccessTokenExpiration()).thenReturn(900_000L);
        when(jwtService.getRefreshTokenExpiration()).thenReturn(604_800_000L);

        AuthResponse response = authService.login(request);

        ArgumentCaptor<Authentication> authCaptor = ArgumentCaptor.forClass(Authentication.class);
        verify(authenticationManager).authenticate(authCaptor.capture());
        Authentication auth = authCaptor.getValue();
        assertThat(auth).isInstanceOf(UsernamePasswordAuthenticationToken.class);
        UsernamePasswordAuthenticationToken token = (UsernamePasswordAuthenticationToken) auth;
        assertThat(token.getPrincipal()).isEqualTo("user@example.com");
        assertThat(token.getCredentials()).isEqualTo("Password123");

        verify(refreshTokenRepository).deleteByUserId(USER_ID);
        assertThat(response.accessToken()).isEqualTo("access-token");
        assertThat(response.refreshToken()).isEqualTo("refresh-token");
    }

    @Test
    void login_missingUser_throwsBadRequest() {
        LoginRequest request = new LoginRequest("user@example.com", "Password123");

        doNothing().when(authenticationManager).authenticate(any(Authentication.class));
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    void refresh_invalidToken_throwsBadRequest() {
        when(refreshTokenRepository.findByToken("bad-token")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.refresh(new RefreshTokenRequest("bad-token")))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Invalid refresh token");
    }

    @Test
    void refresh_expiredToken_throwsBadRequestAndDeletesToken() {
        RefreshToken expired = RefreshToken.builder()
                .token("expired")
                .user(user)
                .expiresAt(Instant.now().minusSeconds(60))
                .build();

        when(refreshTokenRepository.findByToken("expired")).thenReturn(Optional.of(expired));

        assertThatThrownBy(() -> authService.refresh(new RefreshTokenRequest("expired")))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Refresh token expired");

        verify(refreshTokenRepository).delete(expired);
    }

    @Test
    void refresh_validToken_returnsNewTokensAndDeletesOldToken() {
        RefreshToken stored = RefreshToken.builder()
                .token("refresh-token")
                .user(user)
                .expiresAt(Instant.now().plusSeconds(600))
                .build();

        when(refreshTokenRepository.findByToken("refresh-token")).thenReturn(Optional.of(stored));
        when(jwtService.generateAccessToken(user)).thenReturn("access-token");
        when(jwtService.generateRefreshToken(user)).thenReturn("new-refresh-token");
        when(jwtService.getAccessTokenExpiration()).thenReturn(900_000L);
        when(jwtService.getRefreshTokenExpiration()).thenReturn(604_800_000L);

        AuthResponse response = authService.refresh(new RefreshTokenRequest("refresh-token"));

        verify(refreshTokenRepository).delete(stored);
        verify(refreshTokenRepository).save(any(RefreshToken.class));
        assertThat(response.accessToken()).isEqualTo("access-token");
        assertThat(response.refreshToken()).isEqualTo("new-refresh-token");
    }

    @Test
    void logout_removesRefreshTokens() {
        authService.logout(USER_ID);
        verify(refreshTokenRepository).deleteByUserId(USER_ID);
    }
}
