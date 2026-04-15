package com.example.inventory.controller;

import com.example.inventory.dto.SupportConversationRequest;
import com.example.inventory.dto.SupportConversationResponse;
import com.example.inventory.dto.SupportMessageRequest;
import com.example.inventory.service.AuthService;
import com.example.inventory.service.SupportConversationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/customer/support")
@Tag(name = "Customer Support", description = "Protected support inbox and messaging endpoints for customers.")
@SecurityRequirement(name = "bearerAuth")
public class CustomerSupportController {

    private final AuthService authService;
    private final SupportConversationService supportConversationService;

    public CustomerSupportController(AuthService authService,
                                     SupportConversationService supportConversationService) {
        this.authService = authService;
        this.supportConversationService = supportConversationService;
    }

    @GetMapping("/conversations")
    @Operation(summary = "Get support conversations for the authenticated customer")
    public List<SupportConversationResponse> getConversations(Authentication authentication) {
        return supportConversationService.getConversationsForCustomer(authService.extractUsername(authentication));
    }

    @PostMapping("/conversations")
    @Operation(summary = "Create a support conversation")
    public ResponseEntity<SupportConversationResponse> createConversation(Authentication authentication,
                                                                          @Valid @RequestBody SupportConversationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(supportConversationService.createConversation(authService.extractUsername(authentication), request));
    }

    @PostMapping("/conversations/{conversationId}/messages")
    @Operation(summary = "Send a support message as the authenticated customer")
    public SupportConversationResponse createMessage(Authentication authentication,
                                                     @PathVariable Long conversationId,
                                                     @Valid @RequestBody SupportMessageRequest request) {
        return supportConversationService.addCustomerMessage(authService.extractUsername(authentication), conversationId, request);
    }
}
