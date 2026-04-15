(function () {
    const ORDER_RETENTION_YEARS = 2;
    let accountProfileSnapshot = null;
    let accountDeleteModalPreviouslyFocused = null;
    let accountDeleteCountdownTimer = null;
    const accountOrdersPagination = {
        page: 1,
        pageSize: 5,
        showAll: false,
        expanded: false
    };

    function clearMessage(elementId) {
        const box = document.getElementById(elementId);
        if (!box) {
            return;
        }

        box.textContent = "";
        box.className = "message";
    }

    function showMessage(elementId, message, type = "info") {
        const box = document.getElementById(elementId);
        if (!box) {
            return;
        }

        box.textContent = message;
        box.className = `message message-${type} show`;
    }

    function formatCurrency(value) {
        return new Intl.NumberFormat("de-CH", {
            style: "currency",
            currency: "CHF"
        }).format(value);
    }

    function formatDate(value) {
        return new Intl.DateTimeFormat("de-CH", {
            dateStyle: "medium",
            timeStyle: "short"
        }).format(new Date(value));
    }

    function formatRetentionCountdown(targetDate) {
        const now = new Date();
        const remainingMs = targetDate.getTime() - now.getTime();

        if (remainingMs <= 0) {
            return "Retention period ended";
        }

        const totalSeconds = Math.floor(remainingMs / 1000);
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);

        return `${days}d ${hours}h ${minutes}m remaining`;
    }

    function buildOrderRetentionDate() {
        const retentionDate = new Date();
        retentionDate.setFullYear(retentionDate.getFullYear() + ORDER_RETENTION_YEARS);
        return retentionDate;
    }

    function updateAccountDeleteRetentionPreview() {
        const retentionDate = buildOrderRetentionDate();
        const retentionDateElement = document.getElementById("account-delete-retention-date");
        const retentionCountdownElement = document.getElementById("account-delete-retention-countdown");

        if (retentionDateElement) {
            retentionDateElement.textContent = formatDate(retentionDate.toISOString());
        }

        if (retentionCountdownElement) {
            retentionCountdownElement.textContent = formatRetentionCountdown(retentionDate);
        }
    }

    function resolveOrderBadgeClass(status) {
        switch (status) {
            case "PREPARING":
                return "badge-warning";
            case "READY_FOR_PICKUP":
                return "badge-info";
            case "COMPLETED":
                return "badge-success";
            case "PLACED":
            default:
                return "badge-muted";
        }
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

    function resolveNextPage() {
        return new URLSearchParams(window.location.search).get("next") || "account.html";
    }

    async function handleCustomerLogin(event) {
        event.preventDefault();

        const username = document.getElementById("customer-login-username").value.trim();
        const password = document.getElementById("customer-login-password").value.trim();

        if (!username || !password) {
            showMessage("customer-login-message", "Please enter both username and password.", "error");
            return;
        }

        try {
            const session = await window.InventoryApi.login({ username, password });
            window.Auth.saveSession("customer", session);
            window.SiteUi.updateCustomerLinks();
            window.location.href = resolveNextPage();
        } catch (error) {
            window.Auth.clearSession("customer");
            showMessage("customer-login-message", error.message || "Customer login failed.", "error");
        }
    }

    async function handleCustomerRegister(event) {
        event.preventDefault();

        const payload = {
            fullName: document.getElementById("register-full-name").value.trim(),
            username: document.getElementById("register-username").value.trim(),
            email: document.getElementById("register-email").value.trim(),
            password: document.getElementById("register-password").value.trim()
        };

        try {
            await window.InventoryApi.registerCustomer(payload);
            const session = await window.InventoryApi.login({
                username: payload.username,
                password: payload.password
            });
            window.Auth.saveSession("customer", session);
            window.SiteUi.updateCustomerLinks();
            window.location.href = resolveNextPage();
        } catch (error) {
            showMessage("customer-register-message", error.message || "Could not create customer account.", "error");
        }
    }

    function renderOrders(orders) {
        const container = document.getElementById("orders-list");
        if (!container) {
            return;
        }

        if (!orders.length) {
            if (window.SiteUi && typeof window.SiteUi.renderPagination === "function") {
                window.SiteUi.renderPagination("account-orders-pagination", {
                    totalItems: 0,
                    page: 1,
                    pageSize: accountOrdersPagination.pageSize,
                    itemLabel: "orders",
                    showAll: false,
                    expanded: false,
                    onPageChange: () => {},
                    onToggleExpanded: () => {},
                    onToggleShowAll: () => {}
                });
            }
            container.innerHTML = `<div class="empty-state">No orders yet. Head back to the shop and place your first KEFE order.</div>`;
            return;
        }

        const paginationMeta = window.SiteUi && typeof window.SiteUi.getPaginationMeta === "function"
            ? window.SiteUi.getPaginationMeta(
                orders.length,
                accountOrdersPagination.page,
                accountOrdersPagination.showAll ? Math.max(1, orders.length) : accountOrdersPagination.pageSize,
                accountOrdersPagination.showAll
            )
            : {
                page: 1,
                pageSize: accountOrdersPagination.pageSize,
                showAll: accountOrdersPagination.showAll
            };
        accountOrdersPagination.page = paginationMeta.page;

        if (window.SiteUi && typeof window.SiteUi.renderPagination === "function") {
            window.SiteUi.renderPagination("account-orders-pagination", {
                totalItems: orders.length,
                page: accountOrdersPagination.page,
                pageSize: accountOrdersPagination.pageSize,
                itemLabel: "orders",
                showAll: accountOrdersPagination.showAll,
                expanded: accountOrdersPagination.expanded,
                onPageChange: (page) => {
                    accountOrdersPagination.page = page;
                    accountOrdersPagination.expanded = false;
                    renderOrders(orders);
                },
                onToggleExpanded: (expanded) => {
                    accountOrdersPagination.expanded = expanded;
                    renderOrders(orders);
                },
                onToggleShowAll: (showAll) => {
                    accountOrdersPagination.showAll = showAll;
                    accountOrdersPagination.expanded = false;
                    accountOrdersPagination.page = 1;
                    renderOrders(orders);
                }
            });
        }

        const startIndex = (accountOrdersPagination.page - 1) * accountOrdersPagination.pageSize;
        const visibleOrders = accountOrdersPagination.showAll
            ? orders
            : orders.slice(startIndex, startIndex + accountOrdersPagination.pageSize);

        container.innerHTML = visibleOrders.map((order) => `
            <article class="order-card">
                <div class="order-card-header">
                    <div>
                        <span class="eyebrow">Order</span>
                        <h3>${order.orderNumber}</h3>
                        <p>${formatDate(order.createdAt)}</p>
                    </div>
                    <div class="order-card-summary">
                        <span class="badge ${resolveOrderBadgeClass(order.status)}">${order.status.replaceAll("_", " ")}</span>
                        <strong>${formatCurrency(order.totalAmount)}</strong>
                    </div>
                </div>
                <div class="order-meta">
                    <p><strong>Pickup / delivery:</strong> ${order.deliveryAddress}</p>
                    <p><strong>Estimated ready:</strong> ${order.estimatedReadyAt ? formatDate(order.estimatedReadyAt) : "Preparing estimate..."}</p>
                    <p><strong>Note:</strong> ${order.note || "No extra note"}</p>
                </div>
                <div class="order-item-list">
                    ${order.items.map((item) => {
                        const imageAsset = getProductImageAsset(item.imageUrl);

                        return `
                        <div class="order-item">
                            <img class="${imageAsset.className}" src="${imageAsset.src}" alt="${item.productName}" data-product-image-source="${item.imageUrl}">
                            <div class="order-item-copy">
                                <strong>${item.productName}</strong>
                                <p>${item.quantity} x ${formatCurrency(item.unitPrice)}</p>
                            </div>
                            <strong class="order-item-total">${formatCurrency(item.lineTotal)}</strong>
                        </div>
                    `;
                    }).join("")}
                </div>
            </article>
        `).join("");
    }

    function renderWishlist(items) {
        const container = document.getElementById("account-wishlist");
        if (!container) {
            return;
        }

        if (!items.length) {
            container.innerHTML = `<div class="empty-state">No saved favorites yet. Tap the heart icon in the shop to build a personal list.</div>`;
            return;
        }

        container.innerHTML = items.map((item) => {
            const imageAsset = getProductImageAsset(item.imageUrl);
            const ratingLabel = item.averageRating > 0
                ? `${item.averageRating.toFixed(1)} / 5`
                : "New";

            return `
                <article class="wishlist-card">
                    <img class="${imageAsset.className}" src="${imageAsset.src}" alt="${item.productName}" data-product-image-source="${item.imageUrl}">
                    <div class="wishlist-card-copy">
                        <p class="eyebrow">${item.categoryName}</p>
                        <h3>${item.productName}</h3>
                        <p>${formatCurrency(item.price)} · ${item.available ? "Available" : "Currently unavailable"}</p>
                        <p>Rating: ${ratingLabel}</p>
                    </div>
                    <div class="button-row">
                        <a class="button-secondary" href="shop.html#catalog-section">Open Shop</a>
                    </div>
                </article>
            `;
        }).join("");
    }

    function populateAccountProfile(profile) {
        accountProfileSnapshot = {
            fullName: profile.fullName || "",
            username: profile.username || "",
            email: profile.email || ""
        };

        const accountName = document.getElementById("account-name");
        const accountUsername = document.getElementById("account-username");
        const accountEmail = document.getElementById("account-email");

        if (accountName) {
            accountName.textContent = profile.fullName;
        }
        if (accountUsername) {
            accountUsername.textContent = `@${profile.username}`;
        }
        if (accountEmail) {
            accountEmail.textContent = profile.email;
        }

        const fullNameInput = document.getElementById("account-full-name-input");
        const usernameInput = document.getElementById("account-username-input");
        const emailInput = document.getElementById("account-email-input");

        if (fullNameInput) {
            fullNameInput.value = profile.fullName || "";
        }
        if (usernameInput) {
            usernameInput.value = profile.username || "";
        }
        if (emailInput) {
            emailInput.value = profile.email || "";
        }
    }

    function openAccountDeleteModal() {
        const modal = document.getElementById("account-delete-modal");
        const confirmButton = document.getElementById("account-delete-confirm");
        if (!modal) {
            return;
        }

        accountDeleteModalPreviouslyFocused = document.activeElement;
        document.body.classList.add("account-delete-modal-open");
        modal.setAttribute("aria-hidden", "false");

        const backdrop = document.getElementById("account-delete-backdrop");
        if (backdrop) {
            backdrop.setAttribute("aria-hidden", "false");
        }

        updateAccountDeleteRetentionPreview();
        window.clearInterval(accountDeleteCountdownTimer);
        accountDeleteCountdownTimer = window.setInterval(updateAccountDeleteRetentionPreview, 1000);

        if (confirmButton) {
            window.requestAnimationFrame(() => confirmButton.focus());
        }
    }

    function closeAccountDeleteModal() {
        const modal = document.getElementById("account-delete-modal");
        if (!modal || !document.body.classList.contains("account-delete-modal-open")) {
            return;
        }

        document.body.classList.remove("account-delete-modal-open");
        modal.setAttribute("aria-hidden", "true");

        const backdrop = document.getElementById("account-delete-backdrop");
        if (backdrop) {
            backdrop.setAttribute("aria-hidden", "true");
        }

        window.clearInterval(accountDeleteCountdownTimer);
        accountDeleteCountdownTimer = null;

        if (accountDeleteModalPreviouslyFocused instanceof HTMLElement) {
            accountDeleteModalPreviouslyFocused.focus();
        }
    }

    async function handleAccountProfileSubmit(event) {
        event.preventDefault();
        clearMessage("account-message");

        const payload = {
            fullName: document.getElementById("account-full-name-input").value.trim(),
            username: document.getElementById("account-username-input").value.trim(),
            email: document.getElementById("account-email-input").value.trim()
        };

        if (!payload.fullName || !payload.username || !payload.email) {
            showMessage("account-message", "Please complete all account fields.", "error");
            return;
        }

        try {
            const updatedProfile = await window.InventoryApi.updateCustomerProfile(payload);
            const session = window.Auth ? window.Auth.getSession("customer") : null;

            if (session) {
                window.Auth.saveSession("customer", {
                    ...session,
                    username: updatedProfile.username
                });
            }

            populateAccountProfile(updatedProfile);

            if (window.SiteUi && typeof window.SiteUi.updateCustomerLinks === "function") {
                window.SiteUi.updateCustomerLinks();
            }

            if (window.SiteUi && typeof window.SiteUi.updateFooterSystemDetails === "function") {
                window.SiteUi.updateFooterSystemDetails();
            }

            if (document.getElementById("customer-account-edit-page")) {
                window.sessionStorage.setItem("kefeAccountNotice", "Account updated successfully.");
                window.location.href = "account.html";
                return;
            }

            showMessage("account-message", "Account updated successfully.", "success");
        } catch (error) {
            showMessage("account-message", error.message || "Could not update your account.", "error");
        }
    }

    async function handleAccountDelete() {
        clearMessage("account-message");

        try {
            await window.InventoryApi.deleteCustomerProfile();
            closeAccountDeleteModal();

            if (window.Auth) {
                window.Auth.clearSession("customer");
            }

            if (window.SiteUi && typeof window.SiteUi.updateCustomerLinks === "function") {
                window.SiteUi.updateCustomerLinks();
            }

            window.location.href = "customer-auth.html";
        } catch (error) {
            showMessage("account-message", error.message || "Could not delete your account.", "error");
        }
    }

    async function loadAccountPage() {
        try {
            const [profile, orders, wishlist] = await Promise.all([
                window.InventoryApi.getCustomerProfile(),
                window.InventoryApi.getCustomerOrders(),
                window.InventoryApi.getCustomerWishlist()
            ]);

            populateAccountProfile(profile);
            document.getElementById("account-order-count").textContent = orders.length;
            document.getElementById("account-last-order").textContent = orders.length ? formatDate(orders[0].createdAt) : "No orders yet";
            document.getElementById("account-wishlist-count").textContent = wishlist.length;
            document.getElementById("account-review-count").textContent = profile.reviewCount || 0;

            renderOrders(orders);
            renderWishlist(wishlist);

            const orderNotice = window.sessionStorage.getItem("kefeLastOrderNotice");
            if (orderNotice) {
                showMessage("account-message", orderNotice, "success");
                window.sessionStorage.removeItem("kefeLastOrderNotice");
                return;
            }

            const accountNotice = window.sessionStorage.getItem("kefeAccountNotice");
            if (accountNotice) {
                showMessage("account-message", accountNotice, "success");
                window.sessionStorage.removeItem("kefeAccountNotice");
            }
        } catch (error) {
            showMessage("account-message", error.message || "Could not load your account.", "error");
        }
    }

    async function loadAccountEditPage() {
        try {
            const profile = await window.InventoryApi.getCustomerProfile();
            populateAccountProfile(profile);
        } catch (error) {
            showMessage("account-message", error.message || "Could not load your profile.", "error");
        }
    }

    document.addEventListener("DOMContentLoaded", () => {
        const loginForm = document.getElementById("customer-login-form");
        const registerForm = document.getElementById("customer-register-form");

        if (loginForm) {
            loginForm.addEventListener("submit", handleCustomerLogin);
        }

        if (registerForm) {
            registerForm.addEventListener("submit", handleCustomerRegister);
        }

        const accountProfileForm = document.getElementById("account-profile-form");
        if (accountProfileForm) {
            accountProfileForm.addEventListener("submit", handleAccountProfileSubmit);
        }

        const accountDeleteButton = document.getElementById("account-delete-button");
        if (accountDeleteButton) {
            accountDeleteButton.addEventListener("click", () => {
                clearMessage("account-message");
                openAccountDeleteModal();
            });
        }

        const accountDeleteCancel = document.getElementById("account-delete-cancel");
        if (accountDeleteCancel) {
            accountDeleteCancel.addEventListener("click", closeAccountDeleteModal);
        }

        const accountDeleteClose = document.getElementById("account-delete-close");
        if (accountDeleteClose) {
            accountDeleteClose.addEventListener("click", closeAccountDeleteModal);
        }

        const accountDeleteBackdrop = document.getElementById("account-delete-backdrop");
        if (accountDeleteBackdrop) {
            accountDeleteBackdrop.addEventListener("click", closeAccountDeleteModal);
        }

        const accountDeleteConfirm = document.getElementById("account-delete-confirm");
        if (accountDeleteConfirm) {
            accountDeleteConfirm.addEventListener("click", handleAccountDelete);
        }

        if (document.getElementById("customer-account-page")) {
            loadAccountPage();
        }

        if (document.getElementById("customer-account-edit-page")) {
            loadAccountEditPage();
        }

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                closeAccountDeleteModal();
            }
        });
    });
}());
