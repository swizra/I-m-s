package com.example.inventory;

import com.example.inventory.model.Product;
import com.example.inventory.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.greaterThan;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:inventory-experience-db;DB_CLOSE_DELAY=-1;MODE=LEGACY",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
class CustomerExperienceIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ProductRepository productRepository;

    @Test
    void shouldManageWishlistAndReviewsForCustomer() throws Exception {
        Product product = productRepository.findByActiveTrueOrderByNameAsc().stream()
                .findFirst()
                .orElseThrow();
        String token = login("lina", "customer123");

        mockMvc.perform(post("/api/customer/wishlist/{productId}", product.getId())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.productId").value(product.getId()));

        mockMvc.perform(get("/api/customer/wishlist")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].productId").exists());

        mockMvc.perform(put("/api/customer/reviews/{productId}", product.getId())
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "rating": 5,
                                  "title": "Love it",
                                  "comment": "Gentle and calming."
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rating").value(5));

        mockMvc.perform(get("/api/public/products/{id}/reviews", product.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].customerUsername").value("lina"));

        mockMvc.perform(get("/api/public/products/{id}", product.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reviewCount").value(greaterThan(0)))
                .andExpect(jsonPath("$.averageRating").value(greaterThan(0.0)));

        mockMvc.perform(delete("/api/customer/reviews/{productId}", product.getId())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());
    }

    @Test
    void shouldExposeDashboardInsightsAndCsvExportForAdmin() throws Exception {
        String token = login("admin", "admin123");

        mockMvc.perform(get("/api/admin/dashboard/insights")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.generatedAt").exists())
                .andExpect(jsonPath("$.lowStockAlerts").isArray())
                .andExpect(jsonPath("$.salesByCategory").isArray());

        mockMvc.perform(get("/api/admin/dashboard/export.csv")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("\"Low Stock Alerts\"")))
                .andExpect(content().string(containsString("\"Sales By Category\"")));
    }

    @Test
    void shouldIncludeEstimatedReadyAndConfirmationMetadataWhenPlacingOrder() throws Exception {
        Product product = productRepository.findByActiveTrueOrderByNameAsc().stream()
                .filter(item -> item.getStockQuantity() > 0)
                .findFirst()
                .orElseThrow();
        String token = login("lina", "customer123");

        mockMvc.perform(post("/api/customer/orders")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "deliveryAddress": "Campus desk",
                                  "note": "Please prepare soon",
                                  "items": [
                                    {
                                      "productId": %d,
                                      "quantity": 1
                                    }
                                  ]
                                }
                                """.formatted(product.getId())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.estimatedReadyAt").exists())
                .andExpect(jsonPath("$.confirmationPreparedAt").exists())
                .andExpect(jsonPath("$.confirmationRecipientEmail").value("lina@kefe.demo"))
                .andExpect(jsonPath("$.items[0].productId").value(product.getId()))
                .andExpect(jsonPath("$.items[0].categoryName").isNotEmpty());
    }

    private String login(String username, String password) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/public/auth/token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "%s",
                                  "password": "%s"
                                }
                                """.formatted(username, password)))
                .andExpect(status().isOk())
                .andReturn();

        String body = result.getResponse().getContentAsString();
        int start = body.indexOf("\"accessToken\":\"");
        if (start < 0) {
            throw new IllegalStateException("accessToken not found in auth response");
        }
        start += "\"accessToken\":\"".length();
        int end = body.indexOf('"', start);
        return body.substring(start, end);
    }
}
