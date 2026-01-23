package com.moneytracker.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneytracker.backend.dto.CategoryResponse;
import com.moneytracker.backend.dto.CreateCategoryRequest;
import com.moneytracker.backend.dto.UpdateCategoryRequest;
import com.moneytracker.backend.entity.CategoryType;
import com.moneytracker.backend.entity.User;
import com.moneytracker.backend.service.CategoryService;
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

@WebMvcTest(CategoryController.class)
@AutoConfigureMockMvc(addFilters = false)
class CategoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CategoryService categoryService;

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
    void getAllCategories_returnsCategories() throws Exception {
        CategoryResponse response = sampleCategoryResponse(false, CategoryType.EXPENSE);
        when(categoryService.getAllCategoriesForUser(user)).thenReturn(List.of(response));

        mockMvc.perform(get("/categories").with(auth()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(response.id().toString()))
                .andExpect(jsonPath("$[0].name").value(response.name()));

        verify(categoryService).getAllCategoriesForUser(user);
    }

    @Test
    void getIncomeCategories_returnsIncome() throws Exception {
        CategoryResponse response = sampleCategoryResponse(false, CategoryType.INCOME);
        when(categoryService.getCategoriesByType(user, CategoryType.INCOME)).thenReturn(List.of(response));

        mockMvc.perform(get("/categories/income").with(auth()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].type").value(CategoryType.INCOME.name()));

        verify(categoryService).getCategoriesByType(user, CategoryType.INCOME);
    }

    @Test
    void getSystemCategories_returnsSystemCategories() throws Exception {
        CategoryResponse response = sampleCategoryResponse(true, CategoryType.EXPENSE);
        when(categoryService.getSystemCategories()).thenReturn(List.of(response));

        mockMvc.perform(get("/categories/system"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].isSystem").value(true));

        verify(categoryService).getSystemCategories();
    }

    @Test
    void getCategory_returnsSingleCategory() throws Exception {
        UUID categoryId = UUID.randomUUID();
        CategoryResponse response = sampleCategoryResponse(false, CategoryType.EXPENSE);
        when(categoryService.getCategoryById(categoryId, user)).thenReturn(response);

        mockMvc.perform(get("/categories/{categoryId}", categoryId).with(auth()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(response.id().toString()))
                .andExpect(jsonPath("$.name").value(response.name()));

        verify(categoryService).getCategoryById(categoryId, user);
    }

    @Test
    void createCategory_returnsCreatedCategory() throws Exception {
        CreateCategoryRequest request = new CreateCategoryRequest(
                "Custom Category",
                CategoryType.EXPENSE,
                "custom_icon",
                "#FF5722"
        );
        CategoryResponse response = sampleCategoryResponse(false, CategoryType.EXPENSE);
        when(categoryService.createCategory(any(CreateCategoryRequest.class), eq(user))).thenReturn(response);

        mockMvc.perform(post("/categories")
                        .with(auth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(response.id().toString()))
                .andExpect(jsonPath("$.name").value(response.name()));

        verify(categoryService).createCategory(any(CreateCategoryRequest.class), eq(user));
    }

    @Test
    void updateCategory_returnsUpdatedCategory() throws Exception {
        UUID categoryId = UUID.randomUUID();
        UpdateCategoryRequest request = new UpdateCategoryRequest(
                "Updated Category",
                null,
                "new_icon",
                "#4CAF50"
        );
        CategoryResponse response = sampleCategoryResponse(false, CategoryType.EXPENSE);
        when(categoryService.updateCategory(eq(categoryId), any(UpdateCategoryRequest.class), eq(user)))
                .thenReturn(response);

        mockMvc.perform(put("/categories/{categoryId}", categoryId)
                        .with(auth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(response.id().toString()));

        verify(categoryService).updateCategory(eq(categoryId), any(UpdateCategoryRequest.class), eq(user));
    }

    @Test
    void deleteCategory_returnsNoContent() throws Exception {
        UUID categoryId = UUID.randomUUID();

        mockMvc.perform(delete("/categories/{categoryId}", categoryId).with(auth()))
                .andExpect(status().isNoContent());

        verify(categoryService).deleteCategory(categoryId, user);
    }

    private RequestPostProcessor auth() {
        return authentication(new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities()));
    }

    private CategoryResponse sampleCategoryResponse(boolean isSystem, CategoryType type) {
        return new CategoryResponse(
                UUID.randomUUID(),
                "Groceries",
                type,
                "shopping_cart",
                "#FF9800",
                isSystem
        );
    }
}
