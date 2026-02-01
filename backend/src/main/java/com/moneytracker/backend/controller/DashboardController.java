package com.moneytracker.backend.controller;

import com.moneytracker.backend.dto.DashboardResponse;
import com.moneytracker.backend.dto.NetWorthHistoryResponse;
import com.moneytracker.backend.entity.User;
import com.moneytracker.backend.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public ResponseEntity<DashboardResponse> getDashboard(@AuthenticationPrincipal User user) {
        DashboardResponse dashboard = dashboardService.getDashboard(user);
        return ResponseEntity.ok(dashboard);
    }
    
    @GetMapping("/net-worth-history")
    public ResponseEntity<NetWorthHistoryResponse> getNetWorthHistory(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "7D") String period) {
        NetWorthHistoryResponse history = dashboardService.getNetWorthHistory(user, period);
        return ResponseEntity.ok(history);
    }
}
