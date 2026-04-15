(function () {
    const ORDER_STATUS_OPTIONS = ["PLACED", "PREPARING", "READY_FOR_PICKUP", "COMPLETED"];

    const adminProductState = {
        products: [],
        categories: [],
        dashboardProducts: [],
        quickFilter: "all",
        pagination: {
            page: 1,
            pageSize: 10,
            showAll: false,
            expanded: false
        }
    };

    const adminOrderState = {
        orders: [],
        filteredOrders: [],
        selectedOrderId: null,
        pagination: {
            page: 1,
            pageSize: 10,
            showAll: false,
            expanded: false
        }
    };

    const adminCategoryState = {
        categories: [],
        pagination: {
            page: 1,
            pageSize: 10,
            showAll: false,
            expanded: false
        }
    };

    const dashboardState = {
        orders: [],
        logs: [],
        insights: {
            lowStockAlerts: [],
            salesByCategory: [],
            generatedAt: null
        },
        ordersPagination: {
            page: 1,
            pageSize: 10,
            showAll: false,
            expanded: false
        },
        logsPagination: {
            page: 1,
            pageSize: 10,
            showAll: false,
            expanded: false
        }
    };

    const analyticsState = {
        inventoryMode: "units",
        inventoryFocus: null,
        financeMode: "latest",
        financeFocus: null,
        stockHealthFocus: null,
        inventoryValueMode: "value",
        inventoryValueFocus: null,
        revenueTrendMode: "daily",
        revenueTrendFocus: null,
        orderActivityTrendMode: "daily",
        orderActivityTrendFocus: null,
        topProductsMode: "units",
        topProductsFocus: null
    };

    const STOCK_HEALTH_COLORS = ["#111111", "#8a5a00", "#b42318", "#475467"];

    function formatCurrency(value) {
        return new Intl.NumberFormat("de-CH", {
            style: "currency",
            currency: "CHF"
        }).format(value);
    }

    function formatTimestamp(timestamp) {
        return new Intl.DateTimeFormat("de-CH", {
            dateStyle: "medium",
            timeStyle: "short"
        }).format(new Date(timestamp));
    }

    function formatCompactNumber(value) {
        return new Intl.NumberFormat("de-CH", {
            notation: "compact",
            maximumFractionDigits: 1
        }).format(value);
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#39;");
    }

    function formatPeriodLabel(date, granularity) {
        if (granularity === "monthly") {
            return new Intl.DateTimeFormat("de-CH", {
                month: "short",
                year: "numeric"
            }).format(date);
        }

        if (granularity === "weekly") {
            const end = new Date(date);
            end.setDate(end.getDate() + 6);
            return `${new Intl.DateTimeFormat("de-CH", {
                day: "2-digit",
                month: "2-digit"
            }).format(date)}-${new Intl.DateTimeFormat("de-CH", {
                day: "2-digit",
                month: "2-digit"
            }).format(end)}`;
        }

        return new Intl.DateTimeFormat("de-CH", {
            day: "2-digit",
            month: "2-digit"
        }).format(date);
    }

    function startOfPeriod(date, granularity) {
        const nextDate = new Date(date);
        nextDate.setHours(0, 0, 0, 0);

        if (granularity === "monthly") {
            nextDate.setDate(1);
            return nextDate;
        }

        if (granularity === "weekly") {
            const day = nextDate.getDay();
            const offset = day === 0 ? 6 : day - 1;
            nextDate.setDate(nextDate.getDate() - offset);
            return nextDate;
        }

        return nextDate;
    }

    function shiftPeriod(date, granularity, amount) {
        const nextDate = new Date(date);

        if (granularity === "monthly") {
            nextDate.setMonth(nextDate.getMonth() + amount);
            return nextDate;
        }

        if (granularity === "weekly") {
            nextDate.setDate(nextDate.getDate() + (amount * 7));
            return nextDate;
        }

        nextDate.setDate(nextDate.getDate() + amount);
        return nextDate;
    }

    function getTrendConfig(mode) {
        switch (mode) {
            case "weekly":
                return { granularity: "weekly", limit: 8 };
            case "monthly":
                return { granularity: "monthly", limit: 6 };
            case "daily":
            default:
                return { granularity: "daily", limit: 7 };
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

    function toNumber(value) {
        const parsedValue = Number(value);
        return Number.isFinite(parsedValue) ? parsedValue : 0;
    }

    function formatShortOrderLabel(orderNumber) {
        if (!orderNumber) {
            return "Order";
        }

        return `#${String(orderNumber).split("-").pop()}`;
    }

    function formatOrderStatus(status) {
        return String(status || "").replaceAll("_", " ");
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

    function paginateItems(items, paginationState, paginationContainerId, itemLabel, rerender) {
        const totalItems = Array.isArray(items) ? items.length : 0;
        const pageSize = paginationState.pageSize || 10;
        const showAll = Boolean(paginationState.showAll);
        const effectivePageSize = showAll ? Math.max(1, totalItems) : pageSize;
        const fallbackMeta = {
            page: 1,
            pageSize: effectivePageSize,
            totalItems,
            totalPages: 1,
            startIndex: totalItems ? 1 : 0,
            endIndex: Math.min(effectivePageSize, totalItems),
            showAll
        };
        const meta = window.SiteUi && typeof window.SiteUi.getPaginationMeta === "function"
            ? window.SiteUi.getPaginationMeta(totalItems, paginationState.page, effectivePageSize, showAll)
            : fallbackMeta;

        paginationState.page = meta.page;

        if (window.SiteUi && typeof window.SiteUi.renderPagination === "function") {
            window.SiteUi.renderPagination(paginationContainerId, {
                totalItems,
                page: paginationState.page,
                pageSize,
                itemLabel,
                showAll,
                expanded: Boolean(paginationState.expanded),
                onPageChange: (page) => {
                    paginationState.page = page;
                    paginationState.expanded = false;
                    rerender();
                },
                onToggleExpanded: (expanded) => {
                    paginationState.expanded = expanded;
                    rerender();
                },
                onToggleShowAll: (nextShowAll) => {
                    paginationState.showAll = nextShowAll;
                    paginationState.expanded = false;
                    paginationState.page = 1;
                    rerender();
                }
            });
        }

        if (showAll) {
            return items;
        }

        const startIndex = (paginationState.page - 1) * pageSize;
        return items.slice(startIndex, startIndex + pageSize);
    }

    function parseDateInputValue(value, endOfDay = false) {
        if (!value) {
            return null;
        }

        const date = new Date(`${value}${endOfDay ? "T23:59:59.999" : "T00:00:00.000"}`);
        return Number.isNaN(date.getTime()) ? null : date;
    }

    function getRelativeRangeStart(range) {
        const now = new Date();
        const start = new Date(now);

        switch (range) {
            case "week":
                start.setDate(start.getDate() - 7);
                return start;
            case "month":
                start.setMonth(start.getMonth() - 1);
                return start;
            case "quarter":
                start.setMonth(start.getMonth() - 3);
                return start;
            default:
                return null;
        }
    }

    function matchesTimeFilter(timestamp, filters) {
        const itemDate = new Date(timestamp);
        if (Number.isNaN(itemDate.getTime())) {
            return false;
        }

        if (filters.range === "custom") {
            if (filters.fromDate && itemDate < filters.fromDate) {
                return false;
            }

            if (filters.toDate && itemDate > filters.toDate) {
                return false;
            }

            return true;
        }

        const rangeStart = getRelativeRangeStart(filters.range);
        return !rangeStart || itemDate >= rangeStart;
    }

    function getTimeFilterValues(rangeId, fromId, toId) {
        const rangeElement = document.getElementById(rangeId);
        const fromElement = document.getElementById(fromId);
        const toElement = document.getElementById(toId);

        return {
            range: rangeElement ? rangeElement.value : "",
            fromDate: fromElement ? parseDateInputValue(fromElement.value) : null,
            toDate: toElement ? parseDateInputValue(toElement.value, true) : null
        };
    }

    function toggleCustomTimeFields(rangeId, fromFieldId, toFieldId) {
        const rangeElement = document.getElementById(rangeId);
        const fromField = document.getElementById(fromFieldId);
        const toField = document.getElementById(toFieldId);
        const isCustom = rangeElement && rangeElement.value === "custom";

        [fromField, toField].forEach((field) => {
            if (!field) {
                return;
            }

            field.classList.toggle("is-hidden", !isCustom);
        });
    }

    function describeTimeFilter(filters) {
        switch (filters.range) {
            case "week":
                return "from the last week";
            case "month":
                return "from the last month";
            case "quarter":
                return "from the last quarter";
            case "custom":
                if (filters.fromDate && filters.toDate) {
                    return `from ${filters.fromDate.toLocaleDateString("de-CH")} to ${filters.toDate.toLocaleDateString("de-CH")}`;
                }
                if (filters.fromDate) {
                    return `since ${filters.fromDate.toLocaleDateString("de-CH")}`;
                }
                if (filters.toDate) {
                    return `until ${filters.toDate.toLocaleDateString("de-CH")}`;
                }
                return "for the selected custom range";
            default:
                return "from all time";
        }
    }

    async function loadDashboardPage() {
        setupDashboardTimeFilters();

        const [statsResult, logsResult, ordersResult, productsResult, insightsResult] = await Promise.allSettled([
            window.InventoryApi.getDashboardStats(),
            window.InventoryApi.getInventoryLogs(),
            window.InventoryApi.getAdminOrders(),
            window.InventoryApi.getAdminProducts(),
            window.InventoryApi.getDashboardInsights()
        ]);

        const stats = statsResult.status === "fulfilled"
            ? statsResult.value
            : {
                totalProducts: 0,
                totalCategories: 0,
                lowStockProducts: 0,
                totalInventoryUnits: 0,
                totalOrders: 0,
                totalSales: 0
            };
        const logs = logsResult.status === "fulfilled" && Array.isArray(logsResult.value)
            ? logsResult.value
            : [];
        const orders = ordersResult.status === "fulfilled" && Array.isArray(ordersResult.value)
            ? ordersResult.value
            : [];
        const products = productsResult.status === "fulfilled" && Array.isArray(productsResult.value)
            ? productsResult.value
            : [];
        const insights = insightsResult.status === "fulfilled" && insightsResult.value
            ? insightsResult.value
            : {
                lowStockAlerts: [],
                salesByCategory: [],
                generatedAt: null
            };

        document.getElementById("total-products").textContent = stats.totalProducts;
        document.getElementById("total-categories").textContent = stats.totalCategories;
        document.getElementById("low-stock-products").textContent = stats.lowStockProducts;
        document.getElementById("total-units").textContent = stats.totalInventoryUnits;
        document.getElementById("total-orders").textContent = stats.totalOrders;
        document.getElementById("total-sales").textContent = formatCurrency(stats.totalSales || 0);

        dashboardState.orders = orders;
        dashboardState.logs = logs;
        dashboardState.insights = insights;

        renderDashboardAnalytics(stats, products, orders);
        renderDashboardInsights(insights);
        applyDashboardOrdersFilter();
        applyDashboardLogsFilter();
    }

    function renderDashboardInsights(insights) {
        const alertsContainer = document.getElementById("dashboard-low-stock-alerts");
        const salesContainer = document.getElementById("dashboard-category-sales");
        const generatedAt = document.getElementById("dashboard-insights-generated-at");

        if (generatedAt) {
            generatedAt.textContent = insights.generatedAt
                ? `Last generated ${formatTimestamp(insights.generatedAt)}`
                : "Waiting for the latest insight snapshot.";
        }

        if (alertsContainer) {
            const alerts = Array.isArray(insights.lowStockAlerts) ? insights.lowStockAlerts : [];
            alertsContainer.innerHTML = alerts.length
                ? alerts.map((alert) => `
                    <article class="analysis-stat insight-card">
                        <span>${alert.severity.toUpperCase()} priority</span>
                        <strong>${alert.productName}</strong>
                        <p>${alert.categoryName} · SKU ${alert.sku}</p>
                        <p>${alert.stockQuantity} in stock, target ${alert.restockThreshold}. Suggested restock: ${alert.suggestedRestockQuantity}.</p>
                    </article>
                `).join("")
                : `<div class="empty-state">No restock alerts right now. Stock levels look healthy.</div>`;
        }

        if (salesContainer) {
            const salesByCategory = Array.isArray(insights.salesByCategory) ? insights.salesByCategory : [];
            salesContainer.innerHTML = salesByCategory.length
                ? salesByCategory.map((entry) => `
                    <article class="analysis-stat insight-card">
                        <span>${entry.unitsSold} units sold</span>
                        <strong>${entry.categoryName}</strong>
                        <p>${formatCurrency(entry.revenue)} revenue generated</p>
                    </article>
                `).join("")
                : `<div class="empty-state">Sales by category will appear after the first orders come in.</div>`;
        }
    }

    async function handleDashboardExport() {
        const exportButton = document.getElementById("dashboard-export-button");

        try {
            if (exportButton) {
                exportButton.disabled = true;
                exportButton.textContent = "Exporting...";
            }

            const csvContent = await window.InventoryApi.exportDashboardCsv();
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "kefe-dashboard-export.csv";
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            showMessage("dashboard-message", "Dashboard export downloaded.", "success");
        } catch (error) {
            showMessage("dashboard-message", error.message || "Could not export the dashboard report.", "error");
        } finally {
            if (exportButton) {
                exportButton.disabled = false;
                exportButton.textContent = "Export CSV";
            }
        }
    }

    function renderDashboardAnalytics(stats, products, orders) {
        const inventoryContainer = document.getElementById("inventory-analysis-chart");
        const financeContainer = document.getElementById("finance-analysis-chart");
        const stockHealthContainer = document.getElementById("stock-health-chart");
        const inventoryValueContainer = document.getElementById("inventory-value-chart");
        const revenueTrendContainer = document.getElementById("revenue-trend-chart");
        const orderActivityTrendContainer = document.getElementById("order-activity-trend-chart");
        const topProductsContainer = document.getElementById("top-products-chart");
        const summaryContainer = document.getElementById("analysis-summary-grid");

        if (!inventoryContainer || !financeContainer || !stockHealthContainer || !inventoryValueContainer || !summaryContainer) {
            return;
        }

        adminProductState.dashboardProducts = products;

        const inventorySeries = buildInventorySeries(products);
        const financeSeries = buildFinanceSeries(orders);
        const stockHealthSeries = buildStockHealthSeries(products);
        const inventoryValueSeries = buildInventoryValueSeries(products);
        const summaryItems = buildSummaryItems(stats, products, orders, inventorySeries);

        renderInventoryAnalytics(inventoryContainer, products);
        renderFinanceAnalytics(financeContainer, orders);
        renderStockHealthAnalytics(stockHealthContainer, products);
        renderInventoryValueAnalytics(inventoryValueContainer, products);

        if (revenueTrendContainer) {
            renderRevenueTrendAnalytics(revenueTrendContainer, orders);
        }

        if (orderActivityTrendContainer) {
            renderOrderActivityTrendAnalytics(orderActivityTrendContainer, orders);
        }

        if (topProductsContainer) {
            renderTopProductsAnalytics(topProductsContainer, orders);
        }

        summaryContainer.innerHTML = summaryItems.map((item) => `
            <article class="analysis-stat">
                <span>${item.label}</span>
                <strong>${item.value}</strong>
                <p>${item.description}</p>
            </article>
        `).join("");

        setupProductComparison(products);
    }

    function renderChartRows(container, items, options) {
        if (!items.length) {
            container.innerHTML = `<div class="empty-state">${options.emptyMessage}</div>`;
            return;
        }

        const maxValue = Math.max(...items.map((item) => item.value), 0);
        const formatValue = options.formatValue || ((value) => value);

        container.innerHTML = `
            <div class="chart-stack">
                ${items.map((item, index) => {
                    const ratio = maxValue > 0 ? item.value / maxValue : 0;
                    const width = item.value > 0 ? Math.max(ratio * 100, 8) : 0;

                    return `
                        <article class="chart-row">
                            <div class="chart-row-header">
                                <span class="chart-label">${item.label}</span>
                                <strong>${formatValue(item.value)}</strong>
                            </div>
                            <div class="chart-track">
                                <span class="chart-fill chart-tone-${(index % 4) + 1}" style="width: ${width}%"></span>
                            </div>
                            <p class="chart-meta">${item.meta}</p>
                        </article>
                    `;
                }).join("")}
            </div>
        `;
    }

    function buildChartToolbar(options, activeValue, attributeName) {
        return `
            <div class="chart-toolbar">
                ${options.map((option) => `
                    <button
                        type="button"
                        class="chart-toggle ${option.value === activeValue ? "is-active" : ""}"
                        data-${attributeName}="${option.value}"
                    >
                        ${option.label}
                    </button>
                `).join("")}
            </div>
        `;
    }

    function resolveFocusedIndex(items, focusLabel) {
        if (!items.length) {
            return -1;
        }

        const focusedIndex = items.findIndex((item) => item.label === focusLabel);
        return focusedIndex >= 0 ? focusedIndex : 0;
    }

    function renderSelectableChart(container, items, options) {
        const toolbarMarkup = options.toolbarMarkup || "";

        if (!items.length) {
            container.innerHTML = `
                ${toolbarMarkup}
                <div class="empty-state">${options.emptyMessage}</div>
            `;

            if (typeof options.bindControls === "function") {
                options.bindControls();
            }
            return;
        }

        const activeIndex = resolveFocusedIndex(items, options.focusLabel);
        const activeItem = items[activeIndex];
        const maxValue = Math.max(...items.map((item) => item.value), 0);

        container.innerHTML = `
            ${toolbarMarkup}
            <div class="chart-stack">
                ${items.map((item, index) => {
                    const ratio = maxValue > 0 ? item.value / maxValue : 0;
                    const width = item.value > 0 ? Math.max(ratio * 100, 8) : 0;

                    return `
                        <button
                            type="button"
                            class="chart-row chart-row-button ${index === activeIndex ? "is-active" : ""}"
                            data-chart-index="${index}"
                        >
                            <div class="chart-row-header">
                                <span class="chart-label">${item.label}</span>
                                <strong>${options.formatValue(item.value)}</strong>
                            </div>
                            <div class="chart-track">
                                <span class="chart-fill chart-tone-${(index % 4) + 1}" style="width: ${width}%"></span>
                            </div>
                            <p class="chart-meta">${item.meta}</p>
                        </button>
                    `;
                }).join("")}
            </div>
            <div class="chart-detail-panel">
                <span class="chart-detail-label">${options.detailLabel}</span>
                <strong>${activeItem.label}</strong>
                <div class="chart-detail-value">${options.formatValue(activeItem.value)}</div>
                <p>${options.describeItem(activeItem)}</p>
            </div>
        `;

        if (typeof options.bindControls === "function") {
            options.bindControls();
        }

        container.querySelectorAll("[data-chart-index]").forEach((button) => {
            button.addEventListener("click", () => {
                const item = items[Number(button.dataset.chartIndex)];
                if (item && typeof options.onSelectItem === "function") {
                    options.onSelectItem(item);
                }
            });
        });
    }

    function renderInventoryAnalytics(container, products) {
        const modeOptions = [
            { value: "units", label: "Units" },
            { value: "value", label: "Value" },
            { value: "risk", label: "At Risk" }
        ];
        const mode = analyticsState.inventoryMode;
        const series = buildInventorySeries(products, mode);
        const toolbarMarkup = buildChartToolbar(modeOptions, mode, "inventory-mode");

        renderSelectableChart(container, series, {
            toolbarMarkup,
            focusLabel: analyticsState.inventoryFocus,
            detailLabel: "Category focus",
            emptyMessage: "No inventory data available yet.",
            formatValue: mode === "value"
                ? (value) => formatCurrency(value)
                : (value) => `${formatCompactNumber(value)} ${mode === "risk" ? "products" : "units"}`,
            describeItem: (item) => {
                if (mode === "value") {
                    return `${item.productCount} products and ${formatCompactNumber(item.units)} units combine into ${formatCurrency(item.inventoryValue)} of retail stock value.`;
                }

                if (mode === "risk") {
                    return `${item.atRiskCount} products in ${item.label} are low or out of stock, with ${formatCompactNumber(item.units)} units still on hand overall.`;
                }

                return `${item.productCount} products in ${item.label} currently account for ${formatCompactNumber(item.units)} units in stock.`;
            },
            onSelectItem: (item) => {
                analyticsState.inventoryFocus = item.label;
                renderInventoryAnalytics(container, products);
            },
            bindControls: () => {
                container.querySelectorAll("[data-inventory-mode]").forEach((button) => {
                    button.addEventListener("click", () => {
                        analyticsState.inventoryMode = button.dataset.inventoryMode;
                        analyticsState.inventoryFocus = null;
                        renderInventoryAnalytics(container, products);
                    });
                });
            }
        });
    }

    function renderFinanceAnalytics(container, orders) {
        const modeOptions = [
            { value: "latest", label: "Latest" },
            { value: "status", label: "By Status" },
            { value: "basket", label: "Basket" }
        ];
        const mode = analyticsState.financeMode;
        const series = buildFinanceSeries(orders, mode);
        const toolbarMarkup = buildChartToolbar(modeOptions, mode, "finance-mode");

        renderSelectableChart(container, series, {
            toolbarMarkup,
            focusLabel: analyticsState.financeFocus,
            detailLabel: "Finance focus",
            emptyMessage: "No customer orders have been placed yet.",
            formatValue: (value) => formatCurrency(value),
            describeItem: (item) => {
                if (mode === "status") {
                    return `${item.orderCount} orders in ${item.label.toLowerCase()} currently sum to ${formatCurrency(item.value)}, with an average of ${formatCurrency(item.averageOrderValue)} per order.`;
                }

                if (mode === "basket") {
                    return `${item.customerFullName} averaged ${formatCurrency(item.value)} per line item in ${item.label}, with ${item.itemCount} items and ${formatCurrency(item.totalAmount)} total revenue.`;
                }

                return `${item.customerFullName} placed ${item.label} with ${item.itemCount} items, bringing in ${formatCurrency(item.value)}.`;
            },
            onSelectItem: (item) => {
                analyticsState.financeFocus = item.label;
                renderFinanceAnalytics(container, orders);
            },
            bindControls: () => {
                container.querySelectorAll("[data-finance-mode]").forEach((button) => {
                    button.addEventListener("click", () => {
                        analyticsState.financeMode = button.dataset.financeMode;
                        analyticsState.financeFocus = null;
                        renderFinanceAnalytics(container, orders);
                    });
                });
            }
        });
    }

    function renderStockHealthAnalytics(container, products) {
        const items = buildStockHealthSeries(products);
        const total = items.reduce((sum, item) => sum + item.value, 0);

        if (!items.length) {
            container.innerHTML = `<div class="empty-state">No stock health data available yet.</div>`;
            return;
        }

        const activeIndex = resolveFocusedIndex(items, analyticsState.stockHealthFocus);
        const activeItem = items[activeIndex];
        analyticsState.stockHealthFocus = activeItem.label;

        let progress = 0;
        const donutStops = items.map((item, index) => {
            const start = total > 0 ? (progress / total) * 100 : 0;
            progress += item.value;
            const end = total > 0 ? (progress / total) * 100 : start;
            return `${STOCK_HEALTH_COLORS[index % STOCK_HEALTH_COLORS.length]} ${start}% ${end}%`;
        }).join(", ");

        container.innerHTML = `
            <div class="donut-layout">
                <div class="donut-visual-wrap">
                    <div class="donut-chart" style="background: conic-gradient(${donutStops})">
                        <div class="donut-hole">
                            <span>Total</span>
                            <strong>${total}</strong>
                            <p>tracked products</p>
                        </div>
                    </div>
                </div>
                <div class="donut-legend">
                    ${items.map((item, index) => `
                        <button
                            type="button"
                            class="legend-item ${index === activeIndex ? "is-active" : ""}"
                            data-stock-health-index="${index}"
                        >
                            <span class="legend-swatch" style="background: ${STOCK_HEALTH_COLORS[index % STOCK_HEALTH_COLORS.length]};"></span>
                            <span class="legend-copy">
                                <strong>${item.label}</strong>
                                <small>${item.meta}</small>
                            </span>
                            <span class="legend-value">${item.value}</span>
                        </button>
                    `).join("")}
                </div>
            </div>
            <div class="chart-detail-panel">
                <span class="chart-detail-label">Stock segment</span>
                <strong>${activeItem.label}</strong>
                <div class="chart-detail-value">${activeItem.value} products</div>
                <p>${activeItem.meta} ${total > 0 ? `That is ${Math.round((activeItem.value / total) * 100)}% of the current catalog.` : ""}</p>
            </div>
        `;

        container.querySelectorAll("[data-stock-health-index]").forEach((button) => {
            button.addEventListener("click", () => {
                const item = items[Number(button.dataset.stockHealthIndex)];
                if (!item) {
                    return;
                }

                analyticsState.stockHealthFocus = item.label;
                renderStockHealthAnalytics(container, products);
            });
        });
    }

    function renderInventoryValueAnalytics(container, products) {
        const modeOptions = [
            { value: "value", label: "Stock Value" },
            { value: "price", label: "Unit Price" },
            { value: "units", label: "Units" }
        ];
        const mode = analyticsState.inventoryValueMode;
        const series = buildInventoryValueSeries(products, mode);
        const toolbarMarkup = buildChartToolbar(modeOptions, mode, "inventory-value-mode");

        renderSelectableChart(container, series, {
            toolbarMarkup,
            focusLabel: analyticsState.inventoryValueFocus,
            detailLabel: "Product focus",
            emptyMessage: "No inventory value data available yet.",
            formatValue: mode === "units"
                ? (value) => `${formatCompactNumber(value)} units`
                : (value) => formatCurrency(value),
            describeItem: (item) => {
                if (mode === "price") {
                    return `${item.label} is one of the highest-priced products at ${formatCurrency(item.price)} per unit, with ${item.stockQuantity} units currently in stock.`;
                }

                if (mode === "units") {
                    return `${item.label} carries ${item.stockQuantity} units on hand in ${item.categoryName}, with an estimated stock value of ${formatCurrency(item.inventoryValue)}.`;
                }

                return `${item.label} in ${item.categoryName} currently holds ${formatCurrency(item.inventoryValue)} in stock value across ${item.stockQuantity} units.`;
            },
            onSelectItem: (item) => {
                analyticsState.inventoryValueFocus = item.label;
                renderInventoryValueAnalytics(container, products);
            },
            bindControls: () => {
                container.querySelectorAll("[data-inventory-value-mode]").forEach((button) => {
                    button.addEventListener("click", () => {
                        analyticsState.inventoryValueMode = button.dataset.inventoryValueMode;
                        analyticsState.inventoryValueFocus = null;
                        renderInventoryValueAnalytics(container, products);
                    });
                });
            }
        });
    }

    function buildInventorySeries(products, mode = "units") {
        const groupedCategories = new Map();

        products.forEach((product) => {
            const categoryName = product.categoryName || "Uncategorized";
            const existingCategory = groupedCategories.get(categoryName) || {
                label: categoryName,
                units: 0,
                inventoryValue: 0,
                atRiskCount: 0,
                productCount: 0
            };

            const stockQuantity = Math.max(0, toNumber(product.stockQuantity));
            existingCategory.units += stockQuantity;
            existingCategory.inventoryValue += toNumber(product.price) * stockQuantity;
            existingCategory.productCount += 1;

            if (product.active && stockQuantity <= 5) {
                existingCategory.atRiskCount += 1;
            }

            groupedCategories.set(categoryName, existingCategory);
        });

        return Array.from(groupedCategories.values())
            .map((category) => ({
                label: category.label,
                value: mode === "value"
                    ? category.inventoryValue
                    : (mode === "risk" ? category.atRiskCount : category.units),
                units: category.units,
                inventoryValue: category.inventoryValue,
                atRiskCount: category.atRiskCount,
                productCount: category.productCount,
                meta: mode === "value"
                    ? `${category.productCount} products · ${formatCompactNumber(category.units)} units`
                    : (mode === "risk"
                        ? `${category.atRiskCount} products below the healthy stock threshold`
                        : `${category.productCount} product${category.productCount === 1 ? "" : "s"} · ${formatCurrency(category.inventoryValue)} value`)
            }))
            .sort((first, second) => second.value - first.value)
            .slice(0, 6);
    }

    function buildFinanceSeries(orders, mode = "latest") {
        if (mode === "status") {
            const groupedStatuses = new Map();

            orders.forEach((order) => {
                const status = order.status || "PLACED";
                const currentEntry = groupedStatuses.get(status) || {
                    label: formatOrderStatus(status),
                    value: 0,
                    orderCount: 0,
                    averageOrderValue: 0
                };

                currentEntry.value += toNumber(order.totalAmount);
                currentEntry.orderCount += 1;
                groupedStatuses.set(status, currentEntry);
            });

            return Array.from(groupedStatuses.values())
                .map((entry) => ({
                    ...entry,
                    averageOrderValue: entry.orderCount > 0 ? entry.value / entry.orderCount : 0,
                    meta: `${entry.orderCount} orders · avg ${formatCurrency(entry.orderCount > 0 ? entry.value / entry.orderCount : 0)}`
                }))
                .sort((first, second) => second.value - first.value);
        }

        if (mode === "basket") {
            return [...orders]
                .slice(0, 6)
                .reverse()
                .map((order) => {
                    const averageLineValue = order.itemCount > 0
                        ? toNumber(order.totalAmount) / toNumber(order.itemCount)
                        : 0;

                    return {
                        label: formatShortOrderLabel(order.orderNumber),
                        value: averageLineValue,
                        meta: `${order.itemCount} item${order.itemCount === 1 ? "" : "s"} · total ${formatCurrency(order.totalAmount)}`,
                        customerFullName: order.customerFullName,
                        itemCount: order.itemCount,
                        totalAmount: toNumber(order.totalAmount)
                    };
                });
        }

        return [...orders]
            .slice(0, 6)
            .reverse()
            .map((order) => ({
                label: formatShortOrderLabel(order.orderNumber),
                value: toNumber(order.totalAmount),
                meta: `${order.itemCount} item${order.itemCount === 1 ? "" : "s"} · ${order.customerFullName}`,
                customerFullName: order.customerFullName,
                itemCount: order.itemCount,
                totalAmount: toNumber(order.totalAmount)
            }));
    }

    function buildOrderTimelineSeries(orders, mode = "daily", metric = "revenue") {
        const { granularity, limit } = getTrendConfig(mode);
        const currentPeriodStart = startOfPeriod(new Date(), granularity);
        const buckets = [];
        const bucketMap = new Map();

        for (let index = limit - 1; index >= 0; index -= 1) {
            const startDate = shiftPeriod(currentPeriodStart, granularity, -index);
            const key = startDate.toISOString();
            const entry = {
                key,
                startDate,
                label: formatPeriodLabel(startDate, granularity),
                revenue: 0,
                orderCount: 0,
                itemCount: 0
            };

            buckets.push(entry);
            bucketMap.set(key, entry);
        }

        orders.forEach((order) => {
            const createdAt = new Date(order.createdAt);
            if (Number.isNaN(createdAt.getTime())) {
                return;
            }

            const startDate = startOfPeriod(createdAt, granularity);
            const bucket = bucketMap.get(startDate.toISOString());
            if (!bucket) {
                return;
            }

            bucket.revenue += toNumber(order.totalAmount);
            bucket.orderCount += 1;
            bucket.itemCount += Math.max(0, toNumber(order.itemCount));
        });

        return buckets.map((bucket) => {
            const averageOrderValue = bucket.orderCount > 0
                ? bucket.revenue / bucket.orderCount
                : 0;

            let value = bucket.revenue;
            let meta = `${bucket.orderCount} orders · ${bucket.itemCount} items`;

            if (metric === "orders") {
                value = bucket.orderCount;
                meta = `${bucket.itemCount} items · ${formatCurrency(bucket.revenue)} revenue`;
            } else if (metric === "items") {
                value = bucket.itemCount;
                meta = `${bucket.orderCount} orders · avg ${formatCurrency(averageOrderValue)}`;
            }

            return {
                label: bucket.label,
                value,
                revenue: bucket.revenue,
                orderCount: bucket.orderCount,
                itemCount: bucket.itemCount,
                averageOrderValue,
                meta
            };
        });
    }

    function buildTopProductsSeries(orders, mode = "units") {
        const groupedItems = new Map();

        orders.forEach((order) => {
            const items = Array.isArray(order.items) ? order.items : [];
            items.forEach((item) => {
                const key = `${item.productName || "Unknown product"}-${item.productId || "x"}`;
                const currentEntry = groupedItems.get(key) || {
                    label: item.productName || "Unknown product",
                    unitsSold: 0,
                    revenue: 0,
                    orderCount: 0
                };

                currentEntry.unitsSold += Math.max(0, toNumber(item.quantity));
                currentEntry.revenue += toNumber(item.lineTotal);
                currentEntry.orderCount += 1;
                groupedItems.set(key, currentEntry);
            });
        });

        return Array.from(groupedItems.values())
            .map((entry) => ({
                label: entry.label,
                value: mode === "revenue" ? entry.revenue : entry.unitsSold,
                unitsSold: entry.unitsSold,
                revenue: entry.revenue,
                orderCount: entry.orderCount,
                meta: mode === "revenue"
                    ? `${entry.unitsSold} units sold · ${entry.orderCount} order lines`
                    : `${formatCurrency(entry.revenue)} revenue · ${entry.orderCount} order lines`
            }))
            .sort((first, second) => second.value - first.value)
            .slice(0, 6);
    }

    function renderRevenueTrendAnalytics(container, orders) {
        const modeOptions = [
            { value: "daily", label: "7 Days" },
            { value: "weekly", label: "8 Weeks" },
            { value: "monthly", label: "6 Months" }
        ];
        const mode = analyticsState.revenueTrendMode;
        const series = buildOrderTimelineSeries(orders, mode, "revenue");
        const toolbarMarkup = buildChartToolbar(modeOptions, mode, "revenue-trend-mode");

        renderSelectableChart(container, series, {
            toolbarMarkup,
            focusLabel: analyticsState.revenueTrendFocus,
            detailLabel: "Revenue period",
            emptyMessage: "No order revenue trend is available yet.",
            formatValue: (value) => formatCurrency(value),
            describeItem: (item) => `${item.orderCount} orders and ${item.itemCount} items generated ${formatCurrency(item.revenue)} in ${item.label}. Average order value: ${formatCurrency(item.averageOrderValue)}.`,
            onSelectItem: (item) => {
                analyticsState.revenueTrendFocus = item.label;
                renderRevenueTrendAnalytics(container, orders);
            },
            bindControls: () => {
                container.querySelectorAll("[data-revenue-trend-mode]").forEach((button) => {
                    button.addEventListener("click", () => {
                        analyticsState.revenueTrendMode = button.dataset.revenueTrendMode;
                        analyticsState.revenueTrendFocus = null;
                        renderRevenueTrendAnalytics(container, orders);
                    });
                });
            }
        });
    }

    function renderOrderActivityTrendAnalytics(container, orders) {
        const modeOptions = [
            { value: "daily", label: "7 Days" },
            { value: "weekly", label: "8 Weeks" },
            { value: "monthly", label: "6 Months" }
        ];
        const mode = analyticsState.orderActivityTrendMode;
        const series = buildOrderTimelineSeries(orders, mode, "orders");
        const toolbarMarkup = buildChartToolbar(modeOptions, mode, "order-activity-trend-mode");

        renderSelectableChart(container, series, {
            toolbarMarkup,
            focusLabel: analyticsState.orderActivityTrendFocus,
            detailLabel: "Activity period",
            emptyMessage: "No order activity trend is available yet.",
            formatValue: (value) => `${value} orders`,
            describeItem: (item) => `${item.label} recorded ${item.orderCount} orders with ${item.itemCount} items and ${formatCurrency(item.revenue)} in total revenue.`,
            onSelectItem: (item) => {
                analyticsState.orderActivityTrendFocus = item.label;
                renderOrderActivityTrendAnalytics(container, orders);
            },
            bindControls: () => {
                container.querySelectorAll("[data-order-activity-trend-mode]").forEach((button) => {
                    button.addEventListener("click", () => {
                        analyticsState.orderActivityTrendMode = button.dataset.orderActivityTrendMode;
                        analyticsState.orderActivityTrendFocus = null;
                        renderOrderActivityTrendAnalytics(container, orders);
                    });
                });
            }
        });
    }

    function renderTopProductsAnalytics(container, orders) {
        const modeOptions = [
            { value: "units", label: "Units Sold" },
            { value: "revenue", label: "Revenue" }
        ];
        const mode = analyticsState.topProductsMode;
        const series = buildTopProductsSeries(orders, mode);
        const toolbarMarkup = buildChartToolbar(modeOptions, mode, "top-products-mode");

        renderSelectableChart(container, series, {
            toolbarMarkup,
            focusLabel: analyticsState.topProductsFocus,
            detailLabel: "Top seller focus",
            emptyMessage: "No sold product data is available yet.",
            formatValue: mode === "revenue"
                ? (value) => formatCurrency(value)
                : (value) => `${formatCompactNumber(value)} units`,
            describeItem: (item) => mode === "revenue"
                ? `${item.label} generated ${formatCurrency(item.revenue)} across ${item.unitsSold} sold units and ${item.orderCount} order lines.`
                : `${item.label} sold ${item.unitsSold} units, generating ${formatCurrency(item.revenue)} across ${item.orderCount} order lines.`,
            onSelectItem: (item) => {
                analyticsState.topProductsFocus = item.label;
                renderTopProductsAnalytics(container, orders);
            },
            bindControls: () => {
                container.querySelectorAll("[data-top-products-mode]").forEach((button) => {
                    button.addEventListener("click", () => {
                        analyticsState.topProductsMode = button.dataset.topProductsMode;
                        analyticsState.topProductsFocus = null;
                        renderTopProductsAnalytics(container, orders);
                    });
                });
            }
        });
    }

    function buildStockHealthSeries(products) {
        const hiddenCount = products.filter((product) => !product.active).length;
        const outOfStockCount = products.filter((product) => product.active && Math.max(0, toNumber(product.stockQuantity)) === 0).length;
        const lowStockCount = products.filter((product) => {
            const stockQuantity = Math.max(0, toNumber(product.stockQuantity));
            return product.active && stockQuantity > 0 && stockQuantity <= 5;
        }).length;
        const healthyCount = products.filter((product) => product.active && Math.max(0, toNumber(product.stockQuantity)) > 5).length;

        return [
            {
                label: "Healthy Stock",
                value: healthyCount,
                meta: "Active products with more than 5 units."
            },
            {
                label: "Low Stock",
                value: lowStockCount,
                meta: "Products that are close to needing a refill."
            },
            {
                label: "Out of Stock",
                value: outOfStockCount,
                meta: "Active products currently unavailable to customers."
            },
            {
                label: "Hidden Products",
                value: hiddenCount,
                meta: "Products that are not published in the public shop."
            }
        ];
    }

    function buildInventoryValueSeries(products, mode = "value") {
        return [...products]
            .map((product) => ({
                label: product.name,
                value: mode === "price"
                    ? toNumber(product.price)
                    : (mode === "units"
                        ? Math.max(0, toNumber(product.stockQuantity))
                        : toNumber(product.price) * Math.max(0, toNumber(product.stockQuantity))),
                meta: mode === "price"
                    ? `${product.categoryName} · ${product.stockStatus}`
                    : (mode === "units"
                        ? `${product.categoryName} · ${formatCurrency(product.price)} each`
                        : `${product.categoryName} · ${Math.max(0, toNumber(product.stockQuantity))} units`),
                categoryName: product.categoryName,
                stockQuantity: Math.max(0, toNumber(product.stockQuantity)),
                price: toNumber(product.price),
                inventoryValue: toNumber(product.price) * Math.max(0, toNumber(product.stockQuantity))
            }))
            .sort((first, second) => second.value - first.value)
            .slice(0, 6);
    }

    function buildSummaryItems(stats, products, orders, inventorySeries) {
        const inventoryValue = products.reduce((total, product) => {
            return total + (toNumber(product.price) * Math.max(0, toNumber(product.stockQuantity)));
        }, 0);

        const averageOrderValue = toNumber(stats.totalOrders) > 0
            ? toNumber(stats.totalSales) / toNumber(stats.totalOrders)
            : 0;

        const lowStockCount = products.filter((product) => {
            const stockQuantity = Math.max(0, toNumber(product.stockQuantity));
            return stockQuantity > 0 && stockQuantity <= 5;
        }).length;

        const outOfStockCount = products.filter((product) => Math.max(0, toNumber(product.stockQuantity)) === 0).length;
        const topCategory = inventorySeries[0];
        const recentSalesTotal = orders.slice(0, 6).reduce((total, order) => total + toNumber(order.totalAmount), 0);

        return [
            {
                label: "Inventory Value",
                value: formatCurrency(inventoryValue),
                description: "Estimated retail value of all units currently in stock."
            },
            {
                label: "Average Order",
                value: formatCurrency(averageOrderValue),
                description: "Average basket size across all recorded customer orders."
            },
            {
                label: "Top Category",
                value: topCategory ? topCategory.label : "No data",
                description: topCategory
                    ? `${formatCompactNumber(topCategory.value)} units are currently stored in this category.`
                    : "Add products to see category-level inventory analysis."
            },
            {
                label: "Reorder Attention",
                value: `${lowStockCount + outOfStockCount} items`,
                description: `${lowStockCount} low stock, ${outOfStockCount} out of stock, CHF ${formatCompactNumber(recentSalesTotal)} from the latest 6 orders.`
            }
        ];
    }

    function populateComparisonSelect(select, products, preferredValue) {
        if (!select) {
            return;
        }

        select.innerHTML = products.map((product) => `
            <option value="${product.id}">${product.name}</option>
        `).join("");

        if (preferredValue && products.some((product) => String(product.id) === String(preferredValue))) {
            select.value = String(preferredValue);
        }
    }

    function renderProductComparison() {
        const summary = document.getElementById("product-comparison-summary");
        const grid = document.getElementById("product-comparison-grid");
        const selectA = document.getElementById("compare-product-a");
        const selectB = document.getElementById("compare-product-b");
        const products = adminProductState.dashboardProducts;

        if (!summary || !grid || !selectA || !selectB) {
            return;
        }

        if (products.length < 2) {
            summary.innerHTML = `<p class="hint">Add at least two products to compare them side by side.</p>`;
            grid.innerHTML = "";
            return;
        }

        const productA = products.find((product) => String(product.id) === String(selectA.value)) || products[0];
        const productB = products.find((product) => String(product.id) === String(selectB.value)) || products[1] || products[0];

        const priceDifference = Math.abs(toNumber(productA.price) - toNumber(productB.price));
        const stockDifference = Math.abs(toNumber(productA.stockQuantity) - toNumber(productB.stockQuantity));
        const strongerValueProduct = (toNumber(productA.price) * toNumber(productA.stockQuantity))
            >= (toNumber(productB.price) * toNumber(productB.stockQuantity))
            ? productA
            : productB;

        summary.innerHTML = `
            <p>
                <strong>${toNumber(productA.price) >= toNumber(productB.price) ? productA.name : productB.name}</strong>
                is currently more expensive by ${formatCurrency(priceDifference)},
                while <strong>${toNumber(productA.stockQuantity) >= toNumber(productB.stockQuantity) ? productA.name : productB.name}</strong>
                holds ${stockDifference} more units in stock.
                <strong>${strongerValueProduct.name}</strong> currently carries the higher stock value.
            </p>
        `;

        grid.innerHTML = [productA, productB].map((product) => {
            const inventoryValue = toNumber(product.price) * Math.max(0, toNumber(product.stockQuantity));
            return `
                <article class="comparison-card">
                    <span class="comparison-card-label">${product.categoryName}</span>
                    <h4>${product.name}</h4>
                    <div class="comparison-metrics">
                        <div>
                            <span>Price</span>
                            <strong>${formatCurrency(product.price)}</strong>
                        </div>
                        <div>
                            <span>Stock</span>
                            <strong>${product.stockQuantity}</strong>
                        </div>
                        <div>
                            <span>Status</span>
                            <strong>${product.stockStatus}</strong>
                        </div>
                        <div>
                            <span>Inventory Value</span>
                            <strong>${formatCurrency(inventoryValue)}</strong>
                        </div>
                    </div>
                    <p>${product.description}</p>
                </article>
            `;
        }).join("");
    }

    function setupProductComparison(products) {
        const selectA = document.getElementById("compare-product-a");
        const selectB = document.getElementById("compare-product-b");

        if (!selectA || !selectB) {
            return;
        }

        if (products.length < 2) {
            renderProductComparison();
            return;
        }

        const currentValueA = selectA.value;
        const currentValueB = selectB.value;
        const fallbackA = currentValueA || String(products[0].id);
        const fallbackB = currentValueB && currentValueB !== fallbackA
            ? currentValueB
            : String((products[1] || products[0]).id);

        populateComparisonSelect(selectA, products, fallbackA);
        populateComparisonSelect(selectB, products, fallbackB);

        if (selectA.dataset.initialized !== "true") {
            selectA.dataset.initialized = "true";
            selectA.addEventListener("change", renderProductComparison);
        }

        if (selectB.dataset.initialized !== "true") {
            selectB.dataset.initialized = "true";
            selectB.addEventListener("change", renderProductComparison);
        }

        renderProductComparison();
    }

    function setupDashboardTimeFilters() {
        [
            {
                formId: "dashboard-orders-time-form",
                rangeId: "dashboard-orders-range",
                fromId: "dashboard-orders-from",
                toId: "dashboard-orders-to",
                fromFieldId: "dashboard-orders-from-field",
                toFieldId: "dashboard-orders-to-field",
                apply: applyDashboardOrdersFilter
            },
            {
                formId: "dashboard-logs-time-form",
                rangeId: "dashboard-logs-range",
                fromId: "dashboard-logs-from",
                toId: "dashboard-logs-to",
                fromFieldId: "dashboard-logs-from-field",
                toFieldId: "dashboard-logs-to-field",
                apply: applyDashboardLogsFilter
            }
        ].forEach((config) => {
            const form = document.getElementById(config.formId);
            if (!form || form.dataset.initialized === "true") {
                return;
            }

            form.dataset.initialized = "true";
            toggleCustomTimeFields(config.rangeId, config.fromFieldId, config.toFieldId);

            [config.rangeId, config.fromId, config.toId].forEach((id) => {
                const element = document.getElementById(id);
                if (!element) {
                    return;
                }

                const eventName = element.tagName === "SELECT" ? "change" : "input";
                element.addEventListener(eventName, () => {
                    if (id === config.rangeId) {
                        toggleCustomTimeFields(config.rangeId, config.fromFieldId, config.toFieldId);
                    }

                    if (config.apply === applyDashboardOrdersFilter) {
                        dashboardState.ordersPagination.page = 1;
                    }

                    if (config.apply === applyDashboardLogsFilter) {
                        dashboardState.logsPagination.page = 1;
                    }

                    config.apply();
                });
            });
        });
    }

    function applyDashboardOrdersFilter() {
        const filters = getTimeFilterValues("dashboard-orders-range", "dashboard-orders-from", "dashboard-orders-to");
        const filteredOrders = dashboardState.orders.filter((order) => matchesTimeFilter(order.createdAt, filters));
        const visibleOrders = paginateItems(
            filteredOrders,
            dashboardState.ordersPagination,
            "dashboard-orders-pagination",
            "orders",
            applyDashboardOrdersFilter
        );
        const summary = document.getElementById("dashboard-orders-summary");

        renderRecentOrders(visibleOrders);

        if (summary) {
            if (!filteredOrders.length) {
                summary.textContent = `No orders found ${describeTimeFilter(filters)}.`;
            } else {
                summary.textContent = `Showing ${visibleOrders.length} of ${filteredOrders.length} orders ${describeTimeFilter(filters)}.`;
            }
        }
    }

    function applyDashboardLogsFilter() {
        const filters = getTimeFilterValues("dashboard-logs-range", "dashboard-logs-from", "dashboard-logs-to");
        const filteredLogs = dashboardState.logs.filter((log) => matchesTimeFilter(log.timestamp, filters));
        const visibleLogs = paginateItems(
            filteredLogs,
            dashboardState.logsPagination,
            "dashboard-logs-pagination",
            "activity entries",
            applyDashboardLogsFilter
        );
        const summary = document.getElementById("dashboard-logs-summary");

        renderInventoryLogs(visibleLogs);

        if (summary) {
            if (!filteredLogs.length) {
                summary.textContent = `No inventory activity found ${describeTimeFilter(filters)}.`;
            } else {
                summary.textContent = `Showing ${visibleLogs.length} of ${filteredLogs.length} activity entries ${describeTimeFilter(filters)}.`;
            }
        }
    }

    function populateOrderStatusFilterOptions() {
        const select = document.getElementById("orders-filter-status");
        if (!select) {
            return;
        }

        const previousValue = select.value;
        select.innerHTML = `
            <option value="">All statuses</option>
            ${ORDER_STATUS_OPTIONS.map((status) => `<option value="${status}">${formatOrderStatus(status)}</option>`).join("")}
        `;

        if (ORDER_STATUS_OPTIONS.includes(previousValue)) {
            select.value = previousValue;
        }
    }

    function getOrderFilterValues() {
        const searchInput = document.getElementById("orders-search");
        const statusSelect = document.getElementById("orders-filter-status");
        const timeFilters = getTimeFilterValues("orders-filter-range", "orders-filter-from", "orders-filter-to");

        return {
            search: searchInput ? searchInput.value.trim().toLowerCase() : "",
            status: statusSelect ? statusSelect.value : "",
            range: timeFilters.range,
            fromDate: timeFilters.fromDate,
            toDate: timeFilters.toDate
        };
    }

    function updateOrderFilterSummary(filteredCount, totalCount) {
        const summary = document.getElementById("orders-filter-summary");
        if (!summary) {
            return;
        }

        if (!totalCount) {
            summary.textContent = "No orders available yet.";
            return;
        }

        const { search, status, range, fromDate, toDate } = getOrderFilterValues();
        if (!search && !status && !range && !fromDate && !toDate) {
            summary.textContent = `Showing all ${totalCount} orders.`;
            return;
        }

        summary.textContent = `Showing ${filteredCount} of ${totalCount} orders ${describeTimeFilter({ range, fromDate, toDate })}.`;
    }

    function renderOrderOverviewStats(orders) {
        const totalOrders = orders.length;
        const placedOrders = orders.filter((order) => order.status === "PLACED").length;
        const activeOrders = orders.filter((order) => order.status === "PREPARING" || order.status === "READY_FOR_PICKUP").length;
        const completedOrders = orders.filter((order) => order.status === "COMPLETED").length;
        const totalRevenue = orders.reduce((sum, order) => sum + toNumber(order.totalAmount), 0);

        const totalElement = document.getElementById("orders-total-count");
        const placedElement = document.getElementById("orders-placed-count");
        const activeElement = document.getElementById("orders-active-count");
        const completedElement = document.getElementById("orders-completed-count");
        const revenueElement = document.getElementById("orders-revenue-total");

        if (totalElement) {
            totalElement.textContent = totalOrders;
        }
        if (placedElement) {
            placedElement.textContent = placedOrders;
        }
        if (activeElement) {
            activeElement.textContent = activeOrders;
        }
        if (completedElement) {
            completedElement.textContent = completedOrders;
        }
        if (revenueElement) {
            revenueElement.textContent = formatCurrency(totalRevenue);
        }
    }

    function renderOrdersManagementTable(orders) {
        const tableBody = document.getElementById("orders-table-body");
        if (!tableBody) {
            return;
        }

        if (!orders.length) {
            paginateItems([], adminOrderState.pagination, "orders-pagination", "orders", () => renderOrdersManagementTable(adminOrderState.filteredOrders));
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7">
                        <div class="empty-state">No orders match the current filters.</div>
                    </td>
                </tr>
            `;
            return;
        }

        const paginatedOrders = paginateItems(
            orders,
            adminOrderState.pagination,
            "orders-pagination",
            "orders",
            () => renderOrdersManagementTable(adminOrderState.filteredOrders)
        );
        const shouldSyncSelection = paginatedOrders.length
            && !paginatedOrders.some((order) => order.id === adminOrderState.selectedOrderId);

        if (shouldSyncSelection) {
            adminOrderState.selectedOrderId = paginatedOrders[0].id;
        }

        tableBody.innerHTML = paginatedOrders.map((order) => `
            <tr ${adminOrderState.selectedOrderId === order.id ? 'class="selected-table-row"' : ""}>
                <td>${order.orderNumber}</td>
                <td>${order.customerFullName}<br><span class="hint">@${order.customerUsername}</span></td>
                <td>${order.itemCount}</td>
                <td>${formatCurrency(order.totalAmount)}</td>
                <td><span class="badge ${resolveOrderBadgeClass(order.status)}">${formatOrderStatus(order.status)}</span></td>
                <td>${formatTimestamp(order.createdAt)}</td>
                <td>
                    <button class="link-button open-order-button" data-order-id="${order.id}">
                        <span class="material-symbols-outlined" aria-hidden="true">receipt_long</span>
                        <span>Open</span>
                    </button>
                </td>
            </tr>
        `).join("");

        document.querySelectorAll(".open-order-button").forEach((button) => {
            button.addEventListener("click", () => {
                adminOrderState.selectedOrderId = Number(button.dataset.orderId);
                renderOrdersManagementTable(adminOrderState.filteredOrders);
                renderSelectedOrderDetail();
            });
        });

        if (shouldSyncSelection) {
            renderSelectedOrderDetail();
        }
    }

    function renderSelectedOrderDetail() {
        const container = document.getElementById("order-detail-content");
        if (!container) {
            return;
        }

        const selectedOrder = adminOrderState.orders.find((order) => order.id === adminOrderState.selectedOrderId);
        if (!selectedOrder) {
            container.innerHTML = `
                <div class="empty-state">
                    Select an order from the table to inspect customer details and manage its status.
                </div>
            `;
            return;
        }

        const orderItems = Array.isArray(selectedOrder.items) ? selectedOrder.items : [];
        const statusOptions = ORDER_STATUS_OPTIONS.map((status) => `
            <option value="${status}" ${status === selectedOrder.status ? "selected" : ""}>
                ${formatOrderStatus(status)}
            </option>
        `).join("");
        const statusLocked = selectedOrder.status === "COMPLETED";

        container.innerHTML = `
            <div class="order-detail-card">
                <div class="order-detail-header">
                    <div>
                        <span class="eyebrow">Selected Order</span>
                        <h3>${selectedOrder.orderNumber}</h3>
                        <p>${selectedOrder.customerFullName} <span class="hint">@${selectedOrder.customerUsername}</span></p>
                    </div>
                    <span class="badge ${resolveOrderBadgeClass(selectedOrder.status)}">${formatOrderStatus(selectedOrder.status)}</span>
                </div>

                <div class="order-meta-grid">
                    <div>
                        <span>Placed At</span>
                        <strong>${formatTimestamp(selectedOrder.createdAt)}</strong>
                    </div>
                    <div>
                        <span>Total</span>
                        <strong>${formatCurrency(selectedOrder.totalAmount)}</strong>
                    </div>
                    <div>
                        <span>Items</span>
                        <strong>${selectedOrder.itemCount}</strong>
                    </div>
                    <div>
                        <span>Pickup / Delivery</span>
                        <strong>${selectedOrder.deliveryAddress || "No address provided"}</strong>
                    </div>
                </div>

                <div class="order-note-block">
                    <span>Customer Note</span>
                    <p>${selectedOrder.note || "No note was added for this order."}</p>
                </div>

                <form id="order-status-form" class="status-form">
                    <div class="field">
                        <label for="order-status-select">Order status</label>
                        <select id="order-status-select" ${statusLocked ? "disabled" : ""}>
                            ${statusOptions}
                        </select>
                    </div>
                    <div class="field align-end">
                        <button class="button" type="submit" ${statusLocked ? "disabled" : ""}>
                            Save Status
                        </button>
                    </div>
                </form>

                <section class="order-items-list">
                    <h4>Order Items</h4>
                    ${orderItems.length ? orderItems.map((item) => {
                        const imageAsset = getProductImageAsset(item.imageUrl);

                        return `
                        <article class="order-admin-item">
                            <img class="${imageAsset.className}" src="${imageAsset.src}" alt="${item.productName}" loading="lazy" data-product-image-source="${item.imageUrl}" />
                            <div class="order-admin-item-copy">
                                <strong>${item.productName}</strong>
                                <p>${item.quantity} x ${formatCurrency(item.unitPrice)}</p>
                            </div>
                            <strong>${formatCurrency(item.lineTotal)}</strong>
                        </article>
                    `;
                    }).join("") : '<div class="empty-state">This order does not contain visible item details.</div>'}
                </section>
            </div>
        `;

        const form = document.getElementById("order-status-form");
        if (form && !statusLocked) {
            form.addEventListener("submit", async (event) => {
                event.preventDefault();
                clearMessage("orders-message");

                try {
                    const updatedOrder = await window.InventoryApi.updateAdminOrderStatus(selectedOrder.id, {
                        status: document.getElementById("order-status-select").value
                    });

                    adminOrderState.orders = adminOrderState.orders.map((order) => (
                        order.id === updatedOrder.id ? updatedOrder : order
                    ));

                    showMessage("orders-message", "Order status updated successfully.", "success");
                    renderOrderOverviewStats(adminOrderState.orders);
                    applyOrderFilters();
                } catch (error) {
                    const message = error && (error.status === 404 || error.status === 405)
                        ? "Order status updates need the backend to be restarted so the new admin orders API is active."
                        : (error.message || "Could not update order status.");
                    showMessage("orders-message", message, "error");
                }
            });
        }
    }

    function applyOrderFilters() {
        const filters = getOrderFilterValues();
        adminOrderState.filteredOrders = adminOrderState.orders.filter((order) => {
            const searchableText = [
                order.orderNumber,
                order.customerFullName,
                order.customerUsername,
                order.deliveryAddress || ""
            ].join(" ").toLowerCase();

            const matchesSearch = !filters.search || searchableText.includes(filters.search);
            const matchesStatus = !filters.status || order.status === filters.status;
            const matchesTime = matchesTimeFilter(order.createdAt, filters);
            return matchesSearch && matchesStatus && matchesTime;
        });

        if (!adminOrderState.filteredOrders.some((order) => order.id === adminOrderState.selectedOrderId)) {
            adminOrderState.selectedOrderId = adminOrderState.filteredOrders.length
                ? adminOrderState.filteredOrders[0].id
                : null;
        }

        renderOrdersManagementTable(adminOrderState.filteredOrders);
        updateOrderFilterSummary(adminOrderState.filteredOrders.length, adminOrderState.orders.length);
        renderSelectedOrderDetail();
    }

    function setupOrderFilters() {
        const form = document.getElementById("order-filters-form");
        if (!form || form.dataset.initialized === "true") {
            return;
        }

        form.dataset.initialized = "true";

        toggleCustomTimeFields("orders-filter-range", "orders-from-field", "orders-to-field");

        ["orders-search", "orders-filter-status", "orders-filter-range", "orders-filter-from", "orders-filter-to"].forEach((id) => {
            const element = document.getElementById(id);
            if (!element) {
                return;
            }

            const eventName = element.tagName === "SELECT" ? "change" : "input";
            element.addEventListener(eventName, () => {
                if (id === "orders-filter-range") {
                    toggleCustomTimeFields("orders-filter-range", "orders-from-field", "orders-to-field");
                }

                adminOrderState.pagination.page = 1;
                applyOrderFilters();
            });
        });

        const resetButton = document.getElementById("orders-filters-reset");
        if (resetButton) {
            resetButton.addEventListener("click", () => {
                form.reset();
                toggleCustomTimeFields("orders-filter-range", "orders-from-field", "orders-to-field");
                adminOrderState.pagination.page = 1;
                applyOrderFilters();
            });
        }
    }

    async function loadOrdersPage() {
        clearMessage("orders-message");
        setupOrderFilters();
        populateOrderStatusFilterOptions();

        try {
            const orders = await window.InventoryApi.getAdminOrders();
            adminOrderState.orders = Array.isArray(orders) ? orders : [];
            adminOrderState.selectedOrderId = adminOrderState.orders.length ? adminOrderState.orders[0].id : null;

            renderOrderOverviewStats(adminOrderState.orders);
            applyOrderFilters();
        } catch (error) {
            adminOrderState.orders = [];
            adminOrderState.filteredOrders = [];
            adminOrderState.selectedOrderId = null;
            renderOrderOverviewStats([]);
            renderOrdersManagementTable([]);
            renderSelectedOrderDetail();
            updateOrderFilterSummary(0, 0);
            showMessage("orders-message", error.message || "Could not load orders.", "error");
        }
    }

    function renderRecentOrders(orders) {
        const tableBody = document.getElementById("recent-orders-body");
        if (!tableBody) {
            return;
        }

        if (!orders.length) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6">
                        <div class="empty-state">No customer orders have been placed yet.</div>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = orders.map((order) => `
            <tr>
                <td>${order.orderNumber}</td>
                <td>${order.customerFullName}<br><span class="hint">@${order.customerUsername}</span></td>
                <td>${order.itemCount}</td>
                <td>${formatCurrency(order.totalAmount)}</td>
                <td><span class="badge ${resolveOrderBadgeClass(order.status)}">${formatOrderStatus(order.status)}</span></td>
                <td>${formatTimestamp(order.createdAt)}</td>
            </tr>
        `).join("");
    }

    function renderInventoryLogs(logs) {
        const tableBody = document.getElementById("inventory-log-body");
        if (!tableBody) {
            return;
        }

        if (!logs.length) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5">
                        <div class="empty-state">No inventory activity available yet.</div>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = logs.map((log) => `
            <tr>
                <td>${log.productName}</td>
                <td>${log.actionType.replaceAll("_", " ")}</td>
                <td>${log.changeAmount > 0 ? `+${log.changeAmount}` : log.changeAmount}</td>
                <td>${log.note || "-"}</td>
                <td>${formatTimestamp(log.timestamp)}</td>
            </tr>
        `).join("");
    }

    function getProductFilterValues() {
        const searchInput = document.getElementById("products-search");
        const categorySelect = document.getElementById("products-filter-category");
        const minPriceInput = document.getElementById("products-filter-min-price");
        const maxPriceInput = document.getElementById("products-filter-max-price");

        return {
            search: searchInput ? searchInput.value.trim().toLowerCase() : "",
            categoryId: categorySelect ? categorySelect.value : "",
            minPrice: minPriceInput && minPriceInput.value !== "" ? Number(minPriceInput.value) : null,
            maxPrice: maxPriceInput && maxPriceInput.value !== "" ? Number(maxPriceInput.value) : null,
            quickFilter: adminProductState.quickFilter || "all"
        };
    }

    function hasActiveProductFilters() {
        const filters = getProductFilterValues();
        return Boolean(
            filters.search ||
            filters.categoryId ||
            filters.minPrice !== null ||
            filters.maxPrice !== null ||
            filters.quickFilter !== "all"
        );
    }

    function matchesProductQuickFilter(product, filter) {
        const stockQuantity = Number(product.stockQuantity) || 0;
        const restockThreshold = Number.isFinite(Number(product.restockThreshold))
            ? Number(product.restockThreshold)
            : 5;

        switch (filter) {
            case "low-stock":
                return stockQuantity > 0 && stockQuantity <= restockThreshold;
            case "out-of-stock":
                return stockQuantity === 0;
            case "in-stock":
                return stockQuantity > 0;
            case "unavailable":
                return !product.available;
            default:
                return true;
        }
    }

    function syncProductQuickFilterButtons() {
        document.querySelectorAll("[data-product-quick-filter]").forEach((button) => {
            const isActive = button.dataset.productQuickFilter === adminProductState.quickFilter;
            button.classList.toggle("is-active", isActive);
            button.setAttribute("aria-pressed", String(isActive));
        });
    }

    function updateProductFilterSummary(filteredCount, totalCount) {
        const summary = document.getElementById("products-filter-summary");
        if (!summary) {
            return;
        }

        if (!totalCount) {
            summary.textContent = "No products available yet.";
            return;
        }

        if (!hasActiveProductFilters()) {
            summary.textContent = `Showing all ${totalCount} products.`;
            return;
        }

        summary.textContent = `Showing ${filteredCount} of ${totalCount} products.`;
    }

    function populateProductFilterOptions(categories) {
        const select = document.getElementById("products-filter-category");
        if (!select) {
            return;
        }

        const previousValue = select.value;
        const normalizedCategories = categories
            .map((category) => ({
                id: String(category.id),
                name: category.name
            }))
            .sort((first, second) => first.name.localeCompare(second.name));

        select.innerHTML = `
            <option value="">All categories</option>
            ${normalizedCategories.map((category) => `<option value="${category.id}">${category.name}</option>`).join("")}
        `;

        if (normalizedCategories.some((category) => category.id === previousValue)) {
            select.value = previousValue;
        }
    }

    function applyProductFilters() {
        const filters = getProductFilterValues();
        const filteredProducts = adminProductState.products.filter((product) => {
            const searchHaystack = [
                product.name,
                product.sku,
                product.barcode
            ]
                .map((value) => String(value || "").toLowerCase())
                .join(" ");
            const matchesSearch = !filters.search || searchHaystack.includes(filters.search);
            const matchesCategory = !filters.categoryId || String(product.categoryId) === filters.categoryId;
            const price = toNumber(product.price);
            const matchesMinPrice = filters.minPrice === null || price >= filters.minPrice;
            const matchesMaxPrice = filters.maxPrice === null || price <= filters.maxPrice;
            const matchesQuickFilter = matchesProductQuickFilter(product, filters.quickFilter);

            return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice && matchesQuickFilter;
        });

        renderProductsTable(filteredProducts);
        updateProductFilterSummary(filteredProducts.length, adminProductState.products.length);
    }

    function setupProductFilters() {
        const form = document.getElementById("product-filters-form");
        if (!form || form.dataset.initialized === "true") {
            return;
        }

        form.dataset.initialized = "true";

        ["products-search", "products-filter-category", "products-filter-min-price", "products-filter-max-price"].forEach((id) => {
            const element = document.getElementById(id);
            if (!element) {
                return;
            }

            const eventName = element.tagName === "SELECT" ? "change" : "input";
            element.addEventListener(eventName, () => {
                adminProductState.pagination.page = 1;
                applyProductFilters();
            });
        });

        const resetButton = document.getElementById("products-filters-reset");
        if (resetButton) {
            resetButton.addEventListener("click", () => {
                form.reset();
                adminProductState.quickFilter = "all";
                syncProductQuickFilterButtons();
                adminProductState.pagination.page = 1;
                applyProductFilters();
            });
        }

        document.querySelectorAll("[data-product-quick-filter]").forEach((button) => {
            button.addEventListener("click", () => {
                adminProductState.quickFilter = button.dataset.productQuickFilter || "all";
                syncProductQuickFilterButtons();
                adminProductState.pagination.page = 1;
                applyProductFilters();
            });
        });

        syncProductQuickFilterButtons();
    }

    async function loadProductsPage() {
        const [productsResult, categoriesResult] = await Promise.allSettled([
            window.InventoryApi.getAdminProducts(),
            window.InventoryApi.getAdminCategories()
        ]);

        if (productsResult.status !== "fulfilled" || !Array.isArray(productsResult.value)) {
            showMessage("products-message", "Could not load products.", "error");
            renderProductsTable([]);
            populateStockProductOptions([]);
            updateProductFilterSummary(0, 0);
            return;
        }

        adminProductState.products = productsResult.value;
        adminProductState.categories = categoriesResult.status === "fulfilled" && Array.isArray(categoriesResult.value)
            ? categoriesResult.value
            : [];

        populateProductFilterOptions(adminProductState.categories);
        populateStockProductOptions(adminProductState.products);
        applyProductFilters();

        if (categoriesResult.status === "rejected") {
            showMessage("products-message", "Products loaded, but category filter data could not be refreshed.", "error");
        }
    }

    function renderProductPreview(product) {
        const content = document.getElementById("product-preview-content");
        const title = document.getElementById("product-preview-title");
        if (!content || !title || !product) {
            return;
        }

        const badgeClass = product.stockQuantity === 0
            ? "badge-danger"
            : product.stockQuantity <= 5
                ? "badge-warning"
                : "badge-success";

        const safeName = escapeHtml(product.name || "Untitled product");
        const safeCategory = escapeHtml(product.categoryName || "Uncategorized");
        const safeDescription = escapeHtml(product.description || "No description added yet.").replaceAll("\n", "<br>");
        const safeSku = escapeHtml(product.sku || "-");
        const safeBarcode = escapeHtml(product.barcode || "-");
        const safeImageUrl = escapeHtml(product.imageUrl || "");

        title.textContent = product.name || "Preview";
        content.innerHTML = `
            <div class="product-preview-hero">
                <img
                    class="product-preview-image"
                    src="${safeImageUrl}"
                    alt="${safeName}"
                    data-product-image-source="${safeImageUrl}"
                    loading="lazy"
                    draggable="false"
                />
                <div class="product-preview-copy">
                    <p class="eyebrow">${safeCategory}</p>
                    <h3>${safeName}</h3>
                    <p>${safeDescription}</p>
                </div>
            </div>
            <div class="product-preview-meta">
                <div class="product-preview-meta-item">
                    <span>SKU</span>
                    <strong>${safeSku}</strong>
                </div>
                <div class="product-preview-meta-item">
                    <span>Barcode</span>
                    <strong>${safeBarcode}</strong>
                </div>
                <div class="product-preview-meta-item">
                    <span>Price</span>
                    <strong>${formatCurrency(product.price)}</strong>
                </div>
                <div class="product-preview-meta-item">
                    <span>Stock</span>
                    <strong>${product.stockQuantity}</strong>
                </div>
                <div class="product-preview-meta-item">
                    <span>Restock At</span>
                    <strong>${product.restockThreshold ?? "-"}</strong>
                </div>
                <div class="product-preview-meta-item">
                    <span>Status</span>
                    <strong><span class="badge ${badgeClass}">${escapeHtml(product.stockStatus || "-")}</span></strong>
                </div>
                <div class="product-preview-meta-item">
                    <span>Active</span>
                    <strong>${product.active ? "Yes" : "No"}</strong>
                </div>
                <div class="product-preview-meta-item">
                    <span>Availability</span>
                    <strong>${product.available ? "Visible & available" : "Visible but unavailable"}</strong>
                </div>
            </div>
        `;

        window.SiteUi?.applyProductImageToElement(
            content.querySelector("img[data-product-image-source]"),
            product.imageUrl,
            product.name || "Product"
        );
    }

    function openProductPreview(productId) {
        const product = adminProductState.products.find((item) => String(item.id) === String(productId));
        if (!product) {
            return;
        }

        renderProductPreview(product);
        document.body.classList.add("admin-modal-open");
        document.getElementById("product-preview-modal")?.setAttribute("aria-hidden", "false");
        document.getElementById("product-preview-close")?.focus();
    }

    function closeProductPreview() {
        document.body.classList.remove("admin-modal-open");
        document.getElementById("product-preview-modal")?.setAttribute("aria-hidden", "true");
    }

    function setupProductPreviewModal() {
        const modal = document.getElementById("product-preview-modal");
        if (!modal || modal.dataset.initialized === "true") {
            return;
        }

        modal.dataset.initialized = "true";
        document.getElementById("product-preview-close")?.addEventListener("click", closeProductPreview);
        document.getElementById("product-preview-backdrop")?.addEventListener("click", closeProductPreview);
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && document.body.classList.contains("admin-modal-open")) {
                closeProductPreview();
            }
        });
    }

    function renderProductsTable(products) {
        const tableBody = document.getElementById("products-table-body");
        if (!tableBody) {
            return;
        }

        if (!products.length) {
            paginateItems([], adminProductState.pagination, "products-pagination", "products", applyProductFilters);
            tableBody.innerHTML = `
                <tr>
                    <td colspan="9">
                        <div class="empty-state">No products found. Create your first product to publish the catalog.</div>
                    </td>
                </tr>
            `;
            return;
        }

        const paginatedProducts = paginateItems(
            products,
            adminProductState.pagination,
            "products-pagination",
            "products",
            applyProductFilters
        );

        tableBody.innerHTML = paginatedProducts.map((product) => {
            const badgeClass = product.stockQuantity === 0
                ? "badge-danger"
                : product.stockQuantity <= 5
                    ? "badge-warning"
                    : "badge-success";

            const productName = product.name || "Untitled product";
            const safeName = escapeHtml(productName);
            const safeCategory = escapeHtml(product.categoryName || "-");
            const safeStockStatus = escapeHtml(product.stockStatus || "-");

            return `
                <tr>
                    <td>${safeName}</td>
                    <td>${safeCategory}</td>
                    <td>${formatCurrency(product.price)}</td>
                    <td>${product.stockQuantity}</td>
                    <td>${product.restockThreshold ?? "-"}</td>
                    <td><span class="badge ${badgeClass}">${safeStockStatus}</span></td>
                    <td>${product.active ? "Yes" : "No"}</td>
                    <td>${product.available ? "Visible & available" : "Visible but unavailable"}</td>
                    <td>
                        <div class="table-actions">
                            <button
                                class="link-button product-view-button"
                                type="button"
                                data-product-preview-id="${product.id}"
                                aria-label="View ${safeName}"
                                title="View product"
                            >
                                <span class="material-symbols-outlined" aria-hidden="true">visibility</span>
                            </button>
                            <a class="link-button" href="product-form.html?id=${product.id}">
                                <span class="material-symbols-outlined" aria-hidden="true">edit</span>
                                <span>Edit</span>
                            </a>
                            <button class="link-button delete-product-button" type="button" data-product-id="${product.id}" data-product-name="${safeName}">
                                <span class="material-symbols-outlined" aria-hidden="true">delete</span>
                                <span>Delete</span>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join("");

        document.querySelectorAll("[data-product-preview-id]").forEach((button) => {
            button.addEventListener("click", () => {
                openProductPreview(button.dataset.productPreviewId);
            });
        });

        document.querySelectorAll(".delete-product-button").forEach((button) => {
            button.addEventListener("click", async () => {
                const productId = button.dataset.productId;
                const productName = button.dataset.productName;
                const confirmed = window.confirm(`Delete "${productName}"? This will also remove its inventory logs.`);
                if (!confirmed) {
                    return;
                }

                try {
                    await window.InventoryApi.deleteProduct(productId);
                    showMessage("products-message", "Product deleted successfully.", "success");
                    await loadProductsPage();
                } catch (error) {
                    showMessage("products-message", error.message || "Could not delete product.", "error");
                }
            });
        });
    }

    function populateStockProductOptions(products) {
        const select = document.getElementById("stock-product-id");
        if (!select) {
            return;
        }

        select.innerHTML = products.map((product) => `
            <option value="${product.id}">${product.name} (${product.stockQuantity} units)</option>
        `).join("");
    }

    async function handleStockFormSubmit(event) {
        event.preventDefault();
        clearMessage("stock-message");

        const productId = document.getElementById("stock-product-id").value;
        const newStockQuantity = Number(document.getElementById("stock-new-quantity").value);
        const note = document.getElementById("stock-note").value.trim();

        try {
            await window.InventoryApi.updateProductStock(productId, {
                newStockQuantity,
                note
            });

            showMessage("stock-message", "Stock updated successfully.", "success");
            event.target.reset();
            await loadProductsPage();
        } catch (error) {
            showMessage("stock-message", error.message || "Could not update stock.", "error");
        }
    }

    async function loadProductFormPage() {
        const categorySelect = document.getElementById("product-category");
        const form = document.getElementById("product-form");
        const imageUrlInput = document.getElementById("product-image-url");
        const skuInput = document.getElementById("product-sku");
        const restockThresholdInput = document.getElementById("product-restock-threshold");
        if (!categorySelect || !form) {
            return;
        }

        if (restockThresholdInput && !restockThresholdInput.value) {
            restockThresholdInput.value = 5;
        }

        try {
            const categories = await window.InventoryApi.getAdminCategories();
            categorySelect.innerHTML = categories.map((category) => `
                <option value="${category.id}">${category.name}</option>
            `).join("");

            const params = new URLSearchParams(window.location.search);
            const productId = params.get("id");

            if (productId) {
                document.getElementById("product-form-title").textContent = "Edit Product";
                document.getElementById("product-form-subtitle").textContent = "Update product details, price, publishing state, and stock quantity.";

                const product = await window.InventoryApi.getAdminProductById(productId);
                document.getElementById("product-name").value = product.name;
                document.getElementById("product-description").value = product.description;
                document.getElementById("product-price").value = product.price;
                document.getElementById("product-stock-quantity").value = product.stockQuantity;
                document.getElementById("product-sku").value = product.sku || "";
                document.getElementById("product-barcode").value = product.barcode || "";
                document.getElementById("product-restock-threshold").value = product.restockThreshold ?? 5;
                imageUrlInput.value = product.imageUrl;
                document.getElementById("product-category").value = product.categoryId;
                document.getElementById("product-active").value = String(product.active);
            }
        } catch (error) {
            showMessage("product-form-message", error.message || "Could not load form data.", "error");
        }

        const nameInput = document.getElementById("product-name");
        if (nameInput && skuInput && !skuInput.dataset.autoBound) {
            skuInput.dataset.autoBound = "true";
            skuInput.dataset.manualEntry = skuInput.value.trim() ? "true" : "false";
            nameInput.addEventListener("input", () => {
                if (skuInput.dataset.manualEntry === "true") {
                    return;
                }

                skuInput.value = `KEFE-${nameInput.value.trim().toUpperCase().replaceAll(/[^A-Z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
            });
            skuInput.addEventListener("input", () => {
                skuInput.dataset.manualEntry = skuInput.value.trim() ? "true" : "false";
            });
        }

        form.addEventListener("submit", async (event) => {
            event.preventDefault();
            clearMessage("product-form-message");

            try {
                const params = new URLSearchParams(window.location.search);
                const productId = params.get("id");
                let imageUrl = imageUrlInput.value.trim();

                if (!imageUrl) {
                    throw new Error("Add a product image URL.");
                }

                const payload = {
                    name: document.getElementById("product-name").value.trim(),
                    description: document.getElementById("product-description").value.trim(),
                    price: Number(document.getElementById("product-price").value),
                    stockQuantity: Number(document.getElementById("product-stock-quantity").value),
                    sku: document.getElementById("product-sku").value.trim(),
                    barcode: document.getElementById("product-barcode").value.trim(),
                    restockThreshold: Number(document.getElementById("product-restock-threshold").value),
                    imageUrl,
                    categoryId: Number(document.getElementById("product-category").value),
                    active: document.getElementById("product-active").value === "true"
                };

                if (productId) {
                    await window.InventoryApi.updateProduct(productId, payload);
                    showMessage("product-form-message", "Product updated successfully. Redirecting...", "success");
                } else {
                    await window.InventoryApi.createProduct(payload);
                    showMessage("product-form-message", "Product created successfully. Redirecting...", "success");
                }

                window.setTimeout(() => {
                    window.location.href = "admin-products.html";
                }, 900);
            } catch (error) {
                showMessage("product-form-message", error.message || "Could not save product.", "error");
            }
        });
    }

    async function loadCategoryFormPage() {
        const form = document.getElementById("category-detail-form");
        if (!form) {
            return;
        }

        const params = new URLSearchParams(window.location.search);
        const categoryId = params.get("id");

        try {
            if (categoryId) {
                const categories = await window.InventoryApi.getAdminCategories();
                const category = categories.find((item) => String(item.id) === String(categoryId));

                if (!category) {
                    throw new Error("Category not found.");
                }

                document.getElementById("category-form-title").textContent = "Edit Category";
                document.getElementById("category-form-subtitle").textContent = "Update the category name and description so products stay organized across the shop and admin pages.";
                document.getElementById("category-detail-name").value = category.name;
                document.getElementById("category-detail-description").value = category.description;
            }
        } catch (error) {
            showMessage("category-form-message", error.message || "Could not load category data.", "error");
        }

        form.addEventListener("submit", async (event) => {
            event.preventDefault();
            clearMessage("category-form-message");

            const payload = {
                name: document.getElementById("category-detail-name").value.trim(),
                description: document.getElementById("category-detail-description").value.trim()
            };

            try {
                if (categoryId) {
                    await window.InventoryApi.updateCategory(categoryId, payload);
                    showMessage("category-form-message", "Category updated successfully. Redirecting...", "success");
                } else {
                    await window.InventoryApi.createCategory(payload);
                    showMessage("category-form-message", "Category created successfully. Redirecting...", "success");
                }

                window.setTimeout(() => {
                    window.location.href = "categories.html";
                }, 900);
            } catch (error) {
                showMessage("category-form-message", error.message || "Could not save category.", "error");
            }
        });
    }

    async function loadCategoriesPage() {
        await refreshCategoriesPage();

        const form = document.getElementById("category-form");
        if (form) {
            form.addEventListener("submit", async (event) => {
                event.preventDefault();
                clearMessage("categories-message");

                try {
                    await window.InventoryApi.createCategory({
                        name: document.getElementById("category-name").value.trim(),
                        description: document.getElementById("category-description").value.trim()
                    });

                    form.reset();
                    showMessage("categories-message", "Category created successfully.", "success");
                    await refreshCategoriesPage();
                } catch (error) {
                    showMessage("categories-message", error.message || "Could not create category.", "error");
                }
            });
        }
    }

    async function refreshCategoriesPage() {
        try {
            const categories = await window.InventoryApi.getAdminCategories();
            adminCategoryState.categories = Array.isArray(categories) ? categories : [];
            renderCategoriesTable(categories);
        } catch (error) {
            showMessage("categories-message", error.message || "Could not load categories.", "error");
        }
    }

    function renderCategoriesTable(categories) {
        const tableBody = document.getElementById("categories-table-body");
        if (!tableBody) {
            return;
        }

        if (!categories.length) {
            paginateItems([], adminCategoryState.pagination, "categories-pagination", "categories", () => renderCategoriesTable(adminCategoryState.categories));
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4">
                        <div class="empty-state">No categories available yet.</div>
                    </td>
                </tr>
            `;
            return;
        }

        const paginatedCategories = paginateItems(
            categories,
            adminCategoryState.pagination,
            "categories-pagination",
            "categories",
            () => renderCategoriesTable(adminCategoryState.categories)
        );

        tableBody.innerHTML = paginatedCategories.map((category) => `
            <tr>
                <td>${category.name}</td>
                <td>${category.description}</td>
                <td>${category.productCount}</td>
                <td>
                    <div class="table-actions">
                        <a class="link-button" href="category-form.html?id=${category.id}">
                            <span class="material-symbols-outlined" aria-hidden="true">edit</span>
                            <span>Edit</span>
                        </a>
                        <button class="link-button delete-category-button" data-category-id="${category.id}" data-category-name="${category.name}">
                            <span class="material-symbols-outlined" aria-hidden="true">delete</span>
                            <span>Delete</span>
                        </button>
                    </div>
                </td>
            </tr>
        `).join("");

        document.querySelectorAll(".delete-category-button").forEach((button) => {
            button.addEventListener("click", async () => {
                const id = button.dataset.categoryId;
                const name = button.dataset.categoryName;
                const confirmed = window.confirm(`Delete category "${name}"? This works only if no products use it.`);
                if (!confirmed) {
                    return;
                }

                try {
                    await window.InventoryApi.deleteCategory(id);
                    showMessage("categories-message", "Category deleted successfully.", "success");
                    await refreshCategoriesPage();
                } catch (error) {
                    showMessage("categories-message", error.message || "Could not delete category.", "error");
                }
            });
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        if (document.getElementById("dashboard-page")) {
            loadDashboardPage();
            const dashboardExportButton = document.getElementById("dashboard-export-button");
            if (dashboardExportButton) {
                dashboardExportButton.addEventListener("click", handleDashboardExport);
            }
        }

        if (document.getElementById("orders-page")) {
            loadOrdersPage();
        }

        if (document.getElementById("products-page")) {
            setupProductPreviewModal();
            setupProductFilters();
            loadProductsPage();
            const stockForm = document.getElementById("stock-update-form");
            if (stockForm) {
                stockForm.addEventListener("submit", handleStockFormSubmit);
            }
        }

        if (document.getElementById("product-form-page")) {
            loadProductFormPage();
        }

        if (document.getElementById("category-form-page")) {
            loadCategoryFormPage();
        }

        if (document.getElementById("categories-page")) {
            loadCategoriesPage();
        }
    });
}());
