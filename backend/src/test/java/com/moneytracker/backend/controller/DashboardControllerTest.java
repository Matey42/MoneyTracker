package com.moneytracker.backend.controller;

import com.moneytracker.backend.dto.DashboardResponse;
import com.moneytracker.backend.dto.TransactionResponse;
import com.moneytracker.backend.dto.WalletResponse;
import com.moneytracker.backend.entity.TransactionType;
import com.moneytracker.backend.entity.User;
import com.moneytracker.backend.entity.WalletType;
import com.moneytracker.backend.service.DashboardService;
import com.moneytracker.backend.service.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(DashboardController.class)
@AutoConfigureMockMvc(addFilters = false)
class DashboardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private DashboardService dashboardService;

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
    void getDashboard_returnsDashboardData() throws Exception {
        DashboardResponse response = sampleDashboardResponse();
        when(dashboardService.getDashboard(any(User.class))).thenReturn(response);

        mockMvc.perform(get("/dashboard").with(auth()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalBalance").value(5000))
                .andExpect(jsonPath("$.monthlyIncome").value(3000))
                .andExpect(jsonPath("$.monthlyExpense").value(1500))
                .andExpect(jsonPath("$.monthlyChange").value(1500))
                .andExpect(jsonPath("$.wallets").isArray())
                .andExpect(jsonPath("$.wallets[0].name").value("Primary"))
                .andExpect(jsonPath("$.recentTransactions").isArray())
                .andExpect(jsonPath("$.categoryBreakdown").isArray());

        verify(dashboardService).getDashboard(any(User.class));
    }

    @Test
    void getDashboard_withEmptyData_returnsEmptyArrays() throws Exception {
        DashboardResponse emptyResponse = new DashboardResponse(
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                List.of(),
                List.of(),
                List.of()
        );
        when(dashboardService.getDashboard(any(User.class))).thenReturn(emptyResponse);

        mockMvc.perform(get("/dashboard").with(auth()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalBalance").value(0))
                .andExpect(jsonPath("$.wallets").isEmpty())
                .andExpect(jsonPath("$.recentTransactions").isEmpty())
                .andExpect(jsonPath("$.categoryBreakdown").isEmpty());

        verify(dashboardService).getDashboard(any(User.class));
    }

    private RequestPostProcessor auth() {
        return authentication(new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities()));
    }

    private DashboardResponse sampleDashboardResponse() {
        WalletResponse wallet = new WalletResponse(
                UUID.randomUUID(),
                "Primary",
                WalletType.BANK_CASH,
                "PLN",
                BigDecimal.valueOf(5000),
                BigDecimal.valueOf(100),
                false,
                1,
                true,
                "Main account",
                "bank",
                true,
                1,
                Instant.now()
        );

        TransactionResponse transaction = new TransactionResponse(
                UUID.randomUUID(),
                wallet.id(),
                TransactionType.EXPENSE,
                BigDecimal.valueOf(50),
                "PLN",
                null,
                user.getId(),
                "Demo User",
                UUID.randomUUID(),
                "Groceries",
                LocalDate.now()
        );

        DashboardResponse.CategoryBreakdown breakdown = new DashboardResponse.CategoryBreakdown(
                UUID.randomUUID().toString(),
                "Food",
                "#FF9800",
                BigDecimal.valueOf(500),
                BigDecimal.valueOf(33.33)
        );

        return new DashboardResponse(
                BigDecimal.valueOf(5000),
                BigDecimal.valueOf(3000),
                BigDecimal.valueOf(1500),
                BigDecimal.valueOf(1500),
                List.of(wallet),
                List.of(transaction),
                List.of(breakdown)
        );
    }
}
