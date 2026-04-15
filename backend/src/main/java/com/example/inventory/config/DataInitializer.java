package com.example.inventory.config;

import com.example.inventory.dto.CategoryRequest;
import com.example.inventory.dto.CustomerCheckoutItemRequest;
import com.example.inventory.dto.CustomerCheckoutRequest;
import com.example.inventory.dto.CustomerRegisterRequest;
import com.example.inventory.dto.JobApplicationRequest;
import com.example.inventory.dto.ProductRequest;
import com.example.inventory.dto.ProductReviewRequest;
import com.example.inventory.dto.StockUpdateRequest;
import com.example.inventory.dto.SupportConversationRequest;
import com.example.inventory.dto.SupportMessageRequest;
import com.example.inventory.dto.VacancyRequest;
import com.example.inventory.model.AppUser;
import com.example.inventory.model.UserRole;
import com.example.inventory.repository.AppUserRepository;
import com.example.inventory.repository.CategoryRepository;
import com.example.inventory.repository.CustomerOrderRepository;
import com.example.inventory.repository.InventoryLogRepository;
import com.example.inventory.repository.JobApplicationRepository;
import com.example.inventory.repository.ProductRepository;
import com.example.inventory.repository.SupportConversationRepository;
import com.example.inventory.repository.VacancyRepository;
import com.example.inventory.service.CareerService;
import com.example.inventory.service.CategoryService;
import com.example.inventory.service.CustomerAccountService;
import com.example.inventory.service.CustomerOrderService;
import com.example.inventory.service.ProductReviewService;
import com.example.inventory.service.ProductService;
import com.example.inventory.service.SupportConversationService;
import com.example.inventory.service.WishlistService;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final String OPEN_DOODLES_BASE_URL = "https://opendoodles.s3-us-west-1.amazonaws.com/";

    private final AppUserRepository appUserRepository;
    private final CategoryService categoryService;
    private final ProductService productService;
    private final CustomerAccountService customerAccountService;
    private final CustomerOrderService customerOrderService;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final CustomerOrderRepository customerOrderRepository;
    private final InventoryLogRepository inventoryLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final WishlistService wishlistService;
    private final ProductReviewService productReviewService;
    private final CareerService careerService;
    private final SupportConversationService supportConversationService;
    private final VacancyRepository vacancyRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final SupportConversationRepository supportConversationRepository;
    private final JdbcTemplate jdbcTemplate;

    public DataInitializer(AppUserRepository appUserRepository,
                           CategoryService categoryService,
                           ProductService productService,
                           CustomerAccountService customerAccountService,
                           CustomerOrderService customerOrderService,
                           CategoryRepository categoryRepository,
                           ProductRepository productRepository,
                           CustomerOrderRepository customerOrderRepository,
                           InventoryLogRepository inventoryLogRepository,
                           PasswordEncoder passwordEncoder,
                           WishlistService wishlistService,
                           ProductReviewService productReviewService,
                           CareerService careerService,
                           SupportConversationService supportConversationService,
                           VacancyRepository vacancyRepository,
                           JobApplicationRepository jobApplicationRepository,
                           SupportConversationRepository supportConversationRepository,
                           JdbcTemplate jdbcTemplate) {
        this.appUserRepository = appUserRepository;
        this.categoryService = categoryService;
        this.productService = productService;
        this.customerAccountService = customerAccountService;
        this.customerOrderService = customerOrderService;
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.customerOrderRepository = customerOrderRepository;
        this.inventoryLogRepository = inventoryLogRepository;
        this.passwordEncoder = passwordEncoder;
        this.wishlistService = wishlistService;
        this.productReviewService = productReviewService;
        this.careerService = careerService;
        this.supportConversationService = supportConversationService;
        this.vacancyRepository = vacancyRepository;
        this.jobApplicationRepository = jobApplicationRepository;
        this.supportConversationRepository = supportConversationRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        ensureLegacySchemaCompatibility();
        seedAdminUser();
        seedHrUser();
        backfillExistingProducts();
        seedCategories();
        seedProductsAndLogs();
        seedExpandedCatalog();
        seedCustomerAndOrder();
        seedWishlistAndReviews();
        seedVacancies();
        seedApplications();
        seedSupportConversations();
    }

    private void ensureLegacySchemaCompatibility() {
        if (columnExists("APP_USERS", "ROLE")) {
            jdbcTemplate.execute("alter table app_users alter column role varchar(20)");
        }
    }

    private boolean columnExists(String tableName, String columnName) {
        Integer count = jdbcTemplate.queryForObject(
                "select count(*) from information_schema.columns where table_name = ? and column_name = ?",
                Integer.class,
                tableName,
                columnName
        );
        return count != null && count > 0;
    }

    private void seedAdminUser() {
        AppUser existingAdmin = appUserRepository.findByUsernameIgnoreCase("admin").orElse(null);
        if (existingAdmin != null) {
            boolean changed = false;
            if (!"KEFE Admin".equals(existingAdmin.getFullName())) {
                existingAdmin.setFullName("KEFE Admin");
                changed = true;
            }
            if (!"admin@kefe.ch".equalsIgnoreCase(existingAdmin.getEmail())) {
                existingAdmin.setEmail("admin@kefe.ch");
                changed = true;
            }
            if (existingAdmin.getRole() != UserRole.ADMIN) {
                existingAdmin.setRole(UserRole.ADMIN);
                changed = true;
            }
            if (changed) {
                appUserRepository.save(existingAdmin);
            }
            return;
        }

        AppUser admin = new AppUser();
        admin.setFullName("KEFE Admin");
        admin.setUsername("admin");
        admin.setEmail("admin@kefe.ch");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setRole(UserRole.ADMIN);
        appUserRepository.save(admin);
    }

    private void seedHrUser() {
        AppUser existingHr = appUserRepository.findByUsernameIgnoreCase("hr").orElse(null);
        if (existingHr != null) {
            boolean changed = false;
            if (!"KEFE HR".equals(existingHr.getFullName())) {
                existingHr.setFullName("KEFE HR");
                changed = true;
            }
            if (!"hr@kefe.ch".equalsIgnoreCase(existingHr.getEmail())) {
                existingHr.setEmail("hr@kefe.ch");
                changed = true;
            }
            if (existingHr.getRole() != UserRole.HR) {
                existingHr.setRole(UserRole.HR);
                changed = true;
            }
            if (changed) {
                appUserRepository.save(existingHr);
            }
            return;
        }

        AppUser hr = new AppUser();
        hr.setFullName("KEFE HR");
        hr.setUsername("hr");
        hr.setEmail("hr@kefe.ch");
        hr.setPassword(passwordEncoder.encode("hr123"));
        hr.setRole(UserRole.HR);
        appUserRepository.save(hr);
    }

    private void seedCategories() {
        if (shouldRefreshLegacySeedCatalog()) {
            clearLegacyCatalogData();
        }

        if (categoryRepository.count() > 0) {
            return;
        }

        categoryService.createCategory(buildCategory("Hair Care", "Shampoo, conditioner, scalp treatments, and everyday hair rituals."));
        categoryService.createCategory(buildCategory("Skin Care", "Gentle cleansers, serums, creams, and hydration essentials."));
        categoryService.createCategory(buildCategory("Bath & Body", "Body care, hand care, bath soaks, and shower-friendly basics."));
        categoryService.createCategory(buildCategory("Wellness Rituals", "Comfort-first self-care extras for calmer mornings and evenings."));
    }

    private void backfillExistingProducts() {
        productRepository.findAll().forEach(product -> {
            boolean changed = false;

            if (product.getSku() == null || product.getSku().isBlank()) {
                product.setSku(buildSku(product.getName()));
                changed = true;
            }
            if (product.getBarcode() == null || product.getBarcode().isBlank()) {
                product.setBarcode(buildBarcode(product.getName()));
                changed = true;
            }
            if (product.getRestockThreshold() == null) {
                product.setRestockThreshold(5);
                changed = true;
            }
            if (product.getCreatedAt() == null) {
                long offset = product.getId() == null ? 1L : Math.max(1L, product.getId());
                product.setCreatedAt(LocalDateTime.now().minusDays(offset));
                changed = true;
            }

            if (changed) {
                productRepository.save(product);
            }
        });
    }

    private void seedProductsAndLogs() {
        if (productRepository.count() > 0) {
            return;
        }

        Map<String, Long> categoryIds = new HashMap<>();
        categoryRepository.findAll().forEach(category -> categoryIds.put(category.getName(), category.getId()));

        Long shampooId = productService.createProduct(buildProduct(
                "Petting Shampoo",
                "A sulfate-free shampoo that cleanses gently while helping dry or stressed hair feel soft and fresh.",
                new BigDecimal("18.90"),
                12,
                buildDoodleUrl("petting"),
                true,
                categoryIds.get("Hair Care")
        )).getId();

        Long conditionerId = productService.createProduct(buildProduct(
                "Loving Conditioner",
                "A smoothing conditioner designed to soften lengths, tame frizz, and leave hair easier to brush.",
                new BigDecimal("19.90"),
                7,
                buildDoodleUrl("loving"),
                true,
                categoryIds.get("Hair Care")
        )).getId();

        Long scalpSerumId = productService.createProduct(buildProduct(
                "Selfie Scalp Serum",
                "A lightweight leave-in scalp serum with rosemary-inspired care for a refreshed, balanced feel.",
                new BigDecimal("26.50"),
                3,
                buildDoodleUrl("selfie"),
                true,
                categoryIds.get("Hair Care")
        )).getId();

        Long cleansingGelId = productService.createProduct(buildProduct(
                "Reading Cleansing Gel",
                "A soft daily cleanser that lifts away sunscreen and makeup without leaving the skin tight.",
                new BigDecimal("14.90"),
                15,
                buildDoodleUrl("reading-side"),
                true,
                categoryIds.get("Skin Care")
        )).getId();

        Long vitaminMistId = productService.createProduct(buildProduct(
                "Levitate Morning Mist",
                "A brightening facial mist for a quick freshen-up between routines, work blocks, or travel.",
                new BigDecimal("16.90"),
                5,
                buildDoodleUrl("levitate"),
                true,
                categoryIds.get("Skin Care")
        )).getId();

        Long barrierCreamId = productService.createProduct(buildProduct(
                "Groovy Barrier Cream",
                "A rich but comfortable face cream that helps lock in moisture for day or night use.",
                new BigDecimal("28.90"),
                24,
                buildDoodleUrl("groovy"),
                true,
                categoryIds.get("Skin Care")
        )).getId();

        Long bodyLotionId = productService.createProduct(buildProduct(
                "Plant Body Lotion",
                "A silky body lotion with a soft herbal scent for post-shower hydration and everyday comfort.",
                new BigDecimal("17.50"),
                0,
                buildDoodleUrl("plant"),
                true,
                categoryIds.get("Bath & Body")
        )).getId();

        Long handCreamId = productService.createProduct(buildProduct(
                "Coffee Hand Cream",
                "A fast-absorbing hand cream that softens dry skin without leaving a greasy finish.",
                new BigDecimal("8.90"),
                18,
                buildDoodleUrl("coffee"),
                true,
                categoryIds.get("Bath & Body")
        )).getId();

        Long bathSoakId = productService.createProduct(buildProduct(
                "Laying Bath Soak",
                "A mineral-rich bath soak with a calming lavender profile for slower evenings and deeper unwinding.",
                new BigDecimal("22.90"),
                10,
                buildDoodleUrl("laying"),
                true,
                categoryIds.get("Bath & Body")
        )).getId();

        Long pillowSprayId = productService.createProduct(buildProduct(
                "Sitting Pillow Spray",
                "A bedside spray with a clean lavender-cedar mood to make night routines feel calmer and more intentional.",
                new BigDecimal("21.90"),
                4,
                buildDoodleUrl("sitting-reading"),
                true,
                categoryIds.get("Wellness Rituals")
        )).getId();

        Long candleId = productService.createProduct(buildProduct(
                "Rolling Candle",
                "A slow-burning soy candle with warm amber and soft woods for cozy self-care evenings at home.",
                new BigDecimal("32.00"),
                6,
                buildDoodleUrl("rolling"),
                true,
                categoryIds.get("Wellness Rituals")
        )).getId();

        productService.updateProductStock(shampooId, buildStockUpdate(10, "Weekend promo moved a few bottles faster than expected."));
        productService.updateProductStock(conditionerId, buildStockUpdate(11, "A fresh salon-style shipment arrived this morning."));
        productService.updateProductStock(scalpSerumId, buildStockUpdate(2, "One tester bottle was opened for the shelf display."));
        productService.updateProductStock(vitaminMistId, buildStockUpdate(9, "A restock was added after the morning rush."));
        productService.updateProductStock(barrierCreamId, buildStockUpdate(20, "Best-seller shelf was replenished after several online orders."));
        productService.updateProductStock(bodyLotionId, buildStockUpdate(14, "Body lotion came back in after a delayed supplier delivery."));
        productService.updateProductStock(pillowSprayId, buildStockUpdate(1, "Only one bottle remains from the latest sleep ritual batch."));
        productService.updateProductStock(cleansingGelId, buildStockUpdate(17, "Extra cleanser stock was added for a skincare bundle offer."));
        productService.updateProductStock(handCreamId, buildStockUpdate(16, "Hand cream stock dipped after the checkout counter feature."));
        productService.updateProductStock(bathSoakId, buildStockUpdate(13, "A small refill arrived for the evening ritual collection."));
    }

    private void seedCustomerAndOrder() {
        AppUser existingCustomer = appUserRepository.findByUsernameIgnoreCase("lina").orElse(null);
        if (existingCustomer == null) {
            customerAccountService.registerCustomer(buildCustomer(
                    "Lina Meyer",
                    "lina",
                    "lina@kefe.ch",
                    "customer123"
            ));
        } else if (!"lina@kefe.ch".equalsIgnoreCase(existingCustomer.getEmail())) {
            existingCustomer.setEmail("lina@kefe.ch");
            appUserRepository.save(existingCustomer);
        }

        if (customerOrderRepository.count() > 0) {
            return;
        }

        Map<String, Long> productIds = new HashMap<>();
        productRepository.findAll().forEach(product -> productIds.put(product.getName(), product.getId()));

        List<CustomerCheckoutItemRequest> items = new ArrayList<>();
        items.add(buildCheckoutItem(productIds.get("Petting Shampoo"), 1));
        items.add(buildCheckoutItem(productIds.get("Groovy Barrier Cream"), 1));
        items.add(buildCheckoutItem(productIds.get("Sitting Pillow Spray"), 1));

        CustomerCheckoutRequest request = new CustomerCheckoutRequest();
        request.setItems(items);
        request.setDeliveryAddress("Aeschenplatz 8, 4052 Basel");
        request.setNote("Please ring once and leave the parcel with the reception desk if the front door is unattended.");

        customerOrderService.placeOrder("lina", request);
    }

    private void seedExpandedCatalog() {
        if (productRepository.count() >= 65) {
            return;
        }

        Map<String, Long> categoryIds = new HashMap<>();
        categoryRepository.findAll().forEach(category -> categoryIds.put(category.getName(), category.getId()));

        Set<String> existingProductNames = new HashSet<>();
        productRepository.findAll().forEach(product -> existingProductNames.add(product.getName()));

        seedProductSeries(
                "Hair Care",
                categoryIds,
                existingProductNames,
                new String[] {
                        "Cedar Balance Shampoo",
                        "Velvet Repair Conditioner",
                        "Bloom Scalp Essence",
                        "Cloud Soft Hair Mask",
                        "Morning Root Lift Spray",
                        "Silk Finish Leave-In Cream",
                        "Quiet Shine Hair Oil",
                        "Botanical Reset Scrub",
                        "Volume Air Foam",
                        "Drift Detangling Mist",
                        "Calm Wash Bar",
                        "Soft Hold Curl Cream",
                        "Midnight Repair Serum",
                        "Pure Strand Elixir"
                },
                new String[] {"petting", "loving", "selfie", "reading-side"},
                new BigDecimal("15.90"),
                9
        );

        seedProductSeries(
                "Skin Care",
                categoryIds,
                existingProductNames,
                new String[] {
                        "Dew Daily Cleanser",
                        "Quartz Micellar Milk",
                        "Golden Hour Serum",
                        "Barrier Recovery Balm",
                        "Glow Reset Toner",
                        "Cloud Veil Moisturizer",
                        "Night Water Cream",
                        "Peptide Eye Gel",
                        "Comfort Cleansing Oil",
                        "Fresh Start Exfoliant",
                        "Blue Tansy Essence",
                        "Hydra Silk Sheet Mask",
                        "Calm Mineral SPF",
                        "Rose Clay Polish"
                },
                new String[] {"levitate", "groovy", "selfie", "reading-side"},
                new BigDecimal("18.50"),
                11
        );

        seedProductSeries(
                "Bath & Body",
                categoryIds,
                existingProductNames,
                new String[] {
                        "Neroli Body Cleanse",
                        "Salt Air Shower Gel",
                        "Velvet Hand Wash",
                        "Cocoa Soft Body Butter",
                        "Quiet Coast Body Scrub",
                        "Daily Hand Lotion",
                        "Fig Leaf Body Oil",
                        "Amber Bath Milk",
                        "Citrus Steam Shower Tabs",
                        "Soft Cotton Hand Balm",
                        "Satin Body Cream",
                        "Coastal Rinse Body Wash",
                        "Evening Soak Crystals",
                        "Marble Hand Serum"
                },
                new String[] {"plant", "coffee", "laying", "rolling"},
                new BigDecimal("11.90"),
                13
        );

        seedProductSeries(
                "Wellness Rituals",
                categoryIds,
                existingProductNames,
                new String[] {
                        "Slow Morning Tea Lights",
                        "Stillness Reed Diffuser",
                        "Deep Rest Sleep Mask",
                        "Quiet Linen Mist",
                        "Calm Journal Set",
                        "Reset Herbal Tea",
                        "Warm Stone Candle",
                        "Soft Focus Matcha Blend",
                        "Evening Breath Roll-On",
                        "Rest Ritual Incense",
                        "Peace Pulse Balm",
                        "Grounding Room Spray",
                        "Moonlight Tea Mug",
                        "Sunrise Ritual Cards"
                },
                new String[] {"sitting-reading", "rolling", "loving", "levitate"},
                new BigDecimal("14.50"),
                7
        );
    }

    private void seedProductSeries(String categoryName,
                                   Map<String, Long> categoryIds,
                                   Set<String> existingProductNames,
                                   String[] productNames,
                                   String[] imageNames,
                                   BigDecimal basePrice,
                                   int baseStock) {
        Long categoryId = categoryIds.get(categoryName);
        if (categoryId == null) {
            return;
        }

        for (int index = 0; index < productNames.length; index++) {
            String name = productNames[index];
            if (existingProductNames.contains(name)) {
                continue;
            }

            BigDecimal price = basePrice.add(BigDecimal.valueOf((index % 5L) * 1.8 + (index / 5L) * 0.7));
            int stock = Math.max(2, baseStock + (index % 4) - (index % 3));
            String imageName = imageNames[index % imageNames.length];

            productService.createProduct(buildProduct(
                    name,
                    buildGeneratedDescription(categoryName, name, index),
                    price.setScale(2, java.math.RoundingMode.HALF_UP),
                    stock,
                    buildDoodleUrl(imageName),
                    true,
                    categoryId
            ));
            existingProductNames.add(name);
        }
    }

    private String buildGeneratedDescription(String categoryName, String name, int index) {
        return switch (categoryName) {
            case "Hair Care" -> switch (index % 4) {
                case 0 -> "A lightweight hair care essential designed to keep the scalp balanced and lengths soft throughout the week.";
                case 1 -> "A smoothing formula that supports everyday shine, easy detangling, and a clean finish without heaviness.";
                case 2 -> "A targeted treatment for dry roots, stressed lengths, or in-between wash days when hair needs extra care.";
                default -> "A salon-inspired routine product that helps hair feel fresh, comfortable, and easier to style daily.";
            };
            case "Skin Care" -> switch (index % 4) {
                case 0 -> "A gentle skincare staple that supports a comfortable routine and leaves the skin feeling fresh rather than tight.";
                case 1 -> "A hydration-focused formula created to layer well with daily routines and support a calmer, softer finish.";
                case 2 -> "A treatment-led product that helps improve comfort, bounce, and a visibly smoother feel over time.";
                default -> "A complexion-friendly daily product designed for easy use, clear placement, and reliable repeat application.";
            };
            case "Bath & Body" -> switch (index % 4) {
                case 0 -> "A body care essential that adds softness, comfort, and a clean finish to showers, sinks, and evening routines.";
                case 1 -> "A nourishing formula made to keep skin feeling conditioned without leaving an overly heavy residue.";
                case 2 -> "A texture-led bath and body product created to make everyday care feel calmer and more considered.";
                default -> "A practical body ritual staple with a gentle scent profile and a comfortable finish for repeat use.";
            };
            default -> switch (index % 4) {
                case 0 -> "A small wellness ritual designed to slow the pace, soften the atmosphere, and support a more intentional routine.";
                case 1 -> "A comfort-focused product that fits naturally into morning resets, evening wind-downs, or gifting moments.";
                case 2 -> "A lifestyle-led ritual piece created to bring warmth, calm, and a little more structure to quiet routines.";
                default -> "A thoughtful ritual product that pairs well with slower evenings, mindful mornings, and at-home reset moments.";
            };
        };
    }

    private boolean shouldRefreshLegacySeedCatalog() {
        if (productRepository.count() == 0) {
            return false;
        }

        Set<String> legacyProductNames = Set.of(
                "Student Laptop",
                "Noise-Cancelling Headphones",
                "USB-C Hub",
                "Java Programming Handbook",
                "Networking Fundamentals",
                "Granola Bars Pack",
                "Cold Brew Coffee",
                "A4 Notebook",
                "Fine Liner Pen Set",
                "LED Desk Lamp",
                "Botanical Repair Shampoo",
                "Silk Balance Conditioner",
                "Scalp Renewal Serum",
                "Rosewater Cleansing Gel",
                "Vitamin C Morning Mist",
                "Hydration Barrier Cream",
                "Calming Body Lotion",
                "Nourishing Hand Cream",
                "Lavender Mineral Bath Soak",
                "Sleep Ritual Pillow Spray",
                "Quiet Evening Scented Candle"
        );

        Set<String> existingProductNames = new HashSet<>();
        productRepository.findAll().forEach(product -> existingProductNames.add(product.getName()));
        return existingProductNames.stream().anyMatch(legacyProductNames::contains);
    }

    private void clearLegacyCatalogData() {
        customerOrderRepository.deleteAll();
        inventoryLogRepository.deleteAll();
        productRepository.deleteAll();
        categoryRepository.deleteAll();
    }

    private CategoryRequest buildCategory(String name, String description) {
        CategoryRequest request = new CategoryRequest();
        request.setName(name);
        request.setDescription(description);
        return request;
    }

    private String buildDoodleUrl(String imageName) {
        return OPEN_DOODLES_BASE_URL + imageName + ".svg";
    }

    private ProductRequest buildProduct(String name,
                                        String description,
                                        BigDecimal price,
                                        Integer stockQuantity,
                                        String imageUrl,
                                        Boolean active,
                                        Long categoryId) {
        ProductRequest request = new ProductRequest();
        request.setName(name);
        request.setDescription(description);
        request.setPrice(price);
        request.setStockQuantity(stockQuantity);
        request.setImageUrl(imageUrl);
        request.setSku(buildSku(name));
        request.setBarcode(buildBarcode(name));
        request.setRestockThreshold(Math.max(3, Math.min(8, Math.max(1, stockQuantity / 2))));
        request.setActive(active);
        request.setCategoryId(categoryId);
        return request;
    }

    private void seedWishlistAndReviews() {
        Map<String, Long> productIds = new HashMap<>();
        productRepository.findAll().forEach(product -> productIds.put(product.getName(), product.getId()));

        if (productIds.containsKey("Petting Shampoo")) {
            wishlistService.addToWishlist("lina", productIds.get("Petting Shampoo"));
        }
        if (productIds.containsKey("Groovy Barrier Cream")) {
            wishlistService.addToWishlist("lina", productIds.get("Groovy Barrier Cream"));
        }
        if (productIds.containsKey("Petting Shampoo")) {
            productReviewService.upsertReview("lina", productIds.get("Petting Shampoo"),
                    buildReview(5, "Soft and easy to use", "Feels gentle on the scalp and still cleans really well."));
        }
        if (productIds.containsKey("Sitting Pillow Spray")) {
            productReviewService.upsertReview("lina", productIds.get("Sitting Pillow Spray"),
                    buildReview(4, "Calming evening pick", "Lovely bedside scent and a nice part of the night routine."));
        }
    }

    private void seedVacancies() {
        if (vacancyRepository.count() > 0) {
            return;
        }

        careerService.createVacancy(buildVacancy(
                "Customer Experience Specialist",
                "Customer Care",
                "Basel, Switzerland",
                "Full-time",
                "Hybrid",
                "CHF 58,000 - 68,000",
                "Guide customers through orders, delivery questions, and product choices with a calm, polished service style.",
                "You will own day-to-day customer communication across order support, delivery clarification, and product questions. The role combines inbox management, process thinking, and close coordination with operations so customers receive fast, accurate answers.",
                "Handle customer requests across order changes, delivery issues, and account questions.\nCoordinate with operations when shipments, stock, or refunds need follow-up.\nTurn repeated support patterns into clearer help content and reusable workflows.",
                "2+ years of customer support or service operations experience.\nStrong written communication in English; German is a plus.\nA calm, organized style with good judgment in customer-facing decisions.",
                "Hybrid work model, product allowance, development budget, and a small team with direct ownership.",
                true,
                "OPEN"
        ));

        careerService.createVacancy(buildVacancy(
                "Junior Merchandising Coordinator",
                "Merchandising",
                "Basel, Switzerland",
                "Full-time",
                "On-site",
                "CHF 54,000 - 62,000",
                "Support product launches, collection updates, and merchandising decisions across the KEFE storefront.",
                "This role helps shape how products appear on site, from collection planning to launch support and merchandising checks. It is a strong fit for someone who enjoys product storytelling and structured operational work.",
                "Prepare collection updates and seasonal launches.\nReview product data for completeness and consistency.\nCoordinate closely with operations and content on merchandising timing.",
                "1+ years in merchandising, retail operations, or digital commerce.\nComfort with structured catalog work and visual attention to detail.\nAn interest in self-care, lifestyle, or premium retail presentation.",
                "Flexible schedule, team mentorship, and close exposure to product launches and category planning.",
                true,
                "OPEN"
        ));

        careerService.createVacancy(buildVacancy(
                "Operations and Fulfillment Lead",
                "Operations",
                "Zurich, Switzerland",
                "Full-time",
                "On-site",
                "CHF 72,000 - 84,000",
                "Own order flow, fulfillment reliability, and process improvements across customer delivery operations.",
                "The Operations and Fulfillment Lead ensures orders move smoothly from purchase to dispatch while improving reliability, reporting, and internal coordination. The role is highly cross-functional and works closely with customer care and merchandising.",
                "Lead fulfillment workflows and dispatch planning.\nMonitor operational bottlenecks and introduce practical process improvements.\nSupport inventory reliability and order-quality standards.",
                "Experience in operations, logistics, or fulfillment management.\nConfidence with workflow ownership and data-informed decision-making.\nStrong communication across support, merchandising, and admin teams.",
                "Leadership scope, operational ownership, and the chance to shape the long-term logistics model.",
                false,
                "OPEN"
        ));

        careerService.createVacancy(buildVacancy(
                "People and Talent Coordinator",
                "People",
                "Basel, Switzerland",
                "Part-time",
                "Hybrid",
                "CHF 36,000 - 44,000",
                "Help manage recruiting, applications, onboarding coordination, and internal people operations.",
                "This role supports the growing people function at KEFE with recruiting coordination, candidate communication, and structured hiring operations. It works closely with the HR account and hiring stakeholders across the business.",
                "Coordinate applications, interviews, and candidate communication.\nKeep hiring materials current across the careers page and internal workflows.\nSupport onboarding preparation and people operations administration.",
                "Experience in recruiting coordination, HR support, or office operations.\nClear communication and a highly organized working style.\nComfort handling confidential information with care.",
                "Flexible part-time schedule, people operations ownership, and room to grow with the team.",
                false,
                "OPEN"
        ));
    }

    private void seedApplications() {
        if (jobApplicationRepository.count() > 0) {
            return;
        }

        List<com.example.inventory.dto.VacancyResponse> vacancies = careerService.getOpenVacancies();
        if (vacancies.isEmpty()) {
            return;
        }

        careerService.applyToVacancy("lina", vacancies.get(0).getId(),
                buildApplication("079 555 41 20", "Basel", "https://www.linkedin.com/in/lina-meyer",
                        "I enjoy customer-facing work where process quality matters. KEFE feels like a strong fit because the brand tone and service approach are both calm, precise, and human."));

        if (vacancies.size() > 1) {
            careerService.applyToVacancy("lina", vacancies.get(1).getId(),
                    buildApplication("079 555 41 20", "Basel",
                            "https://www.linkedin.com/in/lina-meyer",
                            "I have a strong eye for product presentation and enjoy structured catalog work. I would be excited to support launches, collection updates, and day-to-day merchandising operations at KEFE."));
        }
    }

    private void seedSupportConversations() {
        if (supportConversationRepository.count() > 0) {
            return;
        }

        SupportConversationRequest delayedDeliveryRequest = new SupportConversationRequest();
        delayedDeliveryRequest.setSubject("Delivery status not updating");
        delayedDeliveryRequest.setCategory("Delivery");
        delayedDeliveryRequest.setMessage("Hi KEFE, my latest order still shows as processing and I wanted to confirm whether it is already on the way.");
        Long firstConversationId = supportConversationService.createConversation("lina", delayedDeliveryRequest).getId();

        SupportMessageRequest adminReply = new SupportMessageRequest();
        adminReply.setMessage("Thanks for reaching out. I checked the order and it is currently in the dispatch queue. You should see a shipping update later today.");
        supportConversationService.addStaffMessage("admin", firstConversationId, adminReply);

        SupportConversationRequest productAdviceRequest = new SupportConversationRequest();
        productAdviceRequest.setSubject("Question about barrier cream for dry skin");
        productAdviceRequest.setCategory("Product advice");
        productAdviceRequest.setMessage("Could you tell me whether the Groovy Barrier Cream is better suited for daytime use or for an evening routine?");
        supportConversationService.createConversation("lina", productAdviceRequest);
    }

    private StockUpdateRequest buildStockUpdate(Integer newStockQuantity, String note) {
        StockUpdateRequest request = new StockUpdateRequest();
        request.setNewStockQuantity(newStockQuantity);
        request.setNote(note);
        return request;
    }

    private CustomerRegisterRequest buildCustomer(String fullName,
                                                  String username,
                                                  String email,
                                                  String password) {
        CustomerRegisterRequest request = new CustomerRegisterRequest();
        request.setFullName(fullName);
        request.setUsername(username);
        request.setEmail(email);
        request.setPassword(password);
        return request;
    }

    private CustomerCheckoutItemRequest buildCheckoutItem(Long productId, Integer quantity) {
        CustomerCheckoutItemRequest item = new CustomerCheckoutItemRequest();
        item.setProductId(productId);
        item.setQuantity(quantity);
        return item;
    }

    private ProductReviewRequest buildReview(Integer rating, String title, String comment) {
        ProductReviewRequest request = new ProductReviewRequest();
        request.setRating(rating);
        request.setTitle(title);
        request.setComment(comment);
        return request;
    }

    private VacancyRequest buildVacancy(String title,
                                        String department,
                                        String location,
                                        String employmentType,
                                        String schedule,
                                        String salaryRange,
                                        String summary,
                                        String description,
                                        String responsibilities,
                                        String requirements,
                                        String benefits,
                                        boolean featured,
                                        String status) {
        VacancyRequest request = new VacancyRequest();
        request.setTitle(title);
        request.setDepartment(department);
        request.setLocation(location);
        request.setEmploymentType(employmentType);
        request.setSchedule(schedule);
        request.setSalaryRange(salaryRange);
        request.setSummary(summary);
        request.setDescription(description);
        request.setResponsibilities(responsibilities);
        request.setRequirements(requirements);
        request.setBenefits(benefits);
        request.setFeatured(featured);
        request.setStatus(status);
        return request;
    }

    private JobApplicationRequest buildApplication(String phone,
                                                   String city,
                                                   String portfolioUrl,
                                                   String coverLetter) {
        JobApplicationRequest request = new JobApplicationRequest();
        request.setPhone(phone);
        request.setCity(city);
        request.setPortfolioUrl(portfolioUrl);
        request.setCoverLetter(coverLetter);
        return request;
    }

    private String buildSku(String name) {
        String normalized = name.toUpperCase()
                .replaceAll("[^A-Z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
        return "KEFE-" + normalized;
    }

    private String buildBarcode(String name) {
        long hash = Math.abs(name.hashCode());
        return "76" + String.format("%011d", hash % 100_000_000_000L);
    }
}
