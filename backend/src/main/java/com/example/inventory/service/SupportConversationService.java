package com.example.inventory.service;

import com.example.inventory.dto.SupportConversationRequest;
import com.example.inventory.dto.SupportConversationResponse;
import com.example.inventory.dto.SupportConversationStatusUpdateRequest;
import com.example.inventory.dto.SupportMessageRequest;
import com.example.inventory.dto.SupportMessageResponse;
import com.example.inventory.exception.BusinessValidationException;
import com.example.inventory.exception.ResourceNotFoundException;
import com.example.inventory.model.AppUser;
import com.example.inventory.model.SupportConversation;
import com.example.inventory.model.SupportConversationStatus;
import com.example.inventory.model.SupportMessage;
import com.example.inventory.repository.AppUserRepository;
import com.example.inventory.repository.SupportConversationRepository;
import com.example.inventory.repository.SupportMessageRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SupportConversationService {

    private final SupportConversationRepository supportConversationRepository;
    private final SupportMessageRepository supportMessageRepository;
    private final CustomerAccountService customerAccountService;
    private final AppUserRepository appUserRepository;

    public SupportConversationService(SupportConversationRepository supportConversationRepository,
                                      SupportMessageRepository supportMessageRepository,
                                      CustomerAccountService customerAccountService,
                                      AppUserRepository appUserRepository) {
        this.supportConversationRepository = supportConversationRepository;
        this.supportMessageRepository = supportMessageRepository;
        this.customerAccountService = customerAccountService;
        this.appUserRepository = appUserRepository;
    }

    @Transactional(readOnly = true)
    public List<SupportConversationResponse> getConversationsForCustomer(String username) {
        AppUser customer = customerAccountService.findCustomerByUsername(username);
        return supportConversationRepository.findByCustomerIdOrderByLastMessageAtDescCreatedAtDesc(customer.getId()).stream()
                .map(this::mapConversation)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SupportConversationResponse> getAllConversationsForAdmin() {
        return supportConversationRepository.findAllByOrderByLastMessageAtDescCreatedAtDesc().stream()
                .map(this::mapConversation)
                .toList();
    }

    @Transactional
    public SupportConversationResponse createConversation(String username, SupportConversationRequest request) {
        AppUser customer = customerAccountService.findCustomerByUsername(username);
        SupportConversation conversation = new SupportConversation();
        conversation.setCustomer(customer);
        conversation.setSubject(request.getSubject().trim());
        conversation.setCategory(request.getCategory().trim());
        conversation.setStatus(SupportConversationStatus.PENDING_STAFF);
        conversation.setLastMessageAt(LocalDateTime.now());
        SupportConversation savedConversation = supportConversationRepository.save(conversation);
        createMessage(savedConversation, customer, request.getMessage().trim(), SupportConversationStatus.PENDING_STAFF);
        return mapConversation(savedConversation);
    }

    @Transactional
    public SupportConversationResponse addCustomerMessage(String username, Long conversationId, SupportMessageRequest request) {
        AppUser customer = customerAccountService.findCustomerByUsername(username);
        SupportConversation conversation = supportConversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Support conversation not found."));

        if (!conversation.getCustomer().getId().equals(customer.getId())) {
            throw new ResourceNotFoundException("Support conversation not found.");
        }

        createMessage(conversation, customer, request.getMessage().trim(), SupportConversationStatus.PENDING_STAFF);
        return mapConversation(conversation);
    }

    @Transactional
    public SupportConversationResponse addStaffMessage(String username, Long conversationId, SupportMessageRequest request) {
        AppUser staff = findStaffUser(username);
        SupportConversation conversation = supportConversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Support conversation not found."));
        createMessage(conversation, staff, request.getMessage().trim(), SupportConversationStatus.PENDING_CUSTOMER);
        return mapConversation(conversation);
    }

    @Transactional
    public SupportConversationResponse updateConversationStatus(Long conversationId,
                                                               SupportConversationStatusUpdateRequest request) {
        SupportConversation conversation = supportConversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Support conversation not found."));
        conversation.setStatus(parseStatus(request.getStatus()));
        return mapConversation(supportConversationRepository.save(conversation));
    }

    private void createMessage(SupportConversation conversation,
                               AppUser sender,
                               String message,
                               SupportConversationStatus nextStatus) {
        if (message.isBlank()) {
            throw new BusinessValidationException("Message cannot be blank.");
        }

        SupportMessage supportMessage = new SupportMessage();
        supportMessage.setConversation(conversation);
        supportMessage.setSender(sender);
        supportMessage.setSenderRole(sender.getRole().name());
        supportMessage.setMessage(message);
        supportMessageRepository.save(supportMessage);

        conversation.setStatus(nextStatus);
        conversation.setLastMessageAt(LocalDateTime.now());
        supportConversationRepository.save(conversation);
    }

    private AppUser findStaffUser(String username) {
        return appUserRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new ResourceNotFoundException("Staff user not found."));
    }

    private SupportConversationStatus parseStatus(String rawStatus) {
        try {
            return SupportConversationStatus.valueOf(rawStatus.trim().toUpperCase());
        } catch (Exception exception) {
            throw new BusinessValidationException("Unsupported conversation status: " + rawStatus);
        }
    }

    private SupportConversationResponse mapConversation(SupportConversation conversation) {
        SupportConversationResponse response = new SupportConversationResponse();
        response.setId(conversation.getId());
        response.setCustomerId(conversation.getCustomer().getId());
        response.setCustomerFullName(conversation.getCustomer().getFullName());
        response.setCustomerUsername(conversation.getCustomer().getUsername());
        response.setCustomerEmail(conversation.getCustomer().getEmail());
        response.setSubject(conversation.getSubject());
        response.setCategory(conversation.getCategory());
        response.setStatus(conversation.getStatus().name());
        response.setLastMessageAt(conversation.getLastMessageAt());
        response.setCreatedAt(conversation.getCreatedAt());
        response.setUpdatedAt(conversation.getUpdatedAt());
        response.setMessages(supportMessageRepository.findByConversationIdOrderByCreatedAtAsc(conversation.getId()).stream()
                .map(this::mapMessage)
                .toList());
        return response;
    }

    private SupportMessageResponse mapMessage(SupportMessage message) {
        SupportMessageResponse response = new SupportMessageResponse();
        response.setId(message.getId());
        response.setSenderId(message.getSender().getId());
        response.setSenderName(message.getSender().getFullName());
        response.setSenderRole(message.getSenderRole());
        response.setMessage(message.getMessage());
        response.setCreatedAt(message.getCreatedAt());
        return response;
    }
}
