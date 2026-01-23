package com.moneytracker.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneytracker.backend.dto.UpdateUserRequest;
import com.moneytracker.backend.dto.UserResponse;
import com.moneytracker.backend.entity.User;
import com.moneytracker.backend.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UserController.class)
@AutoConfigureMockMvc(addFilters = false)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private UserService userService;

    private User user;
    private UserResponse userResponse;

    @BeforeEach
    void setUp() {
        UUID userId = UUID.randomUUID();
        user = User.builder()
                .id(userId)
                .email("user@example.com")
                .passwordHash("hashed")
                .firstName("Demo")
                .lastName("User")
                .build();
        
        userResponse = new UserResponse(
                userId,
                "user@example.com",
                "Demo",
                "User",
                "Demo User"
        );
    }

    @Test
    void getCurrentUser_returnsUserResponse() throws Exception {
        when(userService.getUser(user)).thenReturn(userResponse);

        mockMvc.perform(get("/users/me").with(auth()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(userResponse.id().toString()))
                .andExpect(jsonPath("$.email").value(userResponse.email()))
                .andExpect(jsonPath("$.firstName").value(userResponse.firstName()))
                .andExpect(jsonPath("$.lastName").value(userResponse.lastName()))
                .andExpect(jsonPath("$.fullName").value(userResponse.fullName()));

        verify(userService).getUser(user);
    }

    @Test
    void updateCurrentUser_updatesName() throws Exception {
        UpdateUserRequest request = new UpdateUserRequest(
                "NewFirst",
                "NewLast",
                null,
                null,
                null
        );
        
        UserResponse updatedResponse = new UserResponse(
                userResponse.id(),
                userResponse.email(),
                "NewFirst",
                "NewLast",
                "NewFirst NewLast"
        );
        
        when(userService.updateUser(eq(user), any(UpdateUserRequest.class))).thenReturn(updatedResponse);

        mockMvc.perform(put("/users/me")
                        .with(auth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("NewFirst"))
                .andExpect(jsonPath("$.lastName").value("NewLast"))
                .andExpect(jsonPath("$.fullName").value("NewFirst NewLast"));

        verify(userService).updateUser(eq(user), any(UpdateUserRequest.class));
    }

    @Test
    void updateCurrentUser_updatesEmail() throws Exception {
        UpdateUserRequest request = new UpdateUserRequest(
                null,
                null,
                "newemail@example.com",
                null,
                null
        );
        
        UserResponse updatedResponse = new UserResponse(
                userResponse.id(),
                "newemail@example.com",
                userResponse.firstName(),
                userResponse.lastName(),
                userResponse.fullName()
        );
        
        when(userService.updateUser(eq(user), any(UpdateUserRequest.class))).thenReturn(updatedResponse);

        mockMvc.perform(put("/users/me")
                        .with(auth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("newemail@example.com"));

        verify(userService).updateUser(eq(user), any(UpdateUserRequest.class));
    }

    @Test
    void updateCurrentUser_changesPassword() throws Exception {
        UpdateUserRequest request = new UpdateUserRequest(
                null,
                null,
                null,
                "oldPassword123",
                "newPassword456"
        );
        
        when(userService.updateUser(eq(user), any(UpdateUserRequest.class))).thenReturn(userResponse);

        mockMvc.perform(put("/users/me")
                        .with(auth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        verify(userService).updateUser(eq(user), any(UpdateUserRequest.class));
    }

    private RequestPostProcessor auth() {
        return authentication(new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities()));
    }
}
