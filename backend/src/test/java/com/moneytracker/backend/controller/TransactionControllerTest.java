package com.moneytracker.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneytracker.backend.dto.CreateTransactionRequest;
import com.moneytracker.backend.dto.TransactionResponse;
import com.moneytracker.backend.dto.UpdateTransactionRequest;
import com.moneytracker.backend.entity.TransactionType;
import com.moneytracker.backend.entity.User;
import com.moneytracker.backend.service.JwtService;
import com.moneytracker.backend.service.TransactionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(TransactionController.class)
@AutoConfigureMockMvc(addFilters = false)
class TransactionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private TransactionService transactionService;

    @MockitoBean
    @SuppressWarnings("unused")
    private JwtService jwtService;

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
        when(transactionService.getAllTransactionsForUser(any(User.class), any())).thenReturn(page);

        mockMvc.perform(get("/transactions").with(auth()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(response.id().toString()))
                .andExpect(jsonPath("$.content[0].amount").value(response.amount().intValue()));

        verify(transactionService).getAllTransactionsForUser(any(User.class), any());
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
        when(transactionService.createTransaction(any(CreateTransactionRequest.class), any(User.class))).thenReturn(response);

        mockMvc.perform(post("/transactions")
                        .with(auth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(response.id().toString()))
                .andExpect(jsonPath("$.description").value(response.description()));

        verify(transactionService).createTransaction(any(CreateTransactionRequest.class), any(User.class));
    }

    @Test
    void getWalletBalance_returnsBalance() throws Exception {
        UUID walletId = UUID.randomUUID();
        when(transactionService.getWalletBalance(eq(walletId), any(User.class))).thenReturn(BigDecimal.valueOf(250));

        mockMvc.perform(get("/wallets/{walletId}/transactions/balance", walletId).with(auth()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value(250));

        verify(transactionService).getWalletBalance(eq(walletId), any(User.class));
    }

    @Test
    void deleteTransaction_returnsNoContent() throws Exception {
        UUID transactionId = UUID.randomUUID();

        mockMvc.perform(delete("/transactions/{transactionId}", transactionId).with(auth()))
                .andExpect(status().isNoContent());

        verify(transactionService).deleteTransaction(eq(transactionId), any(User.class));
    }

    @Test
    void getTransaction_returnsSingleTransaction() throws Exception {
        UUID transactionId = UUID.randomUUID();
        TransactionResponse response = sampleTransactionResponse();
        when(transactionService.getTransactionById(eq(transactionId), any(User.class))).thenReturn(response);

        mockMvc.perform(get("/transactions/{transactionId}", transactionId).with(auth()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(response.id().toString()))
                .andExpect(jsonPath("$.description").value(response.description()));

        verify(transactionService).getTransactionById(eq(transactionId), any(User.class));
    }

    @Test
    void updateTransaction_returnsUpdatedTransaction() throws Exception {
        UUID transactionId = UUID.randomUUID();
        UpdateTransactionRequest request = new UpdateTransactionRequest(
                TransactionType.INCOME,
                BigDecimal.valueOf(100),
                null,
                "Updated description",
                LocalDate.parse("2024-03-01")
        );
        TransactionResponse response = sampleTransactionResponse();
        when(transactionService.updateTransaction(eq(transactionId), any(UpdateTransactionRequest.class), any(User.class)))
                .thenReturn(response);

        mockMvc.perform(put("/transactions/{transactionId}", transactionId)
                        .with(auth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(response.id().toString()));

        verify(transactionService).updateTransaction(eq(transactionId), any(UpdateTransactionRequest.class), any(User.class));
    }

    @Test
    void getWalletTransactions_returnsPage() throws Exception {
        UUID walletId = UUID.randomUUID();
        TransactionResponse response = sampleTransactionResponse();
        Page<TransactionResponse> page = new PageImpl<>(List.of(response), PageRequest.of(0, 20), 1);
        when(transactionService.getTransactionsByWallet(eq(walletId), any(User.class), any())).thenReturn(page);

        mockMvc.perform(get("/wallets/{walletId}/transactions", walletId).with(auth()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(response.id().toString()));

        verify(transactionService).getTransactionsByWallet(eq(walletId), any(User.class), any());
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
