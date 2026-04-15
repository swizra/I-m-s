package com.example.inventory.controller;

import com.example.inventory.dto.SupportConversationResponse;
import com.example.inventory.dto.SupportConversationStatusUpdateRequest;
import com.example.inventory.dto.SupportMessageRequest;
import com.example.inventory.service.AuthService;
import com.example.inventory.service.SupportConversationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/support")
@Tag(name = "Admin Support", description = "Admin support inbox and chat endpoints.")
@SecurityRequirement(name = "bearerAuth")
public class AdminSupportController {

    private final AuthService authService;
    private final SupportConversationService supportConversationService;

    public AdminSupportController(AuthService authService,
                                  SupportConversationService supportConversationService) {
        this.authService = authService;
        this.supportConversationService = supportConversationService;
    }

    @GetMapping("/conversations")
    @Operation(summary = "Get all support conversations")
    public List<SupportConversationResponse> getConversations() {
        return supportConversationService.getAllConversationsForAdmin();
    }

    @PostMapping("/conversations/{conversationId}/messages")
    @Operation(summary = "Send a support reply as an admin")
    public SupportConversationResponse createMessage(Authentication authentication,
                                                     @PathVariable Long conversationId,
                                                     @Valid @RequestBody SupportMessageRequest request) {
        return supportConversationService.addStaffMessage(authService.extractUsername(authentication), conversationId, request);
    }

    @PutMapping("/conversations/{conversationId}/status")
    @Operation(summary = "Update support conversation status")
    public SupportConversationResponse updateStatus(@PathVariable Long conversationId,
                                                    @Valid @RequestBody SupportConversationStatusUpdateRequest request) {
        return supportConversationService.updateConversationStatus(conversationId, request);
    }
}
