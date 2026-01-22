package com.moneytracker.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneytracker.backend.dto.CreateWalletRequest;
import com.moneytracker.backend.dto.WalletResponse;
import com.moneytracker.backend.entity.User;
import com.moneytracker.backend.entity.WalletType;
import com.moneytracker.backend.service.WalletService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(WalletController.class)
@AutoConfigureMockMvc(addFilters = false)
class WalletControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private WalletService walletService;

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(UUID.randomUUID())
                .email("user@example.com")
                .passwordHash("hashed")
                .firstName("Demo")
                .lastName("User")
                .build();
    }

    @Test
    void getAllWallets_returnsWallets() throws Exception {
        WalletResponse response = sampleWalletResponse();
        when(walletService.getAllWalletsForUser(user)).thenReturn(List.of(response));

        mockMvc.perform(get("/wallets").with(auth()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(response.id().toString()))
                .andExpect(jsonPath("$[0].name").value(response.name()));

        verify(walletService).getAllWalletsForUser(user);
    }

    @Test
    void createWallet_returnsCreatedWallet() throws Exception {
        CreateWalletRequest request = new CreateWalletRequest(
                "Primary",
                WalletType.BANK_CASH,
                "PLN",
                "Main account",
                "bank"
        );
        WalletResponse response = sampleWalletResponse();
        when(walletService.createWallet(any(CreateWalletRequest.class), eq(user))).thenReturn(response);

        mockMvc.perform(post("/wallets")
                        .with(auth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(response.id().toString()))
                .andExpect(jsonPath("$.name").value(response.name()));

        verify(walletService).createWallet(any(CreateWalletRequest.class), eq(user));
    }

    @Test
    void deleteWallet_returnsNoContent() throws Exception {
        UUID walletId = UUID.randomUUID();

        mockMvc.perform(delete("/wallets/{walletId}", walletId).with(auth()))
                .andExpect(status().isNoContent());

        verify(walletService).deleteWallet(walletId, user);
    }

    private RequestPostProcessor auth() {
        return authentication(new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities()));
    }

    private WalletResponse sampleWalletResponse() {
        return new WalletResponse(
                UUID.randomUUID(),
                "Primary",
                WalletType.BANK_CASH,
                "PLN",
                BigDecimal.valueOf(1200),
                BigDecimal.valueOf(20),
                false,
                1,
                true,
                "Main account",
                "bank",
                true,
                0,
                Instant.parse("2024-01-01T00:00:00Z")
        );
    }
}
