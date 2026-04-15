(function () {
    const CONFIG_STORAGE_KEY = "kefeApiBaseUrl";

    function trimTrailingSlash(value) {
        return String(value || "").trim().replace(/\/+$/, "");
    }

    function resolveApiBaseUrl() {
        const metaConfiguredUrl = document
            .querySelector('meta[name="inventory-api-base-url"]')
            ?.getAttribute("content");
        const storageConfiguredUrl = window.localStorage.getItem(CONFIG_STORAGE_KEY);
        const configuredUrl = trimTrailingSlash(metaConfiguredUrl || storageConfiguredUrl);

        if (configuredUrl) {
            return configuredUrl;
        }

        if (window.location.protocol === "file:") {
            return "http://localhost:8080";
        }

        const protocol = window.location.protocol || "http:";
        const hostname = window.location.hostname || "localhost";
        return `${protocol}//${hostname}:8080`;
    }

    const API_BASE_URL = resolveApiBaseUrl();

    function buildUrl(endpoint) {
        return `${API_BASE_URL}${endpoint}`;
    }

    async function request(endpoint, options = {}) {
        const {
            method = "GET",
            body,
            auth = false,
            authScope = "admin",
            responseType = "json"
        } = options;

        const headers = {
            Accept: responseType === "text" ? "text/plain, text/csv, */*" : "application/json"
        };

        if (body !== undefined) {
            headers["Content-Type"] = "application/json";
        }

        if (auth && window.Auth) {
            const authHeader = window.Auth.getAuthorizationHeader(authScope);
            if (authHeader) {
                headers.Authorization = authHeader;
            }
        }

        const response = await fetch(buildUrl(endpoint), {
            method,
            headers,
            body: body !== undefined ? JSON.stringify(body) : undefined
        });

        const contentType = response.headers.get("content-type") || "";
        const payload = responseType === "text"
            ? await response.text()
            : contentType.includes("application/json")
                ? await response.json()
                : null;

        if (!response.ok) {
            const error = new Error(payload?.message || (typeof payload === "string" && payload) || "Request failed.");
            error.status = response.status;
            error.data = payload;

            if (auth && (response.status === 401 || response.status === 403) && window.Auth) {
                window.Auth.handleUnauthorized(authScope);
            }

            throw error;
        }

        return payload;
    }

    const api = {
        login(payload) {
            return request("/api/public/auth/token", { method: "POST", body: payload });
        },
        getPublicProducts() {
            return request("/api/public/products");
        },
        getNewArrivals(limit = 65) {
            return request(`/api/public/products/new-arrivals?limit=${encodeURIComponent(limit)}`);
        },
        getPublicProductById(id) {
            return request(`/api/public/products/${id}`);
        },
        getRelatedPublicProducts(id) {
            return request(`/api/public/products/${id}/related`);
        },
        getPublicProductReviews(id) {
            return request(`/api/public/products/${id}/reviews`);
        },
        getPublicCategories() {
            return request("/api/public/categories");
        },
        getCareerVacancies() {
            return request("/api/public/careers/vacancies");
        },
        registerCustomer(payload) {
            return request("/api/public/customers/register", { method: "POST", body: payload });
        },
        getCustomerProfile() {
            return request("/api/customer/me", { auth: true, authScope: "customer" });
        },
        updateCustomerProfile(payload) {
            return request("/api/customer/me", {
                method: "PUT",
                body: payload,
                auth: true,
                authScope: "customer"
            });
        },
        deleteCustomerProfile() {
            return request("/api/customer/me", {
                method: "DELETE",
                auth: true,
                authScope: "customer"
            });
        },
        getCustomerOrders() {
            return request("/api/customer/orders", { auth: true, authScope: "customer" });
        },
        getCustomerOrderByNumber(orderNumber) {
            return request(`/api/customer/orders/${encodeURIComponent(orderNumber)}`, {
                auth: true,
                authScope: "customer"
            });
        },
        createCustomerOrder(payload) {
            return request("/api/customer/orders", {
                method: "POST",
                body: payload,
                auth: true,
                authScope: "customer"
            });
        },
        getCustomerWishlist() {
            return request("/api/customer/wishlist", { auth: true, authScope: "customer" });
        },
        addToCustomerWishlist(productId) {
            return request(`/api/customer/wishlist/${productId}`, {
                method: "POST",
                auth: true,
                authScope: "customer"
            });
        },
        removeFromCustomerWishlist(productId) {
            return request(`/api/customer/wishlist/${productId}`, {
                method: "DELETE",
                auth: true,
                authScope: "customer"
            });
        },
        getCustomerReviews() {
            return request("/api/customer/reviews", { auth: true, authScope: "customer" });
        },
        upsertCustomerReview(productId, payload) {
            return request(`/api/customer/reviews/${productId}`, {
                method: "PUT",
                body: payload,
                auth: true,
                authScope: "customer"
            });
        },
        deleteCustomerReview(productId) {
            return request(`/api/customer/reviews/${productId}`, {
                method: "DELETE",
                auth: true,
                authScope: "customer"
            });
        },
        getCustomerCareerApplications() {
            return request("/api/customer/careers/applications", {
                auth: true,
                authScope: "customer"
            });
        },
        applyToVacancy(vacancyId, payload) {
            return request(`/api/customer/careers/vacancies/${vacancyId}/apply`, {
                method: "POST",
                body: payload,
                auth: true,
                authScope: "customer"
            });
        },
        getCustomerSupportConversations() {
            return request("/api/customer/support/conversations", {
                auth: true,
                authScope: "customer"
            });
        },
        createCustomerSupportConversation(payload) {
            return request("/api/customer/support/conversations", {
                method: "POST",
                body: payload,
                auth: true,
                authScope: "customer"
            });
        },
        sendCustomerSupportMessage(conversationId, payload) {
            return request(`/api/customer/support/conversations/${conversationId}/messages`, {
                method: "POST",
                body: payload,
                auth: true,
                authScope: "customer"
            });
        },
        getDashboardStats() {
            return request("/api/admin/dashboard/stats", { auth: true, authScope: "admin" });
        },
        getDashboardInsights() {
            return request("/api/admin/dashboard/insights", { auth: true, authScope: "admin" });
        },
        exportDashboardCsv() {
            return request("/api/admin/dashboard/export.csv", {
                auth: true,
                authScope: "admin",
                responseType: "text"
            });
        },
        getAdminProducts() {
            return request("/api/admin/products", { auth: true, authScope: "admin" });
        },
        getAdminProductById(id) {
            return request(`/api/admin/products/${id}`, { auth: true, authScope: "admin" });
        },
        createProduct(payload) {
            return request("/api/admin/products", { method: "POST", body: payload, auth: true, authScope: "admin" });
        },
        updateProduct(id, payload) {
            return request(`/api/admin/products/${id}`, { method: "PUT", body: payload, auth: true, authScope: "admin" });
        },
        deleteProduct(id) {
            return request(`/api/admin/products/${id}`, { method: "DELETE", auth: true, authScope: "admin" });
        },
        updateProductStock(id, payload) {
            return request(`/api/admin/products/${id}/stock`, { method: "PATCH", body: payload, auth: true, authScope: "admin" });
        },
        getAdminCategories() {
            return request("/api/admin/categories", { auth: true, authScope: "admin" });
        },
        createCategory(payload) {
            return request("/api/admin/categories", { method: "POST", body: payload, auth: true, authScope: "admin" });
        },
        updateCategory(id, payload) {
            return request(`/api/admin/categories/${id}`, { method: "PUT", body: payload, auth: true, authScope: "admin" });
        },
        deleteCategory(id) {
            return request(`/api/admin/categories/${id}`, { method: "DELETE", auth: true, authScope: "admin" });
        },
        getInventoryLogs() {
            return request("/api/admin/inventory-logs", { auth: true, authScope: "admin" });
        },
        getAdminOrders() {
            return request("/api/admin/orders", { auth: true, authScope: "admin" });
        },
        getAdminRecentOrders() {
            return request("/api/admin/orders/recent", { auth: true, authScope: "admin" });
        },
        updateAdminOrderStatus(id, payload) {
            return request(`/api/admin/orders/${id}/status`, {
                method: "PATCH",
                body: payload,
                auth: true,
                authScope: "admin"
            });
        },
        getStaffCareerVacancies() {
            return request("/api/staff/careers/vacancies", { auth: true, authScope: "admin" });
        },
        createStaffCareerVacancy(payload) {
            return request("/api/staff/careers/vacancies", {
                method: "POST",
                body: payload,
                auth: true,
                authScope: "admin"
            });
        },
        updateStaffCareerVacancy(id, payload) {
            return request(`/api/staff/careers/vacancies/${id}`, {
                method: "PUT",
                body: payload,
                auth: true,
                authScope: "admin"
            });
        },
        getStaffCareerApplications() {
            return request("/api/staff/careers/applications", {
                auth: true,
                authScope: "admin"
            });
        },
        getStaffCareerApplicationsForVacancy(vacancyId) {
            return request(`/api/staff/careers/vacancies/${vacancyId}/applications`, {
                auth: true,
                authScope: "admin"
            });
        },
        updateStaffCareerApplicationStatus(applicationId, payload) {
            return request(`/api/staff/careers/applications/${applicationId}/status`, {
                method: "PUT",
                body: payload,
                auth: true,
                authScope: "admin"
            });
        },
        getAdminSupportConversations() {
            return request("/api/admin/support/conversations", {
                auth: true,
                authScope: "admin"
            });
        },
        sendAdminSupportMessage(conversationId, payload) {
            return request(`/api/admin/support/conversations/${conversationId}/messages`, {
                method: "POST",
                body: payload,
                auth: true,
                authScope: "admin"
            });
        },
        updateAdminSupportConversationStatus(conversationId, payload) {
            return request(`/api/admin/support/conversations/${conversationId}/status`, {
                method: "PUT",
                body: payload,
                auth: true,
                authScope: "admin"
            });
        }
    };

    window.InventoryApi = api;
    window.InventoryApiConfig = {
        API_BASE_URL,
        CONFIG_STORAGE_KEY,
        resolveUrl: buildUrl
    };
}());
