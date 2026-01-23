package com.moneytracker.backend.service;

import com.moneytracker.backend.dto.UpdateUserRequest;
import com.moneytracker.backend.dto.UserResponse;
import com.moneytracker.backend.entity.User;
import com.moneytracker.backend.exception.BadRequestException;
import com.moneytracker.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public UserResponse getUser(User user) {
        return UserResponse.from(user);
    }

    @Transactional
    public UserResponse updateUser(User user, UpdateUserRequest request) {
        // Update name fields
        if (request.firstName() != null) {
            user.setFirstName(request.firstName());
        }
        if (request.lastName() != null) {
            user.setLastName(request.lastName());
        }
        
        // Update email if provided and different
        if (request.email() != null && !request.email().equalsIgnoreCase(user.getEmail())) {
            String newEmail = request.email().toLowerCase();
            if (userRepository.existsByEmail(newEmail)) {
                throw new BadRequestException("Email already in use");
            }
            user.setEmail(newEmail);
        }
        
        // Update password if provided
        if (request.newPassword() != null && request.currentPassword() != null) {
            if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
                throw new BadRequestException("Current password is incorrect");
            }
            user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        }
        
        userRepository.save(user);
        return UserResponse.from(user);
    }
}
