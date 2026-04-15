(function () {
    const APPLICATION_STATUS_OPTIONS = ["SUBMITTED", "IN_REVIEW", "INTERVIEW", "OFFER", "REJECTED"];
    const SUPPORT_STATUS_OPTIONS = ["OPEN", "PENDING_STAFF", "PENDING_CUSTOMER", "RESOLVED"];

    const careersState = {
        vacancies: [],
        applications: [],
        selectedVacancyId: null
    };

    const supportState = {
        conversations: [],
        selectedConversationId: null
    };

    function formatCurrency(value) {
        return new Intl.NumberFormat("de-CH", {
            style: "currency",
            currency: "CHF"
        }).format(Number(value) || 0);
    }

    function formatDateTime(value) {
        if (!value) {
            return "Not available";
        }

        return new Intl.DateTimeFormat("de-CH", {
            dateStyle: "medium",
            timeStyle: "short"
        }).format(new Date(value));
    }

    function formatShortDate(value) {
        if (!value) {
            return "Not available";
        }

        return new Intl.DateTimeFormat("de-CH", {
            dateStyle: "medium"
        }).format(new Date(value));
    }

    function formatStatus(value) {
        return String(value || "").replaceAll("_", " ");
    }

    function getSupportStatusBadgeClass(status) {
        switch (String(status || "").toUpperCase()) {
            case "OPEN":
                return "badge-info";
            case "PENDING_STAFF":
                return "badge-warning";
            case "PENDING_CUSTOMER":
                return "badge-muted";
            case "RESOLVED":
                return "badge-success";
            default:
                return "badge-info";
        }
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#39;");
    }

    function getTextListItems(value) {
        const normalized = String(value ?? "").trim();
        if (!normalized) {
            return [];
        }

        const newlineItems = normalized
            .split(/\r?\n+/)
            .map((item) => item.trim())
            .filter(Boolean);

        if (newlineItems.length > 1) {
            return newlineItems;
        }

        const sentenceItems = normalized
            .match(/[^.!?]+[.!?]?/g)
            ?.map((item) => item.trim())
            .filter(Boolean) || [];

        return sentenceItems.length ? sentenceItems : [normalized];
    }

    function renderTextList(items) {
        if (!items.length) {
            return "<p>Details will be shared during the process.</p>";
        }

        return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
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

    function renderProductCards(container, products) {
        if (!container) {
            return;
        }

        if (!products.length) {
            container.innerHTML = '<div class="empty-state">No products are available right now.</div>';
            return;
        }

        container.innerHTML = products.map((product) => {
            const imageAsset = window.SiteUi.getProductImageAsset(product.imageUrl);
            const ratingLabel = product.reviewCount
                ? `${Number(product.averageRating || 0).toFixed(1)} / 5`
                : "New";

            return `
                <article class="product-card storefront-card">
                    <img class="${imageAsset.className}" src="${imageAsset.src}" alt="${escapeHtml(product.name)}" data-product-image-source="${escapeHtml(product.imageUrl)}">
                    <div class="product-card-content">
                        <div class="product-card-title">
                            <div>
                                <p class="eyebrow">${escapeHtml(product.categoryName)}</p>
                                <h3>${escapeHtml(product.name)}</h3>
                            </div>
                            <span class="price">${formatCurrency(product.price)}</span>
                        </div>
                        <p>${escapeHtml(product.description)}</p>
                        <div class="badge-row">
                            <span class="badge ${product.available ? "badge-success" : "badge-danger"}">${escapeHtml(product.stockStatus)}</span>
                            <span class="badge badge-info">Rating ${escapeHtml(ratingLabel)}</span>
                        </div>
                        <div class="storefront-card-footer">
                            <p>Added ${formatShortDate(product.createdAt)}</p>
                            <a class="button-secondary" href="shop.html">Open in Shop</a>
                        </div>
                    </div>
                </article>
            `;
        }).join("");
    }

    async function initializeNewArrivalsPage() {
        const grid = document.getElementById("new-arrivals-grid");
        if (!grid) {
            return;
        }

        const summary = document.getElementById("new-arrivals-summary");
        const latest = document.getElementById("new-arrivals-latest");
        const total = document.getElementById("new-arrivals-total");

        try {
            const products = await window.InventoryApi.getNewArrivals(12);
            renderProductCards(grid, products);

            if (summary) {
                summary.textContent = `Showing the latest ${products.length} products currently live in the KEFE catalog.`;
            }

            if (latest) {
                latest.textContent = products[0]?.createdAt ? formatDateTime(products[0].createdAt) : "No recent update";
            }

            if (total) {
                total.textContent = String(products.length);
            }
        } catch (error) {
            showMessage("new-arrivals-message", error.message || "Could not load new arrivals.", "error");
        }
    }

    async function initializeBestSellersPage() {
        const grid = document.getElementById("best-sellers-grid");
        if (!grid) {
            return;
        }

        const summary = document.getElementById("best-sellers-summary");
        const total = document.getElementById("best-sellers-total");
        const topRating = document.getElementById("best-sellers-top-rating");

        try {
            const products = await window.InventoryApi.getPublicProducts();
            const rankedProducts = [...products]
                .sort((left, right) => {
                    const scoreRight = (Number(right.reviewCount || 0) * 10) + Number(right.averageRating || 0);
                    const scoreLeft = (Number(left.reviewCount || 0) * 10) + Number(left.averageRating || 0);

                    if (scoreRight !== scoreLeft) {
                        return scoreRight - scoreLeft;
                    }

                    return Number(right.stockQuantity || 0) - Number(left.stockQuantity || 0);
                })
                .slice(0, 12);

            renderProductCards(grid, rankedProducts);

            if (summary) {
                summary.textContent = `Showing ${rankedProducts.length} of the strongest-performing products based on live reviews, rating quality, and current customer interest.`;
            }

            if (total) {
                total.textContent = String(rankedProducts.length);
            }

            if (topRating) {
                const leadProduct = rankedProducts[0];
                topRating.textContent = leadProduct
                    ? `${Number(leadProduct.averageRating || 0).toFixed(1)} / 5`
                    : "No rating yet";
            }
        } catch (error) {
            showMessage("best-sellers-message", error.message || "Could not load best sellers.", "error");
        }
    }

    function getCustomerSession() {
        return window.Auth ? window.Auth.getCredentials("customer") : null;
    }

    function getAdminSession() {
        return window.Auth ? window.Auth.getCredentials("admin") : null;
    }

    function renderCareerVacancies() {
        const container = document.getElementById("career-vacancies");
        if (!container) {
            return;
        }

        if (!careersState.vacancies.length) {
            container.innerHTML = '<div class="empty-state">No open positions are available right now.</div>';
            return;
        }

        const appliedVacancyIds = new Set(careersState.applications.map((item) => item.vacancyId));
        container.innerHTML = careersState.vacancies.map((vacancy) => `
            <article class="vacancy-card ${vacancy.id === careersState.selectedVacancyId ? "is-selected" : ""}">
                <div class="vacancy-card-header">
                    <div>
                        <p class="eyebrow">${escapeHtml(vacancy.department)}</p>
                        <h3>${escapeHtml(vacancy.title)}</h3>
                    </div>
                    <span class="badge ${vacancy.featured ? "badge-success" : "badge-muted"}">${vacancy.featured ? "Featured" : "Open"}</span>
                </div>
                <p>${escapeHtml(vacancy.summary)}</p>
                <div class="vacancy-meta">
                    <span>${escapeHtml(vacancy.location)}</span>
                    <span>${escapeHtml(vacancy.employmentType)}</span>
                    <span>${escapeHtml(vacancy.schedule)}</span>
                    <span>${escapeHtml(vacancy.salaryRange || "Salary shared during process")}</span>
                </div>
                    <div class="vacancy-copy-grid">
                        <div>
                            <strong>Role overview</strong>
                            <p>${escapeHtml(vacancy.description)}</p>
                        </div>
                        <div>
                            <strong>Responsibilities</strong>
                            ${renderTextList(getTextListItems(vacancy.responsibilities))}
                        </div>
                        <div>
                            <strong>Requirements</strong>
                            ${renderTextList(getTextListItems(vacancy.requirements))}
                        </div>
                        <div>
                            <strong>Benefits</strong>
                            ${renderTextList(getTextListItems(vacancy.benefits))}
                        </div>
                    </div>
                <div class="button-row">
                    <button class="button" type="button" data-vacancy-apply="${vacancy.id}" ${appliedVacancyIds.has(vacancy.id) ? "disabled" : ""}>
                        ${appliedVacancyIds.has(vacancy.id) ? "Application Sent" : "Apply Now"}
                    </button>
                </div>
            </article>
        `).join("");

        container.querySelectorAll("[data-vacancy-apply]").forEach((button) => {
            button.addEventListener("click", () => {
                careersState.selectedVacancyId = Number(button.dataset.vacancyApply);
                renderCareerVacancies();
                document.getElementById("career-application-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
            });
        });
    }

    function renderCareerApplications() {
        const container = document.getElementById("career-applications");
        if (!container) {
            return;
        }

        if (!careersState.applications.length) {
            container.innerHTML = '<div class="empty-state">You have not submitted any applications yet.</div>';
            return;
        }

        container.innerHTML = careersState.applications.map((application) => `
            <article class="application-card">
                <div class="application-card-header">
                    <div>
                        <p class="eyebrow">${escapeHtml(application.department)}</p>
                        <h3>${escapeHtml(application.vacancyTitle)}</h3>
                    </div>
                    <span class="badge badge-info">${escapeHtml(formatStatus(application.status))}</span>
                </div>
                <p>${escapeHtml(application.location)} · ${escapeHtml(application.employmentType)} · ${escapeHtml(application.schedule)}</p>
                <p>Applied ${formatDateTime(application.createdAt)}</p>
            </article>
        `).join("");
    }

    function renderCareerAuthState() {
        const authPrompt = document.getElementById("career-auth-prompt");
        const form = document.getElementById("career-application-form");
        const summary = document.getElementById("career-application-summary");
        const session = getCustomerSession();

        if (!form || !authPrompt || !summary) {
            return;
        }

        if (!session) {
            authPrompt.classList.remove("is-hidden");
            form.classList.add("is-hidden");
            summary.textContent = "Sign in with your customer account to apply to open roles.";
            return;
        }

        authPrompt.classList.add("is-hidden");
        form.classList.remove("is-hidden");
        summary.textContent = `Applications are tied to your customer profile @${session.username}. One application is allowed per vacancy.`;
    }

    async function loadCareersPage() {
        if (!document.getElementById("career-vacancies")) {
            return;
        }

        clearMessage("career-application-message");
        renderCareerAuthState();

        try {
            careersState.vacancies = await window.InventoryApi.getCareerVacancies();
            if (getCustomerSession()) {
                careersState.applications = await window.InventoryApi.getCustomerCareerApplications();
            } else {
                careersState.applications = [];
            }

            const count = document.getElementById("career-open-count");
            if (count) {
                count.textContent = String(careersState.vacancies.length);
            }

            renderCareerVacancies();
            renderCareerApplications();
        } catch (error) {
            showMessage("career-application-message", error.message || "Could not load careers data.", "error");
        }
    }

    async function handleCareerApplicationSubmit(event) {
        event.preventDefault();

        if (!getCustomerSession()) {
            window.location.href = "customer-auth.html?next=careers.html";
            return;
        }

        if (!careersState.selectedVacancyId) {
            showMessage("career-application-message", "Select a vacancy before sending your application.", "error");
            return;
        }

        const payload = {
            phone: document.getElementById("career-phone").value.trim(),
            city: document.getElementById("career-city").value.trim(),
            portfolioUrl: document.getElementById("career-portfolio").value.trim(),
            coverLetter: document.getElementById("career-cover-letter").value.trim()
        };

        try {
            await window.InventoryApi.applyToVacancy(careersState.selectedVacancyId, payload);
            showMessage("career-application-message", "Application sent successfully.", "success");
            event.target.reset();
            await loadCareersPage();
        } catch (error) {
            showMessage("career-application-message", error.message || "Could not send the application.", "error");
        }
    }

    function renderSupportConversationList() {
        const container = document.getElementById("support-conversation-list");
        if (!container) {
            return;
        }

        if (!supportState.conversations.length) {
            container.innerHTML = '<div class="empty-state">No support conversations yet. Start a new message and the team will reply here.</div>';
            return;
        }

        container.innerHTML = supportState.conversations.map((conversation) => `
            <button class="conversation-card ${conversation.id === supportState.selectedConversationId ? "is-selected" : ""}" type="button" data-conversation-id="${conversation.id}">
                <span class="eyebrow">${escapeHtml(conversation.category)}</span>
                <strong>${escapeHtml(conversation.subject)}</strong>
                <span>${escapeHtml(formatStatus(conversation.status))}</span>
                <small>Updated ${formatDateTime(conversation.lastMessageAt)}</small>
            </button>
        `).join("");

        container.querySelectorAll("[data-conversation-id]").forEach((button) => {
            button.addEventListener("click", () => {
                supportState.selectedConversationId = Number(button.dataset.conversationId);
                renderSupportConversationList();
                renderSupportConversationDetail();
            });
        });
    }

    function renderSupportConversationDetail() {
        const container = document.getElementById("support-conversation-detail");
        const replyForm = document.getElementById("support-reply-form");
        if (!container || !replyForm) {
            return;
        }

        const conversation = supportState.conversations.find((item) => item.id === supportState.selectedConversationId);
        if (!conversation) {
            container.innerHTML = '<div class="empty-state">Select a conversation to read the message history.</div>';
            replyForm.classList.add("is-hidden");
            return;
        }

        container.innerHTML = `
            <div class="panel-header">
                <div>
                    <h2>${escapeHtml(conversation.subject)}</h2>
                    <p>${escapeHtml(conversation.category)} · ${escapeHtml(formatStatus(conversation.status))}</p>
                </div>
            </div>
            <div class="chat-thread">
                ${conversation.messages.map((message) => `
                    <article class="chat-message ${message.senderRole === "CUSTOMER" ? "is-customer" : "is-staff"}">
                        <strong>${escapeHtml(message.senderName)}</strong>
                        <p>${escapeHtml(message.message).replaceAll("\n", "<br>")}</p>
                        <small>${formatDateTime(message.createdAt)}</small>
                    </article>
                `).join("")}
            </div>
        `;
        replyForm.classList.remove("is-hidden");
    }

    async function loadHelpCenterPage() {
        if (!document.getElementById("support-conversation-list")) {
            return;
        }

        const authState = document.getElementById("help-center-auth-state");
        const workspace = document.getElementById("help-center-workspace");
        const session = getCustomerSession();

        if (!session) {
            if (authState) {
                authState.innerHTML = `
                    <div class="empty-state">
                        Sign in with your customer account to send a help message and continue the conversation with support.
                        <div class="button-row margin-top-md">
                            <a class="button" href="customer-auth.html?next=help-center.html">Customer Login</a>
                        </div>
                    </div>
                `;
            }
            if (workspace) {
                workspace.classList.add("is-hidden");
            }
            return;
        }

        if (authState) {
            authState.innerHTML = "";
        }
        if (workspace) {
            workspace.classList.remove("is-hidden");
        }

        try {
            supportState.conversations = await window.InventoryApi.getCustomerSupportConversations();
            supportState.selectedConversationId = supportState.selectedConversationId || supportState.conversations[0]?.id || null;
            renderSupportConversationList();
            renderSupportConversationDetail();
        } catch (error) {
            showMessage("help-center-message", error.message || "Could not load support conversations.", "error");
        }
    }

    async function handleSupportConversationSubmit(event) {
        event.preventDefault();

        const payload = {
            subject: document.getElementById("support-subject").value.trim(),
            category: document.getElementById("support-category").value,
            message: document.getElementById("support-message").value.trim()
        };

        try {
            const conversation = await window.InventoryApi.createCustomerSupportConversation(payload);
            supportState.selectedConversationId = conversation.id;
            event.target.reset();
            showMessage("help-center-message", "Your message was sent to support.", "success");
            await loadHelpCenterPage();
        } catch (error) {
            showMessage("help-center-message", error.message || "Could not send your message.", "error");
        }
    }

    async function handleSupportReplySubmit(event) {
        event.preventDefault();
        if (!supportState.selectedConversationId) {
            return;
        }

        const textarea = document.getElementById("support-reply-message");
        const message = textarea.value.trim();
        if (!message) {
            return;
        }

        try {
            await window.InventoryApi.sendCustomerSupportMessage(supportState.selectedConversationId, { message });
            textarea.value = "";
            await loadHelpCenterPage();
        } catch (error) {
            showMessage("help-center-message", error.message || "Could not send your reply.", "error");
        }
    }

    function getTrackingStepIndex(status) {
        switch (status) {
            case "PREPARING":
                return 1;
            case "READY_FOR_PICKUP":
                return 2;
            case "COMPLETED":
                return 3;
            case "PLACED":
            default:
                return 0;
        }
    }

    function renderTrackingOrders(orders) {
        const container = document.getElementById("tracking-orders-list");
        if (!container) {
            return;
        }

        if (!orders.length) {
            container.innerHTML = '<div class="empty-state">No matching orders were found for this account.</div>';
            return;
        }

        container.innerHTML = orders.map((order) => {
            const activeIndex = getTrackingStepIndex(order.status);
            const steps = ["Placed", "Preparing", "Ready", "Completed"];

            return `
                <article class="tracking-card">
                    <div class="tracking-card-header">
                        <div>
                            <p class="eyebrow">Order ${escapeHtml(order.orderNumber)}</p>
                            <h3>${escapeHtml(formatStatus(order.status))}</h3>
                        </div>
                        <strong>${formatCurrency(order.totalAmount)}</strong>
                    </div>
                    <p><strong>Delivery address:</strong> ${escapeHtml(order.deliveryAddress || "Not available")}</p>
                    <p><strong>Placed:</strong> ${formatDateTime(order.createdAt)}</p>
                    <p><strong>Estimated ready:</strong> ${formatDateTime(order.estimatedReadyAt)}</p>
                    <div class="tracking-steps">
                        ${steps.map((label, index) => `
                            <div class="tracking-step ${index <= activeIndex ? "is-active" : ""}">
                                <span>${index + 1}</span>
                                <strong>${label}</strong>
                            </div>
                        `).join("")}
                    </div>
                    <div class="tracking-items">
                        ${order.items.map((item) => `<p>${escapeHtml(item.productName)} · ${item.quantity} x ${formatCurrency(item.unitPrice)}</p>`).join("")}
                    </div>
                </article>
            `;
        }).join("");
    }

    async function loadTrackingPage(orderNumber = "") {
        const list = document.getElementById("tracking-orders-list");
        if (!list) {
            return;
        }

        const authState = document.getElementById("tracking-auth-state");
        const workspace = document.getElementById("tracking-workspace");
        const session = getCustomerSession();

        if (!session) {
            if (authState) {
                authState.innerHTML = `
                    <div class="empty-state">
                        Sign in with your customer account to track live order status.
                        <div class="button-row margin-top-md">
                            <a class="button" href="customer-auth.html?next=delivery-tracking.html">Customer Login</a>
                        </div>
                    </div>
                `;
            }
            if (workspace) {
                workspace.classList.add("is-hidden");
            }
            return;
        }

        if (authState) {
            authState.innerHTML = "";
        }
        if (workspace) {
            workspace.classList.remove("is-hidden");
        }

        try {
            const orders = orderNumber
                ? [await window.InventoryApi.getCustomerOrderByNumber(orderNumber)]
                : await window.InventoryApi.getCustomerOrders();

            const activeCount = document.getElementById("tracking-active-count");
            const latestLabel = document.getElementById("tracking-latest-status");

            if (activeCount) {
                activeCount.textContent = String(orders.filter((order) => order.status !== "COMPLETED").length);
            }
            if (latestLabel) {
                latestLabel.textContent = orders[0] ? formatStatus(orders[0].status) : "No current order";
            }

            renderTrackingOrders(orders);
        } catch (error) {
            showMessage("tracking-message", error.message || "Could not load delivery tracking.", "error");
            renderTrackingOrders([]);
        }
    }

    async function loadAdminCareersPage() {
        const vacanciesContainer = document.getElementById("staff-career-vacancies");
        if (!vacanciesContainer) {
            return;
        }

        try {
            const [vacancies, applications] = await Promise.all([
                window.InventoryApi.getStaffCareerVacancies(),
                window.InventoryApi.getStaffCareerApplications()
            ]);

            careersState.vacancies = vacancies;
            careersState.applications = applications;

            if (
                careersState.selectedVacancyId !== null
                && !vacancies.some((item) => item.id === careersState.selectedVacancyId)
            ) {
                careersState.selectedVacancyId = null;
            }

            const openCount = document.getElementById("staff-career-open-count");
            const appCount = document.getElementById("staff-career-application-count");
            if (openCount) {
                openCount.textContent = String(vacancies.filter((item) => item.status === "OPEN").length);
            }
            if (appCount) {
                appCount.textContent = String(applications.length);
            }

            vacanciesContainer.innerHTML = vacancies.map((vacancy) => `
                <button class="conversation-card${vacancy.id === careersState.selectedVacancyId ? " is-selected" : ""}" type="button" data-staff-vacancy-id="${vacancy.id}">
                    <span class="eyebrow">${escapeHtml(vacancy.department)}</span>
                    <strong>${escapeHtml(vacancy.title)}</strong>
                    <span>${escapeHtml(formatStatus(vacancy.status))}</span>
                    <small>${vacancy.applicationCount} applications</small>
                </button>
            `).join("") || '<div class="empty-state">No vacancies available yet.</div>';

            vacanciesContainer.querySelectorAll("[data-staff-vacancy-id]").forEach((button) => {
                button.addEventListener("click", () => {
                    const vacancy = vacancies.find((item) => item.id === Number(button.dataset.staffVacancyId));
                    if (!vacancy) {
                        return;
                    }
                    careersState.selectedVacancyId = vacancy.id;
                    document.getElementById("staff-career-vacancy-id").value = String(vacancy.id);
                    document.getElementById("staff-career-title").value = vacancy.title;
                    document.getElementById("staff-career-department").value = vacancy.department;
                    document.getElementById("staff-career-location").value = vacancy.location;
                    document.getElementById("staff-career-employment-type").value = vacancy.employmentType;
                    document.getElementById("staff-career-schedule").value = vacancy.schedule;
                    document.getElementById("staff-career-salary-range").value = vacancy.salaryRange || "";
                    document.getElementById("staff-career-summary").value = vacancy.summary;
                    document.getElementById("staff-career-description").value = vacancy.description;
                    document.getElementById("staff-career-responsibilities").value = vacancy.responsibilities;
                    document.getElementById("staff-career-requirements").value = vacancy.requirements;
                    document.getElementById("staff-career-benefits").value = vacancy.benefits;
                    document.getElementById("staff-career-status").value = vacancy.status;
                    document.getElementById("staff-career-featured").checked = Boolean(vacancy.featured);
                    vacanciesContainer.querySelectorAll("[data-staff-vacancy-id]").forEach((item) => {
                        item.classList.toggle(
                            "is-selected",
                            Number(item.dataset.staffVacancyId) === vacancy.id
                        );
                    });
                });
            });

            const applicationsContainer = document.getElementById("staff-career-applications");
            if (applicationsContainer) {
                applicationsContainer.innerHTML = applications.map((application) => `
                    <article class="application-card">
                        <div class="application-card-header">
                            <div>
                                <p class="eyebrow">${escapeHtml(application.department)}</p>
                                <h3>${escapeHtml(application.vacancyTitle)}</h3>
                            </div>
                            <span class="badge badge-info">${escapeHtml(formatStatus(application.status))}</span>
                        </div>
                        <p><strong>${escapeHtml(application.fullName)}</strong> · @${escapeHtml(application.customerUsername)}</p>
                        <p>${escapeHtml(application.email)} · ${escapeHtml(application.phone)} · ${escapeHtml(application.city)}</p>
                        <p>${escapeHtml(application.coverLetter)}</p>
                        <div class="button-row">
                            ${APPLICATION_STATUS_OPTIONS.map((status) => `
                                <button
                                    class="button-secondary application-status-button${application.status === status ? " is-active" : ""}"
                                    type="button"
                                    data-application-status="${application.id}:${status}"
                                    aria-pressed="${application.status === status ? "true" : "false"}"
                                >
                                    ${formatStatus(status)}
                                </button>
                            `).join("")}
                        </div>
                    </article>
                `).join("") || '<div class="empty-state">No applications yet.</div>';

                applicationsContainer.querySelectorAll("[data-application-status]").forEach((button) => {
                    button.addEventListener("click", async () => {
                        const [applicationId, status] = button.dataset.applicationStatus.split(":");
                        try {
                            await window.InventoryApi.updateStaffCareerApplicationStatus(applicationId, { status });
                            await loadAdminCareersPage();
                        } catch (error) {
                            showMessage("staff-career-message", error.message || "Could not update application status.", "error");
                        }
                    });
                });
            }
        } catch (error) {
            showMessage("staff-career-message", error.message || "Could not load careers management.", "error");
        }
    }

    async function handleStaffCareerSubmit(event) {
        event.preventDefault();

        const vacancyId = document.getElementById("staff-career-vacancy-id").value.trim();
        const payload = {
            title: document.getElementById("staff-career-title").value.trim(),
            department: document.getElementById("staff-career-department").value.trim(),
            location: document.getElementById("staff-career-location").value.trim(),
            employmentType: document.getElementById("staff-career-employment-type").value.trim(),
            schedule: document.getElementById("staff-career-schedule").value.trim(),
            salaryRange: document.getElementById("staff-career-salary-range").value.trim(),
            summary: document.getElementById("staff-career-summary").value.trim(),
            description: document.getElementById("staff-career-description").value.trim(),
            responsibilities: document.getElementById("staff-career-responsibilities").value.trim(),
            requirements: document.getElementById("staff-career-requirements").value.trim(),
            benefits: document.getElementById("staff-career-benefits").value.trim(),
            status: document.getElementById("staff-career-status").value,
            featured: document.getElementById("staff-career-featured").checked
        };

        try {
            if (vacancyId) {
                await window.InventoryApi.updateStaffCareerVacancy(vacancyId, payload);
                showMessage("staff-career-message", "Vacancy updated.", "success");
            } else {
                await window.InventoryApi.createStaffCareerVacancy(payload);
                showMessage("staff-career-message", "Vacancy created.", "success");
            }

            careersState.selectedVacancyId = null;
            event.target.reset();
            document.getElementById("staff-career-vacancy-id").value = "";
            await loadAdminCareersPage();
        } catch (error) {
            showMessage("staff-career-message", error.message || "Could not save vacancy.", "error");
        }
    }

    async function loadAdminSupportPage() {
        const list = document.getElementById("admin-support-list");
        if (!list) {
            return;
        }

        try {
            supportState.conversations = await window.InventoryApi.getAdminSupportConversations();
            supportState.selectedConversationId = supportState.selectedConversationId || supportState.conversations[0]?.id || null;

            const openCount = document.getElementById("admin-support-open-count");
            if (openCount) {
                openCount.textContent = String(supportState.conversations.filter((item) => item.status !== "RESOLVED").length);
            }

            list.innerHTML = supportState.conversations.map((conversation) => `
                <button class="conversation-card ${conversation.id === supportState.selectedConversationId ? "is-selected" : ""}" type="button" data-admin-conversation-id="${conversation.id}">
                    <span class="eyebrow">${escapeHtml(conversation.category)}</span>
                    <strong>${escapeHtml(conversation.subject)}</strong>
                    <span class="badge ${getSupportStatusBadgeClass(conversation.status)}">${escapeHtml(formatStatus(conversation.status))}</span>
                    <span>${escapeHtml(conversation.customerFullName)}</span>
                    <small>${formatDateTime(conversation.lastMessageAt)}</small>
                </button>
            `).join("") || '<div class="empty-state">No support conversations available.</div>';

            list.querySelectorAll("[data-admin-conversation-id]").forEach((button) => {
                button.addEventListener("click", () => {
                    supportState.selectedConversationId = Number(button.dataset.adminConversationId);
                    loadAdminSupportPage();
                });
            });

            renderAdminSupportDetail();
        } catch (error) {
            showMessage("admin-support-message", error.message || "Could not load support inbox.", "error");
        }
    }

    function renderAdminSupportDetail() {
        const container = document.getElementById("admin-support-detail");
        if (!container) {
            return;
        }

        const conversation = supportState.conversations.find((item) => item.id === supportState.selectedConversationId);
        if (!conversation) {
            container.innerHTML = '<div class="empty-state">Select a conversation to review the message history.</div>';
            return;
        }

        container.innerHTML = `
            <div class="panel-header">
                <div>
                    <h2>${escapeHtml(conversation.subject)}</h2>
                    <p>${escapeHtml(conversation.customerFullName)} · @${escapeHtml(conversation.customerUsername)} · ${escapeHtml(conversation.customerEmail)}</p>
                </div>
                <span class="badge ${getSupportStatusBadgeClass(conversation.status)}">${escapeHtml(formatStatus(conversation.status))}</span>
            </div>
            <div class="button-row margin-bottom-md">
                ${SUPPORT_STATUS_OPTIONS.map((status) => `
                    <button
                        class="button-secondary support-status-button${conversation.status === status ? " is-active" : ""}"
                        type="button"
                        data-support-status="${conversation.id}:${status}"
                        aria-pressed="${conversation.status === status ? "true" : "false"}"
                    >
                        ${formatStatus(status)}
                    </button>
                `).join("")}
            </div>
            <div class="chat-thread">
                ${conversation.messages.map((message) => `
                    <article class="chat-message ${message.senderRole === "CUSTOMER" ? "is-customer" : "is-staff"}">
                        <strong>${escapeHtml(message.senderName)}</strong>
                        <p>${escapeHtml(message.message).replaceAll("\n", "<br>")}</p>
                        <small>${formatDateTime(message.createdAt)}</small>
                    </article>
                `).join("")}
            </div>
        `;

        container.querySelectorAll("[data-support-status]").forEach((button) => {
            button.addEventListener("click", async () => {
                const [conversationId, status] = button.dataset.supportStatus.split(":");
                try {
                    await window.InventoryApi.updateAdminSupportConversationStatus(conversationId, { status });
                    await loadAdminSupportPage();
                } catch (error) {
                    showMessage("admin-support-message", error.message || "Could not update conversation status.", "error");
                }
            });
        });
    }

    async function handleAdminSupportReplySubmit(event) {
        event.preventDefault();
        if (!supportState.selectedConversationId) {
            return;
        }

        const textarea = document.getElementById("admin-support-reply-message");
        const message = textarea.value.trim();
        if (!message) {
            return;
        }

        try {
            await window.InventoryApi.sendAdminSupportMessage(supportState.selectedConversationId, { message });
            textarea.value = "";
            await loadAdminSupportPage();
        } catch (error) {
            showMessage("admin-support-message", error.message || "Could not send the reply.", "error");
        }
    }

    function initializeEventHandlers() {
        const careerForm = document.getElementById("career-application-form");
        if (careerForm) {
            careerForm.addEventListener("submit", handleCareerApplicationSubmit);
        }

        const supportConversationForm = document.getElementById("support-conversation-form");
        if (supportConversationForm) {
            supportConversationForm.addEventListener("submit", handleSupportConversationSubmit);
        }

        const supportReplyForm = document.getElementById("support-reply-form");
        if (supportReplyForm) {
            supportReplyForm.addEventListener("submit", handleSupportReplySubmit);
        }

        const trackingSearchForm = document.getElementById("tracking-search-form");
        if (trackingSearchForm) {
            trackingSearchForm.addEventListener("submit", (event) => {
                event.preventDefault();
                const value = document.getElementById("tracking-order-number").value.trim();
                clearMessage("tracking-message");
                loadTrackingPage(value);
            });
        }

        const staffCareerForm = document.getElementById("staff-career-form");
        if (staffCareerForm) {
            staffCareerForm.addEventListener("submit", handleStaffCareerSubmit);
        }

        const adminSupportReplyForm = document.getElementById("admin-support-reply-form");
        if (adminSupportReplyForm) {
            adminSupportReplyForm.addEventListener("submit", handleAdminSupportReplySubmit);
        }
    }

    document.addEventListener("DOMContentLoaded", () => {
        initializeEventHandlers();
        initializeNewArrivalsPage();
        initializeBestSellersPage();
        loadCareersPage();
        loadHelpCenterPage();
        loadTrackingPage();
        loadAdminCareersPage();
        loadAdminSupportPage();
    });
}());
