package com.moneytracker.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneytracker.backend.dto.CreateTransactionRequest;
import com.moneytracker.backend.dto.TransactionResponse;
import com.moneytracker.backend.entity.TransactionType;
import com.moneytracker.backend.entity.User;
import com.moneytracker.backend.service.TransactionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.math.BigDecimal;
import java.time.LocalDate;
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

@WebMvcTest(TransactionController.class)
@AutoConfigureMockMvc(addFilters = false)
class TransactionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TransactionService transactionService;

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
    void getAllTransactions_returnsPage() throws Exception {
        TransactionResponse response = sampleTransactionResponse();
        Page<TransactionResponse> page = new PageImpl<>(List.of(response), PageRequest.of(0, 20), 1);
        when(transactionService.getAllTransactionsForUser(eq(user), any())).thenReturn(page);

        mockMvc.perform(get("/transactions").with(auth()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(response.id().toString()))
                .andExpect(jsonPath("$.content[0].amount").value(response.amount().intValue()));

        verify(transactionService).getAllTransactionsForUser(eq(user), any());
    }

    @Test
    void createTransaction_returnsCreatedTransaction() throws Exception {
        UUID walletId = UUID.randomUUID();
        CreateTransactionRequest request = new CreateTransactionRequest(
                walletId,
                TransactionType.EXPENSE,
                BigDecimal.valueOf(45.5),
                null,
                "Lunch",
                null,
                LocalDate.parse("2024-02-01")
        );
        TransactionResponse response = sampleTransactionResponse();
        when(transactionService.createTransaction(any(CreateTransactionRequest.class), eq(user))).thenReturn(response);

        mockMvc.perform(post("/transactions")
                        .with(auth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(response.id().toString()))
                .andExpect(jsonPath("$.description").value(response.description()));

        verify(transactionService).createTransaction(any(CreateTransactionRequest.class), eq(user));
    }

    @Test
    void getWalletBalance_returnsBalance() throws Exception {
        UUID walletId = UUID.randomUUID();
        when(transactionService.getWalletBalance(walletId, user)).thenReturn(BigDecimal.valueOf(250));

        mockMvc.perform(get("/transactions/wallet/{walletId}/balance", walletId).with(auth()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value(250));

        verify(transactionService).getWalletBalance(walletId, user);
    }

    @Test
    void deleteTransaction_returnsNoContent() throws Exception {
        UUID transactionId = UUID.randomUUID();

        mockMvc.perform(delete("/transactions/{transactionId}", transactionId).with(auth()))
                .andExpect(status().isNoContent());

        verify(transactionService).deleteTransaction(transactionId, user);
    }

    private RequestPostProcessor auth() {
        return authentication(new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities()));
    }

    private TransactionResponse sampleTransactionResponse() {
        return new TransactionResponse(
                UUID.randomUUID(),
                UUID.randomUUID(),
                TransactionType.EXPENSE,
                BigDecimal.valueOf(45.5),
                "PLN",
                null,
                user.getId(),
                user.getFullName(),
                null,
                "Lunch",
                LocalDate.parse("2024-02-01")
        );
    }
}
