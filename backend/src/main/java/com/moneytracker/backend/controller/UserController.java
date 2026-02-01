package com.moneytracker.backend.controller;

import com.moneytracker.backend.dto.UpdateUserRequest;
import com.moneytracker.backend.dto.UserResponse;
import com.moneytracker.backend.entity.User;
import com.moneytracker.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(@AuthenticationPrincipal User user) {
        UserResponse response = userService.getUser(user);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateCurrentUser(@AuthenticationPrincipal User user,
                                                           @Valid @RequestBody UpdateUserRequest request) {
        UserResponse response = userService.updateUser(user, request);
        return ResponseEntity.ok(response);
    }
}
