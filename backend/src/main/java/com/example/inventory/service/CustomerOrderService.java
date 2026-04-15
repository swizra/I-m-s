package com.example.inventory.service;

import com.example.inventory.dto.AdminOrderResponse;
import com.example.inventory.dto.AdminOrderStatusUpdateRequest;
import com.example.inventory.dto.CustomerCheckoutItemRequest;
import com.example.inventory.dto.CustomerCheckoutRequest;
import com.example.inventory.dto.CustomerOrderItemResponse;
import com.example.inventory.dto.CustomerOrderResponse;
import com.example.inventory.exception.BusinessValidationException;
import com.example.inventory.exception.ResourceNotFoundException;
import com.example.inventory.model.AppUser;
import com.example.inventory.model.CustomerOrder;
import com.example.inventory.model.OrderItem;
import com.example.inventory.model.OrderStatus;
import com.example.inventory.model.Product;
import com.example.inventory.repository.CustomerOrderRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomerOrderService {

    private final CustomerOrderRepository customerOrderRepository;
    private final CustomerAccountService customerAccountService;
    private final ProductService productService;
    private final CatalogLiveUpdateService catalogLiveUpdateService;
    private final int estimatedReadyBaseMinutes;
    private final int estimatedReadyPerItemMinutes;

    public CustomerOrderService(CustomerOrderRepository customerOrderRepository,
                                CustomerAccountService customerAccountService,
                                ProductService productService,
                                CatalogLiveUpdateService catalogLiveUpdateService,
                                @Value("${app.orders.estimated-ready-base-minutes:45}") int estimatedReadyBaseMinutes,
                                @Value("${app.orders.estimated-ready-per-item-minutes:12}") int estimatedReadyPerItemMinutes) {
        this.customerOrderRepository = customerOrderRepository;
        this.customerAccountService = customerAccountService;
        this.productService = productService;
        this.catalogLiveUpdateService = catalogLiveUpdateService;
        this.estimatedReadyBaseMinutes = estimatedReadyBaseMinutes;
        this.estimatedReadyPerItemMinutes = estimatedReadyPerItemMinutes;
    }

    @Transactional(readOnly = true)
    public List<CustomerOrderResponse> getOrdersForCustomer(String username) {
        AppUser customer = customerAccountService.findCustomerByUsername(username);
        return customerOrderRepository.findByCustomerIdOrderByCreatedAtDesc(customer.getId()).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CustomerOrderResponse getOrderForCustomer(String username, String orderNumber) {
        AppUser customer = customerAccountService.findCustomerByUsername(username);
        CustomerOrder order = customerOrderRepository.findByOrderNumberAndCustomerId(orderNumber, customer.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found."));
        return mapToResponse(order);
    }

    @Transactional(readOnly = true)
    public List<AdminOrderResponse> getAllOrdersForAdmin() {
        return customerOrderRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToAdminResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AdminOrderResponse> getRecentOrdersForAdmin() {
        return customerOrderRepository.findTop10ByOrderByCreatedAtDesc().stream()
                .map(this::mapToAdminResponse)
                .toList();
    }

    @Transactional
    public AdminOrderResponse updateOrderStatus(Long orderId, AdminOrderStatusUpdateRequest request) {
        CustomerOrder order = customerOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id " + orderId));

        OrderStatus targetStatus = parseStatus(request.getStatus());
        validateStatusTransition(order.getStatus(), targetStatus);

        order.setStatus(targetStatus);
        CustomerOrder savedOrder = customerOrderRepository.save(order);
        return mapToAdminResponse(savedOrder);
    }

    @Transactional
    public CustomerOrderResponse placeOrder(String username, CustomerCheckoutRequest request) {
        AppUser customer = customerAccountService.findCustomerByUsername(username);
        Map<Long, Integer> combinedItems = combineItems(request.getItems());

        if (combinedItems.isEmpty()) {
            throw new BusinessValidationException("Your cart is empty.");
        }

        String orderNumber = generateOrderNumber();
        CustomerOrder order = new CustomerOrder();
        order.setCustomer(customer);
        order.setOrderNumber(orderNumber);
        order.setStatus(OrderStatus.PLACED);
        order.setDeliveryAddress(request.getDeliveryAddress().trim());
        order.setNote(normalizeText(request.getNote()));
        order.setEstimatedReadyAt(calculateEstimatedReadyAt(combinedItems));
        order.setConfirmationPreparedAt(LocalDateTime.now());

        BigDecimal total = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (Map.Entry<Long, Integer> entry : combinedItems.entrySet()) {
            Product product = productService.findProductEntity(entry.getKey());
            if (!product.isActive()) {
                throw new BusinessValidationException(product.getName() + " is currently not available for purchase.");
            }
            if (product.getStockQuantity() < entry.getValue()) {
                throw new BusinessValidationException("Not enough stock for " + product.getName() + ".");
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(entry.getValue());
            orderItem.setUnitPrice(product.getPrice());
            orderItem.setLineTotal(product.getPrice().multiply(BigDecimal.valueOf(entry.getValue())));

            orderItems.add(orderItem);
            total = total.add(orderItem.getLineTotal());
        }

        order.setItems(orderItems);
        order.setTotalAmount(total);

        CustomerOrder savedOrder = customerOrderRepository.save(order);

        for (OrderItem orderItem : orderItems) {
            productService.decreaseStockForOrder(
                    orderItem.getProduct().getId(),
                    orderItem.getQuantity(),
                    "Customer order " + orderNumber + " placed by " + customer.getUsername() + "."
            );
        }

        catalogLiveUpdateService.publishCatalogRefresh("order-placed");
        return mapToResponse(savedOrder);
    }

    private Map<Long, Integer> combineItems(List<CustomerCheckoutItemRequest> items) {
        Map<Long, Integer> combinedItems = new LinkedHashMap<>();
        for (CustomerCheckoutItemRequest item : items) {
            combinedItems.merge(item.getProductId(), item.getQuantity(), Integer::sum);
        }
        return combinedItems;
    }

    private String generateOrderNumber() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss"));
        int suffix = ThreadLocalRandom.current().nextInt(100, 999);
        return "KEFE-" + timestamp + "-" + suffix;
    }

    private String normalizeText(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private LocalDateTime calculateEstimatedReadyAt(Map<Long, Integer> combinedItems) {
        int totalQuantity = combinedItems.values().stream().mapToInt(Integer::intValue).sum();
        int estimatedMinutes = estimatedReadyBaseMinutes + (totalQuantity * estimatedReadyPerItemMinutes);
        return LocalDateTime.now().plusMinutes(Math.max(estimatedReadyBaseMinutes, estimatedMinutes));
    }

    private OrderStatus parseStatus(String rawStatus) {
        if (rawStatus == null || rawStatus.isBlank()) {
            throw new BusinessValidationException("Order status is required.");
        }

        try {
            return OrderStatus.valueOf(rawStatus.trim().toUpperCase());
        } catch (IllegalArgumentException exception) {
            throw new BusinessValidationException("Unsupported order status: " + rawStatus);
        }
    }

    private void validateStatusTransition(OrderStatus currentStatus, OrderStatus targetStatus) {
        if (currentStatus == targetStatus) {
            return;
        }

        boolean transitionAllowed = switch (currentStatus) {
            case PLACED -> targetStatus == OrderStatus.PREPARING
                    || targetStatus == OrderStatus.READY_FOR_PICKUP
                    || targetStatus == OrderStatus.COMPLETED;
            case PREPARING -> targetStatus == OrderStatus.READY_FOR_PICKUP
                    || targetStatus == OrderStatus.COMPLETED;
            case READY_FOR_PICKUP -> targetStatus == OrderStatus.COMPLETED;
            case COMPLETED -> false;
        };

        if (!transitionAllowed) {
            throw new BusinessValidationException(
                    "Order status cannot move from " + currentStatus.name() + " to " + targetStatus.name() + "."
            );
        }
    }

    private CustomerOrderResponse mapToResponse(CustomerOrder order) {
        CustomerOrderResponse response = new CustomerOrderResponse();
        response.setId(order.getId());
        response.setOrderNumber(order.getOrderNumber());
        response.setStatus(order.getStatus().name());
        response.setCreatedAt(order.getCreatedAt());
        response.setTotalAmount(order.getTotalAmount());
        response.setDeliveryAddress(order.getDeliveryAddress());
        response.setNote(order.getNote());
        response.setEstimatedReadyAt(order.getEstimatedReadyAt());
        response.setConfirmationPreparedAt(order.getConfirmationPreparedAt());
        response.setConfirmationRecipientEmail(order.getCustomer().getEmail());
        response.setItems(order.getItems().stream().map(this::mapOrderItem).toList());
        return response;
    }

    private CustomerOrderItemResponse mapOrderItem(OrderItem item) {
        CustomerOrderItemResponse response = new CustomerOrderItemResponse();
        Product product = item.getProduct();
        response.setProductId(product != null ? product.getId() : null);
        response.setProductName(product != null ? product.getName() : "Archived product");
        response.setCategoryName(product != null && product.getCategory() != null
                ? product.getCategory().getName()
                : "Uncategorized");
        response.setImageUrl(product != null ? product.getImageUrl() : null);
        response.setQuantity(item.getQuantity());
        response.setUnitPrice(item.getUnitPrice());
        response.setLineTotal(item.getLineTotal());
        return response;
    }

    private AdminOrderResponse mapToAdminResponse(CustomerOrder order) {
        AdminOrderResponse response = new AdminOrderResponse();
        response.setId(order.getId());
        response.setOrderNumber(order.getOrderNumber());
        response.setCustomerFullName(order.getCustomer() != null ? order.getCustomer().getFullName() : "Unknown customer");
        response.setCustomerUsername(order.getCustomer() != null ? order.getCustomer().getUsername() : "unknown");
        response.setStatus(order.getStatus() != null ? order.getStatus().name() : OrderStatus.PLACED.name());
        response.setTotalAmount(order.getTotalAmount());
        response.setItemCount(order.getItems() != null ? order.getItems().stream().mapToInt(OrderItem::getQuantity).sum() : 0);
        response.setDeliveryAddress(order.getDeliveryAddress());
        response.setNote(order.getNote());
        response.setCreatedAt(order.getCreatedAt());
        response.setEstimatedReadyAt(order.getEstimatedReadyAt());
        response.setItems(order.getItems() != null ? order.getItems().stream().map(this::mapOrderItem).toList() : List.of());
        return response;
    }
}
