(function () {
    const CART_STORAGE_KEY = "kefeCart";
    const CART_STORAGE = window.sessionStorage;
    let allProducts = [];
    let pollingHandle = null;
    let catalogEventSource = null;
    let liveUpdatesUsingPollingFallback = false;
    let lockedScrollY = 0;
    let overlayScrollLocked = false;
    let previousScrollBehavior = "";
    const wishlistProductIds = new Set();
    const productCardRegistry = new Map();
    const cartItemRegistry = new Map();
    const catalogPagination = {
        page: 1,
        pageSize: 9,
        showAll: false,
        expanded: false
    };

    function formatCurrency(value) {
        return new Intl.NumberFormat("de-CH", {
            style: "currency",
            currency: "CHF"
        }).format(value);
    }

    function formatRating(value) {
        const numericValue = Number(value);
        if (!numericValue) {
            return "New";
        }
        return `${numericValue.toFixed(1)} / 5`;
    }

    function getProductImageAsset(imageUrl) {
        if (window.SiteUi && typeof window.SiteUi.getProductImageAsset === "function") {
            return window.SiteUi.getProductImageAsset(imageUrl);
        }

        return {
            src: imageUrl,
            className: ""
        };
    }

    function applyProductImageToElement(imageElement, imageUrl, altText) {
        if (window.SiteUi && typeof window.SiteUi.applyProductImageToElement === "function") {
            window.SiteUi.applyProductImageToElement(imageElement, imageUrl, altText);
            return;
        }

        const imageAsset = getProductImageAsset(imageUrl);
        imageElement.src = imageAsset.src;
        imageElement.alt = altText;
        imageElement.className = imageAsset.className;
    }

    function createEmptyStateElement(message) {
        const element = document.createElement("div");
        element.className = "empty-state";
        element.textContent = message;
        return element;
    }

    function syncContainerChildren(container, nextChildren) {
        const currentChildren = Array.from(container.children);
        const needsReorder = currentChildren.length !== nextChildren.length
            || nextChildren.some((child, index) => currentChildren[index] !== child);

        if (!needsReorder) {
            return;
        }

        const fragment = document.createDocumentFragment();
        nextChildren.forEach((child) => fragment.appendChild(child));
        container.replaceChildren(fragment);
    }

    function pruneProductCardRegistry() {
        const activeProductIds = new Set(allProducts.map((product) => product.id));
        Array.from(productCardRegistry.keys()).forEach((productId) => {
            if (!activeProductIds.has(productId)) {
                productCardRegistry.delete(productId);
            }
        });
    }

    function resolveStockBadgeClass(product) {
        return product.stockQuantity === 0
            ? "badge-danger"
            : product.stockQuantity <= (product.restockThreshold ?? 5)
                ? "badge-warning"
                : "badge-success";
    }

    function isCustomerLoggedIn() {
        return Boolean(window.Auth && window.Auth.getCredentials("customer"));
    }

    function isProductWishlisted(productId) {
        return wishlistProductIds.has(Number(productId));
    }

    function getFilteredProducts() {
        const searchValue = document.getElementById("search-input").value.trim().toLowerCase();
        const categoryValue = document.getElementById("category-filter").value;
        const sortValue = document.getElementById("sort-filter").value;

        let filteredProducts = [...allProducts];

        if (searchValue) {
            filteredProducts = filteredProducts.filter((product) =>
                product.name.toLowerCase().includes(searchValue)
            );
        }

        if (categoryValue) {
            filteredProducts = filteredProducts.filter((product) => String(product.categoryId) === categoryValue);
        }

        if (sortValue === "price-asc") {
            filteredProducts.sort((left, right) => left.price - right.price);
        } else if (sortValue === "price-desc") {
            filteredProducts.sort((left, right) => right.price - left.price);
        } else {
            filteredProducts.sort((left, right) => left.name.localeCompare(right.name));
        }

        return filteredProducts;
    }

    function createProductCardElement(product) {
        const card = document.createElement("article");
        card.className = "product-card storefront-card";
        card.innerHTML = `
            <img data-role="product-image" loading="lazy" draggable="false">
            <div class="product-card-content">
                <div class="product-card-title">
                    <h3 data-role="product-name"></h3>
                    <p data-role="product-category"></p>
                </div>
                <div class="product-price-line">
                    <span class="price-label">Price</span>
                    <span class="price" data-role="product-price"></span>
                </div>
                <p class="product-description" data-role="product-description"></p>
                <div class="badge-row">
                    <span class="badge" data-role="product-stock-status"></span>
                    <span class="badge" data-role="product-availability"></span>
                </div>
                <div class="product-meta-line">
                    <p class="product-rating-copy">Rating: <strong data-role="product-rating"></strong></p>
                    <p class="product-stock-copy"><strong data-role="product-stock-quantity"></strong> left in stock</p>
                </div>
                <div class="product-card-actions">
                    <button class="link-button read-more-button" type="button" data-role="read-more-button">
                        <span class="material-symbols-outlined" aria-hidden="true">visibility</span>
                        <span>View</span>
                    </button>
                    <button class="link-button wishlist-button" type="button" data-role="wishlist-button">
                        <span class="material-symbols-outlined" aria-hidden="true" data-role="wishlist-icon"></span>
                        <span data-role="wishlist-label"></span>
                    </button>
                    <button class="button add-to-cart-button" type="button" data-role="add-to-cart-button">
                        <span class="material-symbols-outlined" aria-hidden="true" data-role="add-to-cart-icon"></span>
                        <span data-role="add-to-cart-label"></span>
                    </button>
                </div>
            </div>
        `;

        const imageElement = card.querySelector('[data-role="product-image"]');
        applyProductImageToElement(imageElement, product.imageUrl, product.name);
        imageElement.draggable = false;

        card.querySelector('[data-role="read-more-button"]').addEventListener("click", () => {
            openProductModal(card.dataset.productId);
        });
        card.querySelector('[data-role="add-to-cart-button"]').addEventListener("click", () => {
            addToCart(card.dataset.productId);
        });
        card.querySelector('[data-role="wishlist-button"]').addEventListener("click", () => {
            toggleWishlist(card.dataset.productId);
        });

        updateProductCardElement(card, product);
        return card;
    }

    function updateProductCardElement(card, product) {
        card.dataset.productId = String(product.id);

        const imageElement = card.querySelector('[data-role="product-image"]');
        if (imageElement) {
            applyProductImageToElement(imageElement, product.imageUrl, product.name);
        }

        card.querySelector('[data-role="product-name"]').textContent = product.name;
        card.querySelector('[data-role="product-category"]').textContent = product.categoryName;
        card.querySelector('[data-role="product-price"]').textContent = formatCurrency(product.price);
        card.querySelector('[data-role="product-description"]').textContent = product.description;
        card.querySelector('[data-role="product-rating"]').textContent = `${formatRating(product.averageRating)}${product.reviewCount ? ` · ${product.reviewCount} reviews` : ""}`;
        card.querySelector('[data-role="product-stock-quantity"]').textContent = product.stockQuantity;

        const stockBadge = card.querySelector('[data-role="product-stock-status"]');
        stockBadge.className = `badge ${resolveStockBadgeClass(product)}`;
        stockBadge.textContent = product.stockStatus;

        const availabilityBadge = card.querySelector('[data-role="product-availability"]');
        availabilityBadge.className = `badge ${product.available ? "badge-success" : "badge-danger"}`;
        availabilityBadge.textContent = product.available ? "Available now" : "Out of stock";

        const addToCartButton = card.querySelector('[data-role="add-to-cart-button"]');
        addToCartButton.disabled = product.stockQuantity === 0;

        const addToCartIcon = card.querySelector('[data-role="add-to-cart-icon"]');
        addToCartIcon.textContent = product.stockQuantity === 0 ? "block" : "add_shopping_cart";

        const addToCartLabel = card.querySelector('[data-role="add-to-cart-label"]');
        addToCartLabel.textContent = product.stockQuantity === 0 ? "Sold Out" : "Add to Cart";

        const wishlistButton = card.querySelector('[data-role="wishlist-button"]');
        const wishlistIcon = card.querySelector('[data-role="wishlist-icon"]');
        const wishlistLabel = card.querySelector('[data-role="wishlist-label"]');
        const wishlisted = isProductWishlisted(product.id);
        wishlistButton.classList.toggle("is-active", wishlisted);
        wishlistIcon.textContent = wishlisted ? "favorite" : "favorite_border";
        wishlistLabel.textContent = wishlisted ? "Saved" : "Save";
    }

    function createCartItemElement(product) {
        const itemElement = document.createElement("div");
        itemElement.className = "cart-item";
        itemElement.innerHTML = `
            <img data-role="cart-product-image" draggable="false">
            <div class="cart-item-copy">
                <strong data-role="cart-product-name"></strong>
                <p data-role="cart-product-price"></p>
                <div class="cart-item-actions">
                    <div class="cart-item-quantity">
                        <button type="button" class="cart-qty-button cart-decrease" data-role="cart-decrease" aria-label="Decrease quantity">
                            <span class="material-symbols-outlined" aria-hidden="true">remove</span>
                        </button>
                        <span class="cart-qty-value" data-role="cart-quantity"></span>
                        <button type="button" class="cart-qty-button cart-increase" data-role="cart-increase" aria-label="Increase quantity">
                            <span class="material-symbols-outlined" aria-hidden="true">add</span>
                        </button>
                    </div>
                    <button type="button" class="link-button cart-remove" data-role="cart-remove">
                        <span class="material-symbols-outlined" aria-hidden="true">delete</span>
                        <span>Remove</span>
                    </button>
                </div>
            </div>
            <strong data-role="cart-line-total"></strong>
        `;

        const imageElement = itemElement.querySelector('[data-role="cart-product-image"]');
        applyProductImageToElement(imageElement, product.imageUrl, product.name);
        imageElement.draggable = false;

        itemElement.querySelector('[data-role="cart-decrease"]').addEventListener("click", () => {
            changeCartQuantity(itemElement.dataset.productId, -1);
        });
        itemElement.querySelector('[data-role="cart-increase"]').addEventListener("click", () => {
            changeCartQuantity(itemElement.dataset.productId, 1);
        });
        itemElement.querySelector('[data-role="cart-remove"]').addEventListener("click", () => {
            removeCartItem(itemElement.dataset.productId);
        });

        return itemElement;
    }

    function updateCartItemElement(itemElement, item, product) {
        itemElement.dataset.productId = String(product.id);

        const imageElement = itemElement.querySelector('[data-role="cart-product-image"]');
        if (imageElement) {
            applyProductImageToElement(imageElement, product.imageUrl, product.name);
        }

        itemElement.querySelector('[data-role="cart-product-name"]').textContent = product.name;
        itemElement.querySelector('[data-role="cart-product-price"]').textContent = `${formatCurrency(product.price)} each`;
        itemElement.querySelector('[data-role="cart-quantity"]').textContent = item.quantity;
        itemElement.querySelector('[data-role="cart-line-total"]').textContent = formatCurrency(product.price * item.quantity);
    }

    function showMessage(elementId, message, type = "info") {
        const box = document.getElementById(elementId);
        if (!box) {
            return;
        }

        box.textContent = message;
        box.className = `message message-${type} show`;
    }

    function clearMessage(elementId) {
        const box = document.getElementById(elementId);
        if (!box) {
            return;
        }

        box.textContent = "";
        box.className = "message";
    }

    function updateLastRefresh() {
        const element = document.getElementById("last-updated");
        if (!element) {
            return;
        }

        element.textContent = new Intl.DateTimeFormat("de-CH", {
            dateStyle: "medium",
            timeStyle: "medium"
        }).format(new Date());

        if (window.SiteUi && typeof window.SiteUi.updateFooterSystemDetails === "function") {
            window.SiteUi.updateFooterSystemDetails();
        }
    }

    function getCart() {
        try {
            return JSON.parse(CART_STORAGE.getItem(CART_STORAGE_KEY) || "[]");
        } catch (error) {
            CART_STORAGE.removeItem(CART_STORAGE_KEY);
            return [];
        }
    }

    function saveCart(cart) {
        CART_STORAGE.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        updateCartCount();
    }

    function findProduct(productId) {
        return allProducts.find((product) => product.id === Number(productId));
    }

    function sanitizeCartAgainstStock() {
        const sanitizedCart = getCart()
            .map((item) => {
                const product = findProduct(item.productId);
                if (!product || product.stockQuantity === 0) {
                    return null;
                }

                return {
                    productId: item.productId,
                    quantity: Math.min(item.quantity, product.stockQuantity)
                };
            })
            .filter(Boolean);

        saveCart(sanitizedCart);
    }

    function updateCartCount() {
        const cartCount = getCart().reduce((sum, item) => sum + item.quantity, 0);
        const cartButton = document.getElementById("cart-open-button");
        if (cartButton) {
            cartButton.textContent = `Cart (${cartCount})`;
        }
    }

    function getProductById(productId) {
        return allProducts.find((product) => product.id === Number(productId)) || null;
    }

    function isAdminLoggedIn() {
        return Boolean(window.Auth && window.Auth.getCredentials("admin"));
    }

    async function syncWishlistFromApi() {
        if (!isCustomerLoggedIn()) {
            wishlistProductIds.clear();
            return;
        }

        try {
            const wishlistItems = await window.InventoryApi.getCustomerWishlist();
            wishlistProductIds.clear();
            wishlistItems.forEach((item) => wishlistProductIds.add(Number(item.productId)));
        } catch (error) {
            wishlistProductIds.clear();
        }
    }

    async function toggleWishlist(productId) {
        if (!isCustomerLoggedIn()) {
            window.location.href = "customer-auth.html?next=shop.html";
            return;
        }

        const numericProductId = Number(productId);
        const product = getProductById(numericProductId);

        try {
            if (isProductWishlisted(numericProductId)) {
                await window.InventoryApi.removeFromCustomerWishlist(numericProductId);
                wishlistProductIds.delete(numericProductId);
                showMessage("shop-message", `${product?.name || "Product"} removed from your saved favorites.`, "info");
            } else {
                await window.InventoryApi.addToCustomerWishlist(numericProductId);
                wishlistProductIds.add(numericProductId);
                showMessage("shop-message", `${product?.name || "Product"} saved to your favorites.`, "success");
            }

            renderProducts();
            if (document.body.classList.contains("product-modal-open") && product) {
                openProductModal(numericProductId);
            }
        } catch (error) {
            showMessage("shop-message", error.message || "Could not update your favorites.", "error");
        }
    }

    function lockBodyForOverlay() {
        if (overlayScrollLocked) {
            return;
        }

        overlayScrollLocked = true;
        lockedScrollY = window.scrollY || window.pageYOffset || 0;
        previousScrollBehavior = document.documentElement.style.scrollBehavior;
        document.documentElement.style.scrollBehavior = "auto";
        document.body.style.position = "fixed";
        document.body.style.top = `-${lockedScrollY}px`;
        document.body.style.left = "0";
        document.body.style.right = "0";
        document.body.style.width = "100%";
    }

    function unlockBodyFromOverlay() {
        if (!overlayScrollLocked) {
            return;
        }

        overlayScrollLocked = false;
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.width = "";
        const restoreY = lockedScrollY;
        window.requestAnimationFrame(() => {
            window.scrollTo(0, restoreY);
            document.documentElement.style.scrollBehavior = previousScrollBehavior;
        });
    }

    function hideProductModal(restoreScroll = true) {
        const modal = document.getElementById("product-modal");
        if (!modal || !document.body.classList.contains("product-modal-open")) {
            return;
        }

        document.body.classList.remove("product-modal-open");
        modal.setAttribute("aria-hidden", "true");

        if (restoreScroll && !document.body.classList.contains("cart-open")) {
            unlockBodyFromOverlay();
        }
    }

    function closeProductModal() {
        hideProductModal(true);
    }

    function renderProductModal(product, reviews = [], relatedProducts = []) {
        const title = document.getElementById("product-modal-title");
        const content = document.getElementById("product-modal-content");
        if (!title || !content) {
            return;
        }

        title.textContent = product.name;
        const customerSession = window.Auth ? window.Auth.getSession("customer") : null;
        const ownReview = customerSession
            ? reviews.find((review) => String(review.customerUsername).toLowerCase() === String(customerSession.username).toLowerCase())
            : null;
        const wishlisted = isProductWishlisted(product.id);

        const editAction = isAdminLoggedIn()
            ? `
                <a class="button-secondary" href="product-form.html?id=${product.id}">
                    <span class="material-symbols-outlined" aria-hidden="true">edit</span>
                    <span>Edit Product</span>
                </a>
            `
            : "";
        content.innerHTML = `
            <div class="product-modal-grid product-modal-grid-rich">
                <img alt="${product.name}" loading="lazy" draggable="false" data-product-image-source="${product.imageUrl}">
                <div class="product-modal-copy">
                    <p class="product-modal-category">${product.categoryName}</p>
                    <p class="product-modal-price">${formatCurrency(product.price)}</p>
                    <div class="badge-row">
                        <span class="badge ${product.stockQuantity === 0 ? "badge-danger" : product.stockQuantity <= (product.restockThreshold ?? 5) ? "badge-warning" : "badge-success"}">${product.stockStatus}</span>
                        <span class="badge ${product.available ? "badge-success" : "badge-danger"}">${product.available ? "Available now" : "Out of stock"}</span>
                    </div>
                    <p class="product-modal-description">${product.description}</p>
                    <div class="product-modal-meta">
                        <p><strong>Stock:</strong> ${product.stockQuantity} left in stock</p>
                        <p><strong>SKU:</strong> ${product.sku || "Not set"}</p>
                        <p><strong>Rating:</strong> ${formatRating(product.averageRating)}${product.reviewCount ? ` · ${product.reviewCount} reviews` : ""}</p>
                        <p><strong>Suggested reorder point:</strong> ${product.restockThreshold ?? 5} units</p>
                    </div>
                    <div class="product-modal-actions">
                        <button
                            class="button-secondary product-modal-wishlist-button ${wishlisted ? "is-active" : ""}"
                            type="button"
                            data-product-id="${product.id}"
                        >
                            <span class="material-symbols-outlined" aria-hidden="true">${wishlisted ? "favorite" : "favorite_border"}</span>
                            <span>${wishlisted ? "Saved" : "Save Favorite"}</span>
                        </button>
                        <button
                            class="button product-modal-cart-button"
                            type="button"
                            data-product-id="${product.id}"
                            ${product.stockQuantity === 0 ? "disabled" : ""}
                        >
                            <span class="material-symbols-outlined" aria-hidden="true">${product.stockQuantity === 0 ? "block" : "add_shopping_cart"}</span>
                            <span>${product.stockQuantity === 0 ? "Sold Out" : "Add to Cart"}</span>
                        </button>
                        ${editAction}
                    </div>
                </div>
            </div>
            <div class="product-detail-grid">
                <section class="product-detail-card">
                    <div class="panel-header">
                        <div>
                            <h3>Customer Reviews</h3>
                            <p>Helpful notes from shoppers who already tried it.</p>
                        </div>
                    </div>
                    <div class="review-list">
                        ${reviews.length ? reviews.map((review) => `
                            <article class="review-card">
                                <div class="review-card-header">
                                    <strong>${review.title || "Customer review"}</strong>
                                    <span>${review.rating}/5</span>
                                </div>
                                <p>${review.comment}</p>
                                <p class="hint">@${review.customerUsername}</p>
                            </article>
                        `).join("") : `<div class="empty-state">No reviews yet. Be the first to add one.</div>`}
                    </div>
                    ${isCustomerLoggedIn() ? `
                        <form class="review-form" id="product-review-form">
                            <div class="toolbar">
                                <div class="field">
                                    <label for="review-rating">Rating</label>
                                    <select id="review-rating" required>
                                        <option value="5" ${ownReview?.rating === 5 ? "selected" : ""}>5 - Love it</option>
                                        <option value="4" ${ownReview?.rating === 4 ? "selected" : ""}>4 - Very good</option>
                                        <option value="3" ${ownReview?.rating === 3 ? "selected" : ""}>3 - Good</option>
                                        <option value="2" ${ownReview?.rating === 2 ? "selected" : ""}>2 - Needs work</option>
                                        <option value="1" ${ownReview?.rating === 1 ? "selected" : ""}>1 - Not for me</option>
                                    </select>
                                </div>
                                <div class="field">
                                    <label for="review-title">Title</label>
                                    <input id="review-title" type="text" maxlength="120" value="${ownReview?.title || ""}" />
                                </div>
                            </div>
                            <div class="field">
                                <label for="review-comment">Comment</label>
                                <textarea id="review-comment" maxlength="1000" required>${ownReview?.comment || ""}</textarea>
                            </div>
                            <div class="button-row">
                                <button class="button-secondary" type="submit">${ownReview ? "Update Review" : "Add Review"}</button>
                                ${ownReview ? `<button class="button-secondary" id="delete-review-button" type="button">Delete Review</button>` : ""}
                            </div>
                        </form>
                    ` : `<p class="hint">Sign in with a customer account to save favorites and leave a review.</p>`}
                </section>
                <section class="product-detail-card">
                    <div class="panel-header">
                        <div>
                            <h3>Related Picks</h3>
                            <p>Similar products from the same KEFE section.</p>
                        </div>
                    </div>
                    <div class="related-product-list">
                        ${relatedProducts.length ? relatedProducts.map((relatedProduct) => `
                            <button class="related-product-card" type="button" data-related-product-id="${relatedProduct.id}">
                                <strong>${relatedProduct.name}</strong>
                                <span>${formatCurrency(relatedProduct.price)}</span>
                                <span>${relatedProduct.stockStatus}</span>
                            </button>
                        `).join("") : `<div class="empty-state">More recommendations will appear as the catalog grows.</div>`}
                    </div>
                </section>
            </div>
        `;

        applyProductImageToElement(content.querySelector("img[data-product-image-source]"), product.imageUrl, product.name);

        const addToCartButton = content.querySelector(".product-modal-cart-button");
        if (addToCartButton) {
            addToCartButton.addEventListener("click", () => {
                hideProductModal(false);
                addToCart(product.id);
            });
        }

        const wishlistButton = content.querySelector(".product-modal-wishlist-button");
        if (wishlistButton) {
            wishlistButton.addEventListener("click", async () => {
                await toggleWishlist(product.id);
            });
        }

        const reviewForm = content.querySelector("#product-review-form");
        if (reviewForm) {
            reviewForm.addEventListener("submit", async (event) => {
                event.preventDefault();

                try {
                    await window.InventoryApi.upsertCustomerReview(product.id, {
                        rating: Number(document.getElementById("review-rating").value),
                        title: document.getElementById("review-title").value.trim(),
                        comment: document.getElementById("review-comment").value.trim()
                    });
                    await refreshProducts();
                    await openProductModal(product.id);
                    showMessage("shop-message", "Your review was saved.", "success");
                } catch (error) {
                    showMessage("shop-message", error.message || "Could not save your review.", "error");
                }
            });
        }

        const deleteReviewButton = content.querySelector("#delete-review-button");
        if (deleteReviewButton) {
            deleteReviewButton.addEventListener("click", async () => {
                try {
                    await window.InventoryApi.deleteCustomerReview(product.id);
                    await refreshProducts();
                    await openProductModal(product.id);
                    showMessage("shop-message", "Your review was removed.", "info");
                } catch (error) {
                    showMessage("shop-message", error.message || "Could not remove your review.", "error");
                }
            });
        }

        content.querySelectorAll("[data-related-product-id]").forEach((button) => {
            button.addEventListener("click", () => {
                openProductModal(button.dataset.relatedProductId);
            });
        });
    }

    async function openProductModal(productId) {
        const modal = document.getElementById("product-modal");
        const title = document.getElementById("product-modal-title");
        const content = document.getElementById("product-modal-content");
        if (!modal || !title || !content) {
            return;
        }

        if (window.SiteUi) {
            window.SiteUi.closeMenu();
        }

        title.textContent = "Loading product...";
        content.innerHTML = `<div class="empty-state">Loading product details...</div>`;

        if (!document.body.classList.contains("product-modal-open") && !document.body.classList.contains("cart-open")) {
            lockBodyForOverlay();
        }

        document.body.classList.add("product-modal-open");
        modal.setAttribute("aria-hidden", "false");

        try {
            const [product, reviews, relatedProducts] = await Promise.all([
                window.InventoryApi.getPublicProductById(productId),
                window.InventoryApi.getPublicProductReviews(productId).catch(() => []),
                window.InventoryApi.getRelatedPublicProducts(productId).catch(() => [])
            ]);
            renderProductModal(product, reviews, relatedProducts);
        } catch (error) {
            const fallbackProduct = getProductById(productId);
            if (fallbackProduct) {
                renderProductModal(fallbackProduct, [], []);
                return;
            }

            title.textContent = "Product details";
            content.innerHTML = `<div class="empty-state">Could not load product details.</div>`;
        }
    }

    function addToCart(productId) {
        const product = findProduct(productId);
        if (!product || product.stockQuantity === 0) {
            showMessage("shop-message", "This item is currently out of stock.", "error");
            return;
        }

        const cart = getCart();
        const existingItem = cart.find((item) => item.productId === product.id);

        if (existingItem) {
            if (existingItem.quantity >= product.stockQuantity) {
                showMessage("shop-message", "You already added the maximum available quantity.", "error");
                return;
            }
            existingItem.quantity += 1;
        } else {
            cart.push({ productId: product.id, quantity: 1 });
        }

        saveCart(cart);
        renderCart();
        openCart();
        showMessage("shop-message", `${product.name} added to your cart.`, "success");
    }

    function changeCartQuantity(productId, delta) {
        const product = findProduct(productId);
        const cart = getCart();
        const item = cart.find((entry) => entry.productId === Number(productId));

        if (!item || !product) {
            return;
        }

        item.quantity = Math.max(0, Math.min(item.quantity + delta, product.stockQuantity));
        const nextCart = cart.filter((entry) => entry.quantity > 0);
        saveCart(nextCart);
        renderCart();
    }

    function removeCartItem(productId) {
        const nextCart = getCart().filter((item) => item.productId !== Number(productId));
        saveCart(nextCart);
        renderCart();
    }

    function openCart() {
        if (window.SiteUi) {
            window.SiteUi.closeMenu();
        }
        if (!document.body.classList.contains("cart-open")) {
            if (document.body.classList.contains("product-modal-open")) {
                hideProductModal(false);
            }
            lockBodyForOverlay();
        }
        document.body.classList.add("cart-open");
    }

    function closeCart() {
        document.body.classList.remove("cart-open");
        if (!document.body.classList.contains("product-modal-open")) {
            unlockBodyFromOverlay();
        }
    }

    function renderProducts() {
        const grid = document.getElementById("shop-product-grid");
        if (!grid) {
            return;
        }

        const filteredProducts = getFilteredProducts();

        if (!filteredProducts.length) {
            if (window.SiteUi && typeof window.SiteUi.renderPagination === "function") {
                window.SiteUi.renderPagination("shop-pagination", {
                    totalItems: 0,
                    page: 1,
                    pageSize: catalogPagination.pageSize,
                    itemLabel: "products",
                    showAll: false,
                    expanded: false,
                    onPageChange: () => {},
                    onToggleExpanded: () => {},
                    onToggleShowAll: () => {}
                });
            }
            syncContainerChildren(grid, [createEmptyStateElement("No products match the current filters.")]);
            return;
        }

        const paginationMeta = window.SiteUi && typeof window.SiteUi.getPaginationMeta === "function"
            ? window.SiteUi.getPaginationMeta(
                filteredProducts.length,
                catalogPagination.page,
                catalogPagination.showAll ? Math.max(1, filteredProducts.length) : catalogPagination.pageSize,
                catalogPagination.showAll
            )
            : {
                page: 1,
                pageSize: catalogPagination.pageSize,
                showAll: catalogPagination.showAll
            };
        catalogPagination.page = paginationMeta.page;

        if (window.SiteUi && typeof window.SiteUi.renderPagination === "function") {
            window.SiteUi.renderPagination("shop-pagination", {
                totalItems: filteredProducts.length,
                page: catalogPagination.page,
                pageSize: catalogPagination.pageSize,
                itemLabel: "products",
                showAll: catalogPagination.showAll,
                expanded: catalogPagination.expanded,
                onPageChange: (page) => {
                    catalogPagination.page = page;
                    catalogPagination.expanded = false;
                    renderProducts();
                },
                onToggleExpanded: (expanded) => {
                    catalogPagination.expanded = expanded;
                    renderProducts();
                },
                onToggleShowAll: (showAll) => {
                    catalogPagination.showAll = showAll;
                    catalogPagination.expanded = false;
                    catalogPagination.page = 1;
                    renderProducts();
                }
            });
        }

        const startIndex = (catalogPagination.page - 1) * catalogPagination.pageSize;
        const visibleProducts = catalogPagination.showAll
            ? filteredProducts
            : filteredProducts.slice(startIndex, startIndex + catalogPagination.pageSize);

        const productCards = visibleProducts.map((product) => {
            let card = productCardRegistry.get(product.id);

            if (!card) {
                card = createProductCardElement(product);
                productCardRegistry.set(product.id, card);
            }

            updateProductCardElement(card, product);
            return card;
        });

        syncContainerChildren(grid, productCards);
    }

    function renderCategoryPills(categories) {
        const container = document.getElementById("category-pills");
        if (!container) {
            return;
        }

        container.innerHTML = `
            <button class="pill active-pill" data-category-value="">All</button>
            ${categories.map((category) => `<button class="pill" data-category-value="${category.id}">${category.name}</button>`).join("")}
        `;

        container.querySelectorAll("[data-category-value]").forEach((button) => {
            button.addEventListener("click", () => {
                document.getElementById("category-filter").value = button.dataset.categoryValue;
                container.querySelectorAll(".pill").forEach((pill) => pill.classList.remove("active-pill"));
                button.classList.add("active-pill");
                catalogPagination.page = 1;
                renderProducts();
            });
        });
    }

    async function loadCategories() {
        const categories = await window.InventoryApi.getPublicCategories();
        const categoryFilter = document.getElementById("category-filter");
        categoryFilter.innerHTML = `
            <option value="">All categories</option>
            ${categories.map((category) => `<option value="${category.id}">${category.name}</option>`).join("")}
        `;
        renderCategoryPills(categories);
    }

    function renderCart() {
        const cartItemsContainer = document.getElementById("cart-items");
        const cartSubtotalElement = document.getElementById("cart-subtotal");
        const checkoutButton = document.getElementById("checkout-button");
        const cart = getCart();

        if (!cartItemsContainer || !cartSubtotalElement || !checkoutButton) {
            return;
        }

        if (!cart.length) {
            syncContainerChildren(cartItemsContainer, [createEmptyStateElement("Your cart is empty. Add a few KEFE favorites to get started.")]);
            cartSubtotalElement.textContent = formatCurrency(0);
            checkoutButton.disabled = true;
            return;
        }

        let subtotal = 0;
        const cartItems = cart.map((item) => {
            const product = findProduct(item.productId);
            if (!product) {
                return null;
            }

            subtotal += product.price * item.quantity;

            let cartItem = cartItemRegistry.get(product.id);
            if (!cartItem) {
                cartItem = createCartItemElement(product);
                cartItemRegistry.set(product.id, cartItem);
            }

            updateCartItemElement(cartItem, item, product);
            return cartItem;
        }).filter(Boolean);

        if (!cartItems.length) {
            syncContainerChildren(cartItemsContainer, [createEmptyStateElement("Your cart is empty. Add a few KEFE favorites to get started.")]);
            cartSubtotalElement.textContent = formatCurrency(0);
            checkoutButton.disabled = true;
            return;
        }

        syncContainerChildren(cartItemsContainer, cartItems);

        cartSubtotalElement.textContent = formatCurrency(subtotal);
        checkoutButton.disabled = false;
    }

    async function handleCheckout(event) {
        event.preventDefault();
        clearMessage("cart-message");

        const customerCredentials = window.Auth.getCredentials("customer");
        if (!customerCredentials) {
            window.location.href = "customer-auth.html?next=shop.html";
            return;
        }

        const deliveryAddress = document.getElementById("checkout-delivery-address").value.trim();
        const note = document.getElementById("checkout-note").value.trim();
        const items = getCart().map((item) => ({
            productId: item.productId,
            quantity: item.quantity
        }));

        try {
            const order = await window.InventoryApi.createCustomerOrder({
                items,
                deliveryAddress,
                note
            });

            CART_STORAGE.removeItem(CART_STORAGE_KEY);
            updateCartCount();
            renderCart();
            closeCart();
            const orderNotice = `Order ${order.orderNumber} placed successfully. Estimated ready: ${order.estimatedReadyAt ? new Intl.DateTimeFormat("de-CH", { dateStyle: "medium", timeStyle: "short" }).format(new Date(order.estimatedReadyAt)) : "soon"}. Confirmation prepared for ${order.confirmationRecipientEmail || "your account email"}.`;
            window.sessionStorage.setItem("kefeLastOrderNotice", orderNotice);
            showMessage("shop-message", orderNotice, "success");
            await refreshProducts();
            window.location.href = "account.html";
        } catch (error) {
            showMessage("cart-message", error.message || "Could not place the order.", "error");
        }
    }

    async function refreshProducts() {
        const latestProducts = await window.InventoryApi.getPublicProducts();
        allProducts = latestProducts;
        pruneProductCardRegistry();
        sanitizeCartAgainstStock();
        renderProducts();
        renderCart();
        updateLastRefresh();
    }

    async function initializeShop() {
        try {
            clearMessage("shop-message");
            await loadCategories();
            await refreshProducts();
            await syncWishlistFromApi();
            renderProducts();
            updateCartCount();
        } catch (error) {
            showMessage("shop-message", error.message || "Could not load the storefront.", "error");
        }
    }

    function startPolling() {
        if (pollingHandle) {
            window.clearInterval(pollingHandle);
        }
        pollingHandle = window.setInterval(async () => {
            try {
                await refreshProducts();
            } catch (error) {
                showMessage("shop-message", "Live refresh paused because the backend is unreachable.", "error");
            }
        }, 4000);
    }

    function startLiveUpdates() {
        if (!window.EventSource || !window.InventoryApiConfig || typeof window.InventoryApiConfig.resolveUrl !== "function") {
            startPolling();
            liveUpdatesUsingPollingFallback = true;
            return;
        }

        if (catalogEventSource) {
            catalogEventSource.close();
        }

        try {
            catalogEventSource = new EventSource(window.InventoryApiConfig.resolveUrl("/api/public/products/stream"));
            catalogEventSource.addEventListener("catalog-refresh", async () => {
                try {
                    await refreshProducts();
                } catch (error) {
                    showMessage("shop-message", "Live refresh is temporarily unavailable.", "error");
                }
            });
            catalogEventSource.onerror = () => {
                if (!liveUpdatesUsingPollingFallback) {
                    liveUpdatesUsingPollingFallback = true;
                    startPolling();
                }
            };
        } catch (error) {
            startPolling();
            liveUpdatesUsingPollingFallback = true;
        }
    }

    document.addEventListener("DOMContentLoaded", async () => {
        const initialParams = new URLSearchParams(window.location.search);
        const initialSearchQuery = initialParams.get("search") || "";
        const initialProductId = Number(initialParams.get("product") || 0);

        if (initialSearchQuery) {
            const searchInput = document.getElementById("search-input");
            if (searchInput) {
                searchInput.value = initialSearchQuery;
            }
        }

        ["search-input", "category-filter", "sort-filter"].forEach((id) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener("input", () => {
                    catalogPagination.page = 1;
                    renderProducts();
                });
                element.addEventListener("change", () => {
                    catalogPagination.page = 1;
                    renderProducts();
                });
            }
        });

        document.getElementById("cart-open-button").addEventListener("click", (event) => {
            event.preventDefault();
            openCart();
        });
        document.getElementById("mobile-cart-open-button")?.addEventListener("click", () => {
            openCart();
        });
        document.getElementById("cart-close-button").addEventListener("click", closeCart);
        document.getElementById("cart-backdrop").addEventListener("click", closeCart);
        document.getElementById("product-modal-close").addEventListener("click", closeProductModal);
        document.getElementById("product-modal-backdrop").addEventListener("click", closeProductModal);
        document.getElementById("checkout-form").addEventListener("submit", handleCheckout);

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                closeProductModal();
            }
        });

        window.addEventListener("site-search:open-product", (event) => {
            const productId = Number(event.detail?.productId || 0);
            if (!productId) {
                return;
            }

            openProductModal(productId);
        });

        await initializeShop();

        if (initialProductId) {
            openProductModal(initialProductId);
        }

        startLiveUpdates();

        window.addEventListener("beforeunload", () => {
            if (pollingHandle) {
                window.clearInterval(pollingHandle);
            }
            if (catalogEventSource) {
                catalogEventSource.close();
            }
        });
    });
}());
