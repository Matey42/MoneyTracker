package com.moneytracker.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record UpdateUserRequest(
        @Size(max = 100)
        String firstName,
        
        @Size(max = 100)
        String lastName,
        
        @Email
        @Size(max = 255)
        String email,
        
        @Size(min = 6, max = 100)
        String currentPassword,
        
        @Size(min = 6, max = 100)
        String newPassword
) {}
