package com.example.inventory.service;

import com.example.inventory.dto.DashboardAlertResponse;
import com.example.inventory.dto.DashboardCategorySalesResponse;
import com.example.inventory.dto.DashboardInsightsResponse;
import com.example.inventory.dto.DashboardStatsResponse;
import com.example.inventory.model.CustomerOrder;
import com.example.inventory.model.OrderItem;
import com.example.inventory.model.Product;
import com.example.inventory.repository.CategoryRepository;
import com.example.inventory.repository.CustomerOrderRepository;
import com.example.inventory.repository.ProductRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DashboardService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final CustomerOrderRepository customerOrderRepository;

    public DashboardService(ProductRepository productRepository,
                            CategoryRepository categoryRepository,
                            CustomerOrderRepository customerOrderRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.customerOrderRepository = customerOrderRepository;
    }

    @Transactional(readOnly = true)
    public DashboardStatsResponse getStats() {
        List<Product> products = productRepository.findAllByOrderByNameAsc();
        DashboardStatsResponse response = new DashboardStatsResponse();
        response.setTotalProducts((long) products.size());
        response.setTotalCategories(categoryRepository.count());
        response.setLowStockProducts(products.stream()
                .filter(Product::isActive)
                .filter(product -> product.getStockQuantity() > 0)
                .filter(product -> product.getStockQuantity() <= (product.getRestockThreshold() == null ? 5 : product.getRestockThreshold()))
                .count());
        response.setTotalInventoryUnits(productRepository.sumAllStockQuantity());
        response.setTotalOrders(customerOrderRepository.count());
        response.setTotalSales(customerOrderRepository.sumAllOrderTotals());
        return response;
    }

    @Transactional(readOnly = true)
    public DashboardInsightsResponse getInsights() {
        List<Product> products = productRepository.findAllByOrderByNameAsc();
        List<CustomerOrder> orders = customerOrderRepository.findAllByOrderByCreatedAtDesc();

        DashboardInsightsResponse response = new DashboardInsightsResponse();
        response.setGeneratedAt(LocalDateTime.now());
        response.setLowStockAlerts(buildLowStockAlerts(products));
        response.setSalesByCategory(buildSalesByCategory(orders));
        return response;
    }

    @Transactional(readOnly = true)
    public String exportInsightsCsv() {
        DashboardStatsResponse stats = getStats();
        DashboardInsightsResponse insights = getInsights();
        StringBuilder builder = new StringBuilder();

        appendCsvLine(builder, "Section", "Metric", "Value");
        appendCsvLine(builder, "Key Metrics", "Total Products", String.valueOf(stats.getTotalProducts()));
        appendCsvLine(builder, "Key Metrics", "Total Categories", String.valueOf(stats.getTotalCategories()));
        appendCsvLine(builder, "Key Metrics", "Low Stock Products", String.valueOf(stats.getLowStockProducts()));
        appendCsvLine(builder, "Key Metrics", "Total Inventory Units", String.valueOf(stats.getTotalInventoryUnits()));
        appendCsvLine(builder, "Key Metrics", "Total Orders", String.valueOf(stats.getTotalOrders()));
        appendCsvLine(builder, "Key Metrics", "Total Sales", String.valueOf(stats.getTotalSales()));
        builder.append(System.lineSeparator());

        appendCsvLine(builder, "Low Stock Alerts", "Product", "Category", "SKU", "Stock", "Threshold", "Suggested Restock", "Severity");
        for (DashboardAlertResponse alert : insights.getLowStockAlerts()) {
            appendCsvLine(
                    builder,
                    "Low Stock Alerts",
                    alert.getProductName(),
                    alert.getCategoryName(),
                    alert.getSku(),
                    String.valueOf(alert.getStockQuantity()),
                    String.valueOf(alert.getRestockThreshold()),
                    String.valueOf(alert.getSuggestedRestockQuantity()),
                    alert.getSeverity()
            );
        }
        builder.append(System.lineSeparator());

        appendCsvLine(builder, "Sales By Category", "Category", "Units Sold", "Revenue");
        for (DashboardCategorySalesResponse entry : insights.getSalesByCategory()) {
            appendCsvLine(
                    builder,
                    "Sales By Category",
                    entry.getCategoryName(),
                    String.valueOf(entry.getUnitsSold()),
                    String.valueOf(entry.getRevenue())
            );
        }

        return builder.toString();
    }

    private List<DashboardAlertResponse> buildLowStockAlerts(List<Product> products) {
        List<DashboardAlertResponse> alerts = new ArrayList<>();
        for (Product product : products) {
            if (!product.isActive() || product.getStockQuantity() > product.getRestockThreshold()) {
                continue;
            }

            DashboardAlertResponse response = new DashboardAlertResponse();
            response.setProductId(product.getId());
            response.setSku(product.getSku());
            response.setProductName(product.getName());
            response.setCategoryName(product.getCategory().getName());
            response.setStockQuantity(product.getStockQuantity());
            response.setRestockThreshold(product.getRestockThreshold());
            response.setSuggestedRestockQuantity(Math.max(product.getRestockThreshold() * 2, product.getRestockThreshold() + 4));
            response.setSeverity(product.getStockQuantity() == 0 ? "high" : product.getStockQuantity() <= 2 ? "medium" : "low");
            alerts.add(response);
        }

        return alerts.stream()
                .sorted((left, right) -> Integer.compare(left.getStockQuantity(), right.getStockQuantity()))
                .toList();
    }

    private List<DashboardCategorySalesResponse> buildSalesByCategory(List<CustomerOrder> orders) {
        Map<String, DashboardCategorySalesResponse> groupedSales = new LinkedHashMap<>();
        for (CustomerOrder order : orders) {
            for (OrderItem item : order.getItems()) {
                String categoryName = item.getProduct().getCategory().getName();
                DashboardCategorySalesResponse entry = groupedSales.computeIfAbsent(categoryName, key -> {
                    DashboardCategorySalesResponse response = new DashboardCategorySalesResponse();
                    response.setCategoryName(key);
                    response.setUnitsSold(0);
                    response.setRevenue(BigDecimal.ZERO);
                    return response;
                });

                entry.setUnitsSold(entry.getUnitsSold() + item.getQuantity());
                entry.setRevenue(entry.getRevenue().add(item.getLineTotal()));
            }
        }

        return groupedSales.values().stream()
                .sorted((left, right) -> right.getRevenue().compareTo(left.getRevenue()))
                .toList();
    }

    private void appendCsvLine(StringBuilder builder, String... values) {
        builder.append(
                Arrays.stream(values)
                        .map(this::escapeCsv)
                        .reduce((left, right) -> left + "," + right)
                        .orElse("")
        ).append(System.lineSeparator());
    }

    private String escapeCsv(String value) {
        String safeValue = value == null ? "" : value;
        return "\"" + safeValue.replace("\"", "\"\"") + "\"";
    }
}
