package com.example.inventory.service;

import com.example.inventory.dto.CustomerProfileResponse;
import com.example.inventory.dto.CustomerProfileUpdateRequest;
import com.example.inventory.dto.CustomerRegisterRequest;
import com.example.inventory.exception.BusinessValidationException;
import com.example.inventory.exception.ResourceNotFoundException;
import com.example.inventory.model.AppUser;
import com.example.inventory.model.UserRole;
import com.example.inventory.repository.AppUserRepository;
import com.example.inventory.repository.ProductReviewRepository;
import com.example.inventory.repository.WishlistItemRepository;
import java.time.LocalDateTime;
import java.util.UUID;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomerAccountService {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final WishlistItemRepository wishlistItemRepository;
    private final ProductReviewRepository productReviewRepository;

    public CustomerAccountService(AppUserRepository appUserRepository,
                                  PasswordEncoder passwordEncoder,
                                  WishlistItemRepository wishlistItemRepository,
                                  ProductReviewRepository productReviewRepository) {
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.wishlistItemRepository = wishlistItemRepository;
        this.productReviewRepository = productReviewRepository;
    }

    @Transactional
    public CustomerProfileResponse registerCustomer(CustomerRegisterRequest request) {
        String username = request.getUsername().trim();
        String email = request.getEmail().trim().toLowerCase();

        if (appUserRepository.existsByUsernameIgnoreCase(username)) {
            throw new BusinessValidationException("Username is already taken.");
        }

        if (appUserRepository.existsByEmailIgnoreCase(email)) {
            throw new BusinessValidationException("Email is already in use.");
        }

        AppUser customer = new AppUser();
        customer.setFullName(request.getFullName().trim());
        customer.setUsername(username);
        customer.setEmail(email);
        customer.setPassword(passwordEncoder.encode(request.getPassword().trim()));
        customer.setRole(UserRole.CUSTOMER);

        return mapToProfileResponse(appUserRepository.save(customer));
    }

    @Transactional(readOnly = true)
    public CustomerProfileResponse getCustomerProfile(String username) {
        return mapToProfileResponse(findCustomerByUsername(username));
    }

    @Transactional
    public CustomerProfileResponse updateCustomerProfile(String username, CustomerProfileUpdateRequest request) {
        AppUser customer = findCustomerByUsername(username);

        String nextFullName = request.getFullName().trim();
        String nextUsername = request.getUsername().trim();
        String nextEmail = request.getEmail().trim().toLowerCase();

        if (!customer.getUsername().equalsIgnoreCase(nextUsername)
                && appUserRepository.existsByUsernameIgnoreCase(nextUsername)) {
            throw new BusinessValidationException("Username is already taken.");
        }

        if (!customer.getEmail().equalsIgnoreCase(nextEmail)
                && appUserRepository.existsByEmailIgnoreCase(nextEmail)) {
            throw new BusinessValidationException("Email is already in use.");
        }

        customer.setFullName(nextFullName);
        customer.setUsername(nextUsername);
        customer.setEmail(nextEmail);

        return mapToProfileResponse(appUserRepository.save(customer));
    }

    @Transactional
    public void deleteCustomerProfile(String username) {
        AppUser customer = findCustomerByUsername(username);
        LocalDateTime deletedAt = LocalDateTime.now();
        String deletionToken = deletedAt.toString().replace(":", "").replace(".", "");

        customer.setDeletedAt(deletedAt);
        customer.setOrderRetentionUntil(deletedAt.plusYears(2));
        customer.setFullName("Deleted Customer");
        customer.setUsername("deleted-user-" + customer.getId() + "-" + deletionToken);
        customer.setEmail("deleted-" + customer.getId() + "-" + deletionToken + "@deleted.local");
        customer.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));

        appUserRepository.save(customer);
    }

    @Transactional(readOnly = true)
    public AppUser findCustomerByUsername(String username) {
        AppUser customer = appUserRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found."));

        if (customer.getRole() != UserRole.CUSTOMER) {
            throw new ResourceNotFoundException("Customer account not found.");
        }

        if (customer.getDeletedAt() != null) {
            throw new ResourceNotFoundException("Customer account not found.");
        }

        return customer;
    }

    private CustomerProfileResponse mapToProfileResponse(AppUser user) {
        CustomerProfileResponse response = new CustomerProfileResponse();
        response.setId(user.getId());
        response.setFullName(user.getFullName());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole().name());
        response.setWishlistCount(wishlistItemRepository.countByCustomerId(user.getId()));
        response.setReviewCount(productReviewRepository.countByCustomerId(user.getId()));
        return response;
    }
}
