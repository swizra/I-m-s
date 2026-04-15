(function () {
  let menuButtons = [];
  let navPanels = [];
  const SEARCH_CONFIG_STORAGE_KEY = "kefeApiBaseUrl";
  const LOCAL_PRODUCT_IMAGE_FILES = new Set([
    "coffee.svg",
    "groovy.svg",
    "laying.svg",
    "levitate.svg",
    "loving.svg",
    "petting.svg",
    "plant.svg",
    "reading-side.svg",
    "rolling.svg",
    "selfie.svg",
    "sitting-reading.svg",
  ]);
  const FOOTER_PAGE_BREADCRUMBS = {
    "about.html": [
      { label: "Company", href: "about.html" },
      { label: "About", href: "about.html" },
    ],
    "accessibility.html": [
      { label: "Policies", href: "store-policy.html" },
      { label: "Accessibility", href: "accessibility.html" },
    ],
    "account.html": [
      { label: "My Account", href: "account.html" },
    ],
    "admin-careers.html": [
      { label: "Admin", href: "admin-dashboard.html" },
      { label: "Careers", href: "admin-careers.html" },
    ],
    "admin-dashboard.html": [
      { label: "Admin", href: "admin-dashboard.html" },
      { label: "Dashboard", href: "admin-dashboard.html" },
    ],
    "admin-orders.html": [
      { label: "Admin", href: "admin-dashboard.html" },
      { label: "Orders", href: "admin-orders.html" },
    ],
    "admin-products.html": [
      { label: "Admin", href: "admin-dashboard.html" },
      { label: "Products", href: "admin-products.html" },
    ],
    "admin-support.html": [
      { label: "Admin", href: "admin-dashboard.html" },
      { label: "Support", href: "admin-support.html" },
    ],
    "best-sellers.html": [
      { label: "Shop", href: "shop.html" },
      { label: "Best Sellers", href: "best-sellers.html" },
    ],
    "brand-story.html": [
      { label: "Company", href: "about.html" },
      { label: "Brand Story", href: "brand-story.html" },
    ],
    "careers.html": [
      { label: "Company", href: "about.html" },
      { label: "Careers", href: "careers.html" },
    ],
    "categories.html": [
      { label: "Admin", href: "admin-dashboard.html" },
      { label: "Categories", href: "categories.html" },
    ],
    "contact.html": [
      { label: "Company", href: "about.html" },
      { label: "Contact", href: "contact.html" },
    ],
    "cookies.html": [
      { label: "Policies", href: "store-policy.html" },
      { label: "Cookies", href: "cookies.html" },
    ],
    "customer-auth.html": [
      { label: "My Account", href: "account.html" },
      { label: "Access", href: "customer-auth.html" },
    ],
    "delivery-tracking.html": [
      { label: "My Account", href: "account.html" },
      { label: "Delivery Tracking", href: "delivery-tracking.html" },
    ],
    "edit-account.html": [
      { label: "My Account", href: "account.html" },
      { label: "Edit", href: "edit-account.html" },
    ],
    "faq.html": [
      { label: "Support", href: "help-center.html" },
      { label: "FAQ", href: "faq.html" },
    ],
    "gift-guide.html": [
      { label: "Shop", href: "shop.html" },
      { label: "Gift Guide", href: "gift-guide.html" },
    ],
    "help-center.html": [
      { label: "Support", href: "help-center.html" },
      { label: "Help Center", href: "help-center.html" },
    ],
    "imprint.html": [
      { label: "Policies", href: "store-policy.html" },
      { label: "Imprint", href: "imprint.html" },
    ],
    "ingredient-standards.html": [
      { label: "Shop", href: "shop.html" },
      { label: "Ingredient Standards", href: "ingredient-standards.html" },
    ],
    "login.html": [
      { label: "Admin", href: "admin-dashboard.html" },
      { label: "Sign In", href: "login.html" },
    ],
    "new-arrivals.html": [
      { label: "Shop", href: "shop.html" },
      { label: "New Arrivals", href: "new-arrivals.html" },
    ],
    "payment-methods.html": [
      { label: "Support", href: "help-center.html" },
      { label: "Payment Methods", href: "payment-methods.html" },
    ],
    "press.html": [
      { label: "Company", href: "about.html" },
      { label: "Press", href: "press.html" },
    ],
    "privacy.html": [
      { label: "Policies", href: "store-policy.html" },
      { label: "Privacy", href: "privacy.html" },
    ],
    "returns.html": [
      { label: "Support", href: "help-center.html" },
      { label: "Returns", href: "returns.html" },
    ],
    "security.html": [
      { label: "Policies", href: "store-policy.html" },
      { label: "Security", href: "security.html" },
    ],
    "self-care-routines.html": [
      { label: "Shop", href: "shop.html" },
      { label: "Self-Care Routines", href: "self-care-routines.html" },
    ],
    "shipping.html": [
      { label: "Support", href: "help-center.html" },
      { label: "Shipping", href: "shipping.html" },
    ],
    "store-policy.html": [
      { label: "Policies", href: "store-policy.html" },
      { label: "Store Policy", href: "store-policy.html" },
    ],
    "sustainability.html": [
      { label: "Company", href: "about.html" },
      { label: "Sustainability", href: "sustainability.html" },
    ],
    "terms.html": [
      { label: "Policies", href: "store-policy.html" },
      { label: "Terms", href: "terms.html" },
    ],
  };
  const STATIC_SITE_SEARCH_ENTRIES = [
    {
      title: "Shop",
      href: "shop.html",
      kind: "Page",
      category: "Store",
      description:
        "Browse the full KEFE catalog, search products, filter categories, and add items to the cart.",
      keywords: ["home", "catalog", "products", "cart", "storefront"],
    },
    {
      title: "FAQ",
      href: "faq.html",
      kind: "Support",
      category: "Help",
      description:
        "Answers about orders, shipping, returns, payments, invoices, customer accounts, and support.",
      keywords: [
        "questions",
        "order",
        "shipping",
        "returns",
        "payment",
        "invoice",
        "cancel",
        "account",
        "support",
      ],
    },
    {
      title: "Help Center",
      href: "help-center.html",
      kind: "Support",
      category: "Help",
      description:
        "Open a support conversation, check support replies, and manage customer help requests.",
      keywords: ["support", "message", "conversation", "delivery", "payments", "returns"],
    },
    {
      title: "Delivery Tracking",
      href: "delivery-tracking.html",
      kind: "Support",
      category: "Orders",
      description:
        "Search for an order number and review the latest delivery and status updates.",
      keywords: ["tracking", "parcel", "shipment", "order status", "delivery"],
    },
    {
      title: "Shipping",
      href: "shipping.html",
      kind: "Policy",
      category: "Support",
      description:
        "Shipping timelines, dispatch expectations, delivery coverage, and courier support information.",
      keywords: ["delivery", "dispatch", "parcel", "timing", "courier"],
    },
    {
      title: "Returns",
      href: "returns.html",
      kind: "Policy",
      category: "Support",
      description:
        "Return windows, eligibility, damaged-order reporting, and refund handling details.",
      keywords: ["refund", "exchange", "damaged", "wrong item", "return policy"],
    },
    {
      title: "Payment Methods",
      href: "payment-methods.html",
      kind: "Policy",
      category: "Support",
      description:
        "Available payment options, checkout handling, and payment support guidance.",
      keywords: ["card", "invoice", "checkout", "payment", "billing"],
    },
    {
      title: "Contact",
      href: "contact.html",
      kind: "Page",
      category: "Company",
      description:
        "Reach customer care, privacy, accessibility, security, and partnership contact channels.",
      keywords: ["email", "support", "privacy", "security", "accessibility", "press"],
    },
    {
      title: "Account",
      href: "account.html",
      kind: "Page",
      category: "Customer",
      description:
        "Review orders, track account activity, and manage customer information after checkout.",
      keywords: ["my orders", "profile", "order history", "customer account"],
    },
    {
      title: "Customer Access",
      href: "customer-auth.html",
      kind: "Page",
      category: "Customer",
      description:
        "Create a customer account, sign in, or switch accounts before checkout.",
      keywords: ["login", "register", "sign in", "create account"],
    },
    {
      title: "New Arrivals",
      href: "new-arrivals.html",
      kind: "Discover",
      category: "Store",
      description:
        "See the newest products added to the live KEFE catalog.",
      keywords: ["latest", "fresh", "new products", "recent"],
    },
    {
      title: "Best Sellers",
      href: "best-sellers.html",
      kind: "Discover",
      category: "Store",
      description:
        "Explore top-performing products ranked by reviews, ratings, and customer interest.",
      keywords: ["popular", "top rated", "most loved", "reviews"],
    },
    {
      title: "Gift Guide",
      href: "gift-guide.html",
      kind: "Discover",
      category: "Store",
      description:
        "Ideas for gifting self-care and wellness products from the KEFE catalog.",
      keywords: ["gift", "present", "ideas", "wellness"],
    },
    {
      title: "Self-Care Routines",
      href: "self-care-routines.html",
      kind: "Discover",
      category: "Store",
      description:
        "Curated routines and product combinations for calm daily rituals.",
      keywords: ["routine", "wellness", "ritual", "care"],
    },
    {
      title: "Ingredient Standards",
      href: "ingredient-standards.html",
      kind: "Page",
      category: "Trust",
      description:
        "Learn about product ingredient expectations, quality principles, and formulation guidance.",
      keywords: ["ingredients", "formula", "quality", "product advice"],
    },
    {
      title: "About",
      href: "about.html",
      kind: "Page",
      category: "Company",
      description:
        "Overview of the KEFE storefront, customer experience, and operational platform.",
      keywords: ["project", "company", "platform", "overview"],
    },
    {
      title: "Brand Story",
      href: "brand-story.html",
      kind: "Page",
      category: "Company",
      description:
        "Read the story behind the KEFE brand and its self-care direction.",
      keywords: ["story", "brand", "identity", "mission"],
    },
    {
      title: "Sustainability",
      href: "sustainability.html",
      kind: "Page",
      category: "Company",
      description:
        "Information about sustainability commitments, sourcing, and store practices.",
      keywords: ["sourcing", "packaging", "sustainable", "responsibility"],
    },
    {
      title: "Careers",
      href: "careers.html",
      kind: "Page",
      category: "Company",
      description:
        "Explore open positions, role details, and the KEFE application experience.",
      keywords: ["jobs", "vacancies", "apply", "hiring"],
    },
    {
      title: "Press",
      href: "press.html",
      kind: "Page",
      category: "Company",
      description:
        "Press information, media contact paths, and company background for external requests.",
      keywords: ["media", "press", "partnership", "contact"],
    },
    {
      title: "Store Policy",
      href: "store-policy.html",
      kind: "Policy",
      category: "Trust",
      description:
        "Core policies covering store use, fulfillment, and customer expectations.",
      keywords: ["policy", "rules", "store terms", "customer expectations"],
    },
    {
      title: "Privacy Policy",
      href: "privacy.html",
      kind: "Policy",
      category: "Trust",
      description:
        "Privacy practices, customer data handling, and contact details for privacy requests.",
      keywords: ["privacy", "data", "personal data", "gdpr"],
    },
    {
      title: "Terms of Use",
      href: "terms.html",
      kind: "Policy",
      category: "Trust",
      description:
        "Terms covering use of the KEFE storefront and related services.",
      keywords: ["terms", "conditions", "rules", "legal"],
    },
    {
      title: "Security",
      href: "security.html",
      kind: "Policy",
      category: "Trust",
      description:
        "Security guidance and channels for reporting security concerns.",
      keywords: ["security", "report", "safe", "vulnerability"],
    },
    {
      title: "Accessibility",
      href: "accessibility.html",
      kind: "Policy",
      category: "Trust",
      description:
        "Accessibility commitments, support channels, and inclusive experience notes.",
      keywords: ["accessibility", "inclusive", "assistive", "support"],
    },
    {
      title: "Cookies",
      href: "cookies.html",
      kind: "Policy",
      category: "Trust",
      description:
        "Information about cookie usage and related privacy controls.",
      keywords: ["cookies", "tracking", "preferences", "privacy"],
    },
    {
      title: "FAQ: Do I need an account to place an order?",
      href: "faq.html#faq-account",
      kind: "FAQ",
      category: "Support",
      description:
        "Find out whether a customer account is required to complete checkout and keep order history.",
      keywords: ["account", "order", "checkout", "customer account"],
    },
    {
      title: "FAQ: When will my order ship?",
      href: "faq.html#faq-shipping-time",
      kind: "FAQ",
      category: "Support",
      description:
        "Shipping timelines, processing expectations, and high-volume order delays.",
      keywords: ["ship", "shipping time", "processing", "delivery"],
    },
    {
      title: "FAQ: Can I change or cancel an order?",
      href: "faq.html#faq-order-change",
      kind: "FAQ",
      category: "Support",
      description:
        "Order change and cancellation guidance before fulfillment begins.",
      keywords: ["cancel", "change address", "remove item", "update order"],
    },
    {
      title: "FAQ: Where can I see my order history and invoices?",
      href: "faq.html#faq-order-history",
      kind: "FAQ",
      category: "Support",
      description:
        "Locate order history, invoice details, and payment confirmations.",
      keywords: ["history", "invoice", "receipt", "payment confirmation"],
    },
    {
      title: "FAQ: How do returns work?",
      href: "faq.html#faq-returns",
      kind: "FAQ",
      category: "Support",
      description:
        "Return eligibility, reporting windows, and refund or replacement expectations.",
      keywords: ["returns", "refund", "damaged", "exchange"],
    },
    {
      title: "FAQ: How can I reach support?",
      href: "faq.html#faq-support",
      kind: "FAQ",
      category: "Support",
      description:
        "Find the correct support email for general, order, privacy, accessibility, or security requests.",
      keywords: ["support", "help", "contact", "orders", "privacy", "accessibility"],
    },
  ];

  const siteSearchState = {
    activeResults: [],
    currentRequestId: 0,
    input: null,
    lastTrigger: null,
    modal: null,
    productError: null,
    productLoadPromise: null,
    products: null,
    results: null,
    status: null,
  };

  function isSvgImagePath(imageUrl) {
    return /\.svg(?:[?#].*)?$/i.test(String(imageUrl || "").trim());
  }

  function normalizeSearchText(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function tokenizeSearchText(value) {
    const normalized = normalizeSearchText(value);
    return normalized ? normalized.split(/\s+/).filter(Boolean) : [];
  }

  function slugifySearchId(value, fallback = "section") {
    const normalized = normalizeSearchText(value);
    return normalized ? normalized.replace(/\s+/g, "-") : fallback;
  }

  function trimSearchSnippet(value, maxLength = 160) {
    const normalized = String(value || "").replace(/\s+/g, " ").trim();
    if (normalized.length <= maxLength) {
      return normalized;
    }
    return `${normalized.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
  }

  function formatSearchCurrency(value) {
    return new Intl.NumberFormat("de-CH", {
      style: "currency",
      currency: "CHF",
    }).format(Number(value) || 0);
  }

  function resolvePublicApiBaseUrl() {
    const metaConfiguredUrl = document
      .querySelector('meta[name="inventory-api-base-url"]')
      ?.getAttribute("content");
    const storageConfiguredUrl = window.localStorage.getItem(SEARCH_CONFIG_STORAGE_KEY);
    const configuredUrl = String(metaConfiguredUrl || storageConfiguredUrl || "").trim().replace(/\/+$/, "");

    if (configuredUrl) {
      return configuredUrl;
    }

    if (window.InventoryApiConfig?.API_BASE_URL) {
      return String(window.InventoryApiConfig.API_BASE_URL).trim().replace(/\/+$/, "");
    }

    if (window.location.protocol === "file:") {
      return "http://localhost:8080";
    }

    const protocol = window.location.protocol || "http:";
    const hostname = window.location.hostname || "localhost";
    return `${protocol}//${hostname}:8080`;
  }

  function resolveImageSrc(imageUrl) {
    const normalized = String(imageUrl || "").trim();
    if (!normalized) {
      return "";
    }

    if (/^https?:\/\//i.test(normalized) || /^data:/i.test(normalized)) {
      return normalized;
    }

    if (normalized.startsWith("/") && window.InventoryApiConfig?.API_BASE_URL) {
      return `${window.InventoryApiConfig.API_BASE_URL}${normalized}`;
    }

    return normalized;
  }

  function setBodyClass(className, enabled) {
    document.body.classList.toggle(className, enabled);
  }

  function getCurrentPageFileName() {
    const path = String(window.location.pathname || "");
    const fileName = path.split("/").filter(Boolean).pop();
    return fileName && fileName.endsWith(".html") ? fileName : "shop.html";
  }

  function getCurrentPageHref() {
    const fileName = getCurrentPageFileName();
    const search = String(window.location.search || "");
    const hash = String(window.location.hash || "");
    return `${fileName}${search}${hash}`;
  }

  function getFallbackFooterBreadcrumbs(fileName) {
    const titleMatch = String(document.title || "").match(
      /^KEFE(?:\s+(?:Admin|Staff))?\s+\|\s+(.+)$/,
    );
    const titleLabel = titleMatch?.[1]?.trim();
    if (titleLabel && titleLabel.toLowerCase() !== "store") {
      if (/^KEFE\s+Admin\s+\|/i.test(document.title)) {
        return [
          { label: "Admin", href: "admin-dashboard.html" },
          { label: titleLabel, href: getCurrentPageHref() },
        ];
      }

      if (/^KEFE\s+Staff\s+\|/i.test(document.title)) {
        return [
          { label: "Staff", href: "admin-careers.html" },
          { label: titleLabel, href: getCurrentPageHref() },
        ];
      }

      return [{ label: titleLabel, href: getCurrentPageHref() }];
    }

    return [{
      label: fileName
        .replace(/\.html$/i, "")
        .split("-")
        .map((part) =>
          part ? `${part.charAt(0).toUpperCase()}${part.slice(1)}` : "",
        )
        .join(" "),
      href: getCurrentPageHref(),
    }];
  }

  function getFooterBreadcrumbs() {
    const fileName = getCurrentPageFileName();
    if (fileName === "shop.html") {
      return null;
    }

    if (fileName === "product-form.html") {
      const params = new URLSearchParams(window.location.search);
      return [
        { label: "Admin", href: "admin-dashboard.html" },
        { label: "Products", href: "admin-products.html" },
        { label: params.get("id") ? "Edit" : "Create", href: getCurrentPageHref() },
      ];
    }

    if (fileName === "category-form.html") {
      const params = new URLSearchParams(window.location.search);
      return [
        { label: "Admin", href: "admin-dashboard.html" },
        { label: "Categories", href: "categories.html" },
        { label: params.get("id") ? "Edit" : "Create", href: getCurrentPageHref() },
      ];
    }

    return FOOTER_PAGE_BREADCRUMBS[fileName] || getFallbackFooterBreadcrumbs(fileName);
  }

  function createFooterBreadcrumbSeparator() {
    const separator = document.createElement("span");
    separator.className = "footer-breadcrumb-separator";
    separator.setAttribute("aria-hidden", "true");
    separator.innerHTML =
      '<svg viewBox="0 0 12 12" fill="none" focusable="false"><path d="M4.25 2.25 7.75 6l-3.5 3.75" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    return separator;
  }

  function renderFooterKicker(kicker) {
    const breadcrumbs = getFooterBreadcrumbs();
    if (!breadcrumbs?.length) {
      kicker.classList.remove("is-breadcrumbs");
      kicker.textContent =
        "Self-care storefront, inventory tracking, and customer account flows in one place.";
      return;
    }

    kicker.classList.add("is-breadcrumbs");
    const nodes = [];
    const homeLink = document.createElement("a");
    homeLink.className = "footer-breadcrumb-link";
    homeLink.href = "shop.html";
    homeLink.textContent = "KEFE";
    nodes.push(homeLink);

    breadcrumbs.forEach((item, index) => {
      nodes.push(createFooterBreadcrumbSeparator());
      const link = document.createElement("a");
      link.className = "footer-breadcrumb-link";
      link.href = item.href;
      link.textContent = item.label;
      if (index === breadcrumbs.length - 1) {
        link.setAttribute("aria-current", "page");
      }
      nodes.push(link);
    });

    kicker.replaceChildren(...nodes);
  }

  function syncMenuState(isOpen) {
    const isMobileViewport = window.innerWidth <= 760;
    setBodyClass("menu-open", isOpen);
    menuButtons.forEach((button) => {
      button.setAttribute("aria-expanded", String(isOpen));
      button.setAttribute(
        "aria-label",
        isOpen ? "Close navigation" : "Open navigation",
      );
    });
    navPanels.forEach((panel) => {
      panel.setAttribute("aria-hidden", String(isMobileViewport && !isOpen));
    });
  }

  function closeMenu() {
    syncMenuState(false);
  }

  function toggleMenu() {
    syncMenuState(!document.body.classList.contains("menu-open"));
  }

  function updateCustomerLinks() {
    const customerCredentials = window.Auth
      ? window.Auth.getCredentials("customer")
      : null;
    const accountLinks = document.querySelectorAll(".customer-account-link");
    const authLinks = document.querySelectorAll(".customer-auth-link");
    const greetings = document.querySelectorAll("[data-customer-greeting]");

    if (customerCredentials) {
      accountLinks.forEach((link) => {
        link.textContent = "My Orders";
        link.setAttribute("href", "account.html");
      });
      authLinks.forEach((link) => {
        link.textContent = "Switch Account";
        link.setAttribute("href", "customer-auth.html");
      });
      greetings.forEach((element) => {
        element.textContent = `Signed in as ${customerCredentials.username}`;
      });
      return;
    }

    accountLinks.forEach((link) => {
      link.textContent = "Create Account";
      link.setAttribute("href", "customer-auth.html");
    });
    authLinks.forEach((link) => {
      link.textContent = "Customer Login";
      link.setAttribute("href", "customer-auth.html");
    });
    greetings.forEach((element) => {
      element.textContent = "Sign in to place orders and track them later.";
    });
  }

  function ensureSearchTargetId(element, fallbackLabel, index) {
    if (!element) {
      return "";
    }

    if (!element.id) {
      element.id = `${slugifySearchId(fallbackLabel, "section")}-${index + 1}`;
    }

    return element.id;
  }

  function collectCurrentPageSearchEntries() {
    const currentPage = getCurrentPageFileName();
    const currentPageTitle = String(document.title || "")
      .replace(/^KEFE(?:\s+(?:Admin|Staff))?\s+\|\s+/i, "")
      .trim();
    const seen = new Set();

    return Array.from(document.querySelectorAll("main article.panel, main section.panel"))
      .map((section, index) => {
        const heading = section.querySelector("h2, h3");
        if (!heading) {
          return null;
        }

        const description = trimSearchSnippet(
          Array.from(section.querySelectorAll("p, li"))
            .map((node) => node.textContent)
            .join(" "),
        );

        if (!description) {
          return null;
        }

        const targetId = ensureSearchTargetId(section, heading.textContent, index);
        const href = `${currentPage}#${targetId}`;
        const uniqueKey = `${heading.textContent}|${href}`;
        if (seen.has(uniqueKey)) {
          return null;
        }
        seen.add(uniqueKey);

        return {
          title: heading.textContent.trim(),
          href,
          kind: currentPageTitle || "Section",
          category: "This page",
          description,
          keywords: [currentPageTitle, currentPage.replace(/\.html$/i, "")],
        };
      })
      .filter(Boolean);
  }

  function getSearchEntries() {
    return [...STATIC_SITE_SEARCH_ENTRIES, ...collectCurrentPageSearchEntries()];
  }

  function scoreSearchMatch(entry, normalizedQuery, queryTokens) {
    if (!normalizedQuery || !queryTokens.length) {
      return -1;
    }

    const title = normalizeSearchText(entry.title);
    const description = normalizeSearchText(entry.description);
    const category = normalizeSearchText(entry.category);
    const keywords = normalizeSearchText(
      Array.isArray(entry.keywords) ? entry.keywords.join(" ") : entry.keywords,
    );
    const haystack = [title, description, category, keywords].filter(Boolean).join(" ");

    if (!queryTokens.every((token) => haystack.includes(token))) {
      return -1;
    }

    let score = 0;

    if (title === normalizedQuery) {
      score += 140;
    } else if (title.startsWith(normalizedQuery)) {
      score += 110;
    } else if (title.includes(normalizedQuery)) {
      score += 90;
    }

    if (keywords.includes(normalizedQuery)) {
      score += 55;
    }

    if (category.includes(normalizedQuery)) {
      score += 35;
    }

    if (description.includes(normalizedQuery)) {
      score += 25;
    }

    queryTokens.forEach((token) => {
      if (title.includes(token)) {
        score += 14;
      }
      if (keywords.includes(token)) {
        score += 10;
      }
      if (category.includes(token)) {
        score += 6;
      }
      if (description.includes(token)) {
        score += 4;
      }
    });

    return score;
  }

  function searchStaticEntries(query) {
    const normalizedQuery = normalizeSearchText(query);
    const queryTokens = tokenizeSearchText(query);

    return getSearchEntries()
      .map((entry) => ({
        ...entry,
        score: scoreSearchMatch(entry, normalizedQuery, queryTokens),
        type: "page",
      }))
      .filter((entry) => entry.score >= 0)
      .sort((left, right) => right.score - left.score)
      .slice(0, 8);
  }

  async function loadSearchableProducts() {
    if (Array.isArray(siteSearchState.products)) {
      return siteSearchState.products;
    }

    if (siteSearchState.productLoadPromise) {
      return siteSearchState.productLoadPromise;
    }

    siteSearchState.productLoadPromise = (async () => {
      const apiBaseUrl = resolvePublicApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/api/public/products`, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      const products = await response.json().catch(() => []);

      if (!response.ok) {
        throw new Error("Could not load products for search.");
      }

      siteSearchState.productError = null;
      siteSearchState.products = Array.isArray(products) ? products : [];
      return siteSearchState.products;
    })()
      .catch((error) => {
        siteSearchState.productError = error;
        siteSearchState.products = [];
        return siteSearchState.products;
      })
      .finally(() => {
        siteSearchState.productLoadPromise = null;
      });

    return siteSearchState.productLoadPromise;
  }

  function buildProductSearchHref(product, query) {
    const params = new URLSearchParams();
    const normalizedQuery = String(query || "").trim();
    if (normalizedQuery) {
      params.set("search", normalizedQuery);
    }
    params.set("product", String(product.id));
    const suffix = params.toString();
    return `shop.html${suffix ? `?${suffix}` : ""}#catalog-section`;
  }

  async function searchProducts(query) {
    const normalizedQuery = normalizeSearchText(query);
    const queryTokens = tokenizeSearchText(query);

    if (!normalizedQuery || !queryTokens.length) {
      return [];
    }

    const products = await loadSearchableProducts();
    return products
      .map((product) => {
        const entry = {
          title: product.name,
          description: trimSearchSnippet(product.description),
          category: product.categoryName || "Product",
          keywords: [
            product.categoryName,
            product.stockStatus,
            product.available ? "available" : "out of stock",
          ],
        };

        return {
          ...product,
          title: product.name,
          description: product.description,
          type: "product",
          kind: "Product",
          href: buildProductSearchHref(product, query),
          score: scoreSearchMatch(entry, normalizedQuery, queryTokens),
        };
      })
      .filter((product) => product.score >= 0)
      .sort((left, right) => right.score - left.score)
      .slice(0, 8);
  }

  function createSearchResultElement(result) {
    const link = document.createElement("a");
    link.className = "site-search-result";
    link.href = result.href;
    link.dataset.resultType = result.type;
    link.dataset.searchQuery = siteSearchState.input?.value?.trim() || "";

    if (result.type === "product") {
      link.classList.add("is-product-result");
      link.dataset.productId = String(result.id);
    }

    const badge = document.createElement("span");
    badge.className = "site-search-result-badge";
    badge.textContent = result.kind || result.category || "Page";

    const topRow = document.createElement("div");
    topRow.className = "site-search-result-top";

    const title = document.createElement("strong");
    title.className = "site-search-result-title";
    title.textContent = result.title;

    const meta = document.createElement("p");
    meta.className = "site-search-result-meta";
    if (result.type === "product") {
      const metaParts = ["Store"];
      if (result.category) {
        metaParts.push(result.category);
      }
      if (Number.isFinite(Number(result.price))) {
        metaParts.push(formatSearchCurrency(result.price));
      }
      meta.textContent = metaParts.join(" · ");
    } else {
      meta.textContent = result.category || "";
    }

    const description = document.createElement("p");
    description.className = "site-search-result-description";
    description.textContent = trimSearchSnippet(result.description);

    if (result.type === "product" && result.imageUrl) {
      const image = document.createElement("img");
      image.className = "site-search-result-image";
      applyProductImageToElement(image, result.imageUrl, result.title);
      link.appendChild(image);
    }

    topRow.append(title, badge);
    link.appendChild(topRow);

    if (meta.textContent) {
      link.appendChild(meta);
    }

    if (description.textContent) {
      link.appendChild(description);
    }

    return link;
  }

  function createSearchResultGroup(titleText, results) {
    const group = document.createElement("section");
    group.className = "site-search-group";

    const title = document.createElement("h3");
    title.className = "site-search-group-title";
    title.textContent = titleText;

    const list = document.createElement("div");
    list.className = "site-search-group-list";
    results.forEach((result) => list.appendChild(createSearchResultElement(result)));

    group.append(title, list);
    return group;
  }

  function renderSiteSearchEmptyState(message) {
    if (!siteSearchState.results) {
      return;
    }

    const state = document.createElement("div");
    state.className = "empty-state site-search-empty-state";
    state.textContent = message;
    siteSearchState.results.replaceChildren(state);
  }

  function renderSiteSearchDefaultState() {
    if (!siteSearchState.results || !siteSearchState.status) {
      return;
    }

    const featuredEntries = STATIC_SITE_SEARCH_ENTRIES.slice(0, 6).map((entry) => ({
      ...entry,
      type: "page",
    }));

    siteSearchState.activeResults = featuredEntries;
    siteSearchState.status.textContent =
      "Search products, FAQ answers, help pages, order support, and store policies.";
    siteSearchState.results.replaceChildren(
      createSearchResultGroup("Quick links", featuredEntries),
    );
  }

  async function syncSiteSearchResults(query) {
    const normalizedQuery = String(query || "").trim();
    const requestId = siteSearchState.currentRequestId + 1;
    siteSearchState.currentRequestId = requestId;

    if (!normalizedQuery) {
      renderSiteSearchDefaultState();
      return;
    }

    const pageResults = searchStaticEntries(normalizedQuery);
    siteSearchState.activeResults = [...pageResults];
    siteSearchState.status.textContent = "Searching products and pages…";

    const groups = [];
    if (pageResults.length) {
      groups.push(createSearchResultGroup("Pages", pageResults));
    }

    if (groups.length) {
      siteSearchState.results.replaceChildren(...groups);
    } else {
      renderSiteSearchEmptyState("No page matches yet. Checking products next.");
    }

    const productResults = await searchProducts(normalizedQuery);
    if (requestId !== siteSearchState.currentRequestId) {
      return;
    }

    const nextGroups = [];
    if (productResults.length) {
      nextGroups.push(createSearchResultGroup("Products", productResults));
    }
    if (pageResults.length) {
      nextGroups.push(createSearchResultGroup("Pages", pageResults));
    }

    siteSearchState.activeResults = [...productResults, ...pageResults];

    if (nextGroups.length) {
      siteSearchState.results.replaceChildren(...nextGroups);
      siteSearchState.status.textContent = siteSearchState.productError
        ? "Showing page matches. Product search is temporarily unavailable."
        : `${siteSearchState.activeResults.length} result${siteSearchState.activeResults.length === 1 ? "" : "s"} found.`;
      return;
    }

    siteSearchState.status.textContent = "No matches found.";
    renderSiteSearchEmptyState(
      "No matches found for that search. Try a product name, FAQ topic, or support page.",
    );
  }

  function applySiteSearchToShop(query, productId) {
    const searchInput = document.getElementById("search-input");
    if (!searchInput) {
      return false;
    }

    const normalizedQuery = String(query || "").trim();
    searchInput.value = normalizedQuery;
    searchInput.dispatchEvent(new Event("input", { bubbles: true }));
    document.getElementById("catalog-section")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    const url = new URL(window.location.href);
    if (normalizedQuery) {
      url.searchParams.set("search", normalizedQuery);
    } else {
      url.searchParams.delete("search");
    }

    if (productId) {
      url.searchParams.set("product", String(productId));
    } else {
      url.searchParams.delete("product");
    }

    url.hash = "catalog-section";
    window.history.replaceState({}, "", url.toString());

    if (productId) {
      window.dispatchEvent(
        new CustomEvent("site-search:open-product", {
          detail: { productId: Number(productId) },
        }),
      );
    }

    return true;
  }

  function closeSiteSearch() {
    if (!siteSearchState.modal) {
      return;
    }

    setBodyClass("search-open", false);
    siteSearchState.modal.hidden = true;
    siteSearchState.modal.setAttribute("aria-hidden", "true");
    siteSearchState.lastTrigger?.focus?.();
  }

  function openSiteSearch(initialQuery = "") {
    if (!siteSearchState.modal || !siteSearchState.input) {
      return;
    }

    closeMenu();
    siteSearchState.lastTrigger = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;

    const shopSearchValue = document.getElementById("search-input")?.value?.trim() || "";
    const nextValue = String(initialQuery || shopSearchValue || "").trim();
    siteSearchState.input.value = nextValue;
    siteSearchState.modal.hidden = false;
    siteSearchState.modal.setAttribute("aria-hidden", "false");
    setBodyClass("search-open", true);
    siteSearchState.input.focus();
    siteSearchState.input.select();
    syncSiteSearchResults(nextValue);
  }

  function handleSiteSearchNavigation(result) {
    if (!result) {
      const fallbackQuery = siteSearchState.input?.value?.trim() || "";
      if (!fallbackQuery) {
        return;
      }

      if (getCurrentPageFileName() === "shop.html") {
        applySiteSearchToShop(fallbackQuery);
      } else {
        const params = new URLSearchParams({ search: fallbackQuery });
        window.location.href = `shop.html?${params.toString()}#catalog-section`;
      }

      closeSiteSearch();
      return;
    }

    const currentPage = getCurrentPageFileName();
    if (currentPage === "shop.html" && result.type === "product") {
      applySiteSearchToShop(result.query || siteSearchState.input?.value || "", result.id);
      closeSiteSearch();
      return;
    }

    closeSiteSearch();
    window.location.href = result.href;
  }

  function createMobileSearchIcon() {
    const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    icon.setAttribute("class", "icon-svg");
    icon.setAttribute("viewBox", "0 0 24 24");
    icon.setAttribute("aria-hidden", "true");
    icon.setAttribute("focusable", "false");

    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", "11");
    circle.setAttribute("cy", "11");
    circle.setAttribute("r", "5.5");

    const handle = document.createElementNS("http://www.w3.org/2000/svg", "path");
    handle.setAttribute("d", "M15.5 15.5L20 20");

    icon.append(circle, handle);
    return icon;
  }

  function createMenuToggleIcon() {
    const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    icon.setAttribute("class", "icon-svg");
    icon.setAttribute("viewBox", "0 0 24 24");
    icon.setAttribute("aria-hidden", "true");
    icon.setAttribute("focusable", "false");

    const top = document.createElementNS("http://www.w3.org/2000/svg", "path");
    top.setAttribute("class", "line line-top");
    top.setAttribute("d", "M7 9H17");

    const middle = document.createElementNS("http://www.w3.org/2000/svg", "path");
    middle.setAttribute("class", "line line-middle");
    middle.setAttribute("d", "M7 12H17");

    const bottom = document.createElementNS("http://www.w3.org/2000/svg", "path");
    bottom.setAttribute("class", "line line-bottom");
    bottom.setAttribute("d", "M7 15H17");

    icon.append(top, middle, bottom);
    return icon;
  }

  function bindSearchTrigger(button) {
    if (!(button instanceof HTMLElement) || button.dataset.searchBound === "true") {
      return;
    }

    button.dataset.searchBound = "true";
    button.addEventListener("click", () => openSiteSearch());
  }

  function createSearchTrigger(label, className, iconName) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.setAttribute("aria-label", label);

    if (className.includes("mobile-search-toggle")) {
      button.classList.add("icon-button");
      button.appendChild(createMobileSearchIcon());
    } else if (iconName) {
      const icon = document.createElement("span");
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = iconName;
      button.appendChild(icon);
    }

    if (!iconName || label !== "Search") {
      const text = document.createElement("span");
      text.textContent = label;
      button.appendChild(text);
    } else if (className.includes("nav-search-trigger")) {
      button.textContent = label;
    }

    bindSearchTrigger(button);
    return button;
  }

  function ensureSiteSearchUi() {
    const publicNav = document.querySelector(".top-nav.public-nav");
    if (!publicNav || document.querySelector(".site-search-modal")) {
      return;
    }

    if (!publicNav.querySelector(".nav-search-trigger")) {
      const desktopTrigger = createSearchTrigger("Search", "nav-search-trigger", "");
      const adminLink = Array.from(publicNav.querySelectorAll("a")).find((link) =>
        link.getAttribute("href") === "login.html",
      );
      publicNav.insertBefore(desktopTrigger, adminLink || null);
    }

    let mobileActions = document.querySelector(".mobile-header-actions");
    const menuToggle = document.querySelector(".site-header .menu-toggle");

    if (!mobileActions && menuToggle) {
      mobileActions = document.createElement("div");
      mobileActions.className = "mobile-header-actions";
      menuToggle.replaceWith(mobileActions);
      mobileActions.appendChild(menuToggle);
    }

    if (mobileActions && !mobileActions.querySelector(".mobile-search-toggle")) {
      const mobileTrigger = createSearchTrigger(
        "Search",
        "mobile-search-toggle",
        "search",
      );
      const menuButton = mobileActions.querySelector(".menu-toggle");
      mobileActions.insertBefore(mobileTrigger, menuButton || null);
    }

    document
      .querySelectorAll(".mobile-search-toggle, .nav-search-trigger")
      .forEach((button) => bindSearchTrigger(button));

    const modal = document.createElement("section");
    modal.className = "site-search-modal";
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-labelledby", "site-search-title");
    modal.innerHTML = `
      <div class="site-search-shell">
        <div class="site-search-header">
          <div>
            <span class="eyebrow">Search</span>
            <h2 id="site-search-title">Find products, help, and pages</h2>
          </div>
          <button class="link-button site-search-close" type="button">
            <span class="material-symbols-outlined" aria-hidden="true">close</span>
            <span>Close</span>
          </button>
        </div>
        <label class="site-search-input-row" for="site-search-input">
          <span class="material-symbols-outlined" aria-hidden="true">search</span>
          <input
            id="site-search-input"
            type="search"
            placeholder="Search products, FAQ, shipping, returns, contact ..."
            autocomplete="off"
          />
        </label>
        <p class="site-search-status"></p>
        <div class="site-search-results"></div>
      </div>
    `;

    document.body.appendChild(modal);
    siteSearchState.modal = modal;
    siteSearchState.input = modal.querySelector("#site-search-input");
    siteSearchState.results = modal.querySelector(".site-search-results");
    siteSearchState.status = modal.querySelector(".site-search-status");

    modal.querySelector(".site-search-close")?.addEventListener("click", closeSiteSearch);
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeSiteSearch();
      }
    });

    siteSearchState.input?.addEventListener("input", (event) => {
      syncSiteSearchResults(event.target.value);
    });

    siteSearchState.input?.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeSiteSearch();
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        const preferredResult = getCurrentPageFileName() === "shop.html"
          ? siteSearchState.activeResults.find((item) => item.type === "product")
          : siteSearchState.activeResults[0];
        handleSiteSearchNavigation(preferredResult);
      }
    });

    siteSearchState.results?.addEventListener("click", (event) => {
      const resultElement = event.target.closest(".site-search-result");
      if (!resultElement) {
        return;
      }

      event.preventDefault();
      const result = siteSearchState.activeResults.find((item) => {
        if (resultElement.dataset.resultType === "product") {
          return item.type === "product" && String(item.id) === resultElement.dataset.productId;
        }

        return item.type === "page" && item.href === resultElement.getAttribute("href");
      });

      if (result) {
        result.query = resultElement.dataset.searchQuery || siteSearchState.input?.value || "";
      }

      handleSiteSearchNavigation(result);
    });

    renderSiteSearchDefaultState();
  }

  function updateFooterMeta() {
    const currentYear = new Date().getFullYear();
    const launchYear = 2026;
    const yearRange = `${launchYear}-${Math.max(currentYear, launchYear)}`;
    const legalLinksMarkup = `
      <a href="privacy.html">Privacy Policy</a>
      <a href="terms.html">Terms of Use</a>
      <a href="imprint.html">Imprint</a>
    `;

    document.querySelectorAll(".site-footer-inner").forEach((footerInner) => {
      Array.from(footerInner.children).forEach((child) => {
        const isLegacyBrandBlock =
          child.tagName === "DIV" &&
          !child.classList.length &&
          child.querySelector("strong")?.textContent?.trim() === "KEFE";

        if (isLegacyBrandBlock) {
          child.remove();
        }
      });

      const note = footerInner.querySelector(".footer-note");
      if (note) {
        note.remove();
      }

      let directory = footerInner.querySelector(".footer-directory");
      if (!directory) {
        directory = document.createElement("div");
        directory.className = "footer-directory";
        footerInner.appendChild(directory);
      }

      let directoryBrand = directory.querySelector(".footer-brand-block");
      if (!directoryBrand) {
        directoryBrand = document.createElement("div");
        directoryBrand.className = "footer-brand-block";
        directory.prepend(directoryBrand);
      }

      const title = directoryBrand.querySelector("strong");
      if (title) {
        title.remove();
      }

      let kicker = directoryBrand.querySelector(".footer-kicker");
      if (!kicker) {
        kicker = document.createElement("p");
        kicker.className = "footer-kicker";
        directoryBrand.appendChild(kicker);
      }

      renderFooterKicker(kicker);

      let meta = directoryBrand.querySelector(".footer-meta");
      if (!meta) {
        meta = document.createElement("p");
        meta.className = "footer-meta";
        directoryBrand.appendChild(meta);
      }

      meta.textContent = `Copyright ${yearRange} KEFE. All rights reserved.`;

      const footerLinks = footerInner.querySelector(".footer-links");
      if (footerLinks && footerLinks.parentElement !== directory) {
        directory.appendChild(footerLinks);
      }

      let legal = footerInner.querySelector(".footer-legal");
      if (!legal) {
        legal = document.createElement("div");
        legal.className = "footer-legal";
        footerInner.appendChild(legal);
      }

      let legalCopyright = legal.querySelector(".footer-legal-copy");
      if (!legalCopyright) {
        legalCopyright = document.createElement("p");
        legalCopyright.className = "footer-legal-copy";
        legal.appendChild(legalCopyright);
      }

      legalCopyright.textContent = `Copyright ${yearRange} KEFE. All rights reserved.`;

      let legalLinks = legal.querySelector(".footer-legal-links");
      if (!legalLinks) {
        legalLinks = document.createElement("div");
        legalLinks.className = "footer-legal-links";
        legal.appendChild(legalLinks);
      }

      if (!legalLinks.querySelector('a[href="privacy.html"]')) {
        legalLinks.innerHTML = legalLinksMarkup;
      }

      const stackContainer = directoryBrand;
      const stack = ensureFooterStatusStack(stackContainer);
      stack.classList.add("footer-status-stack");

      if (!directory) {
        return;
      }
    });
  }

  function ensureFooterStatusStack(container) {
    let stack = container.querySelector(".footer-status-stack");
    if (!stack) {
      stack = document.createElement("div");
      stack.className = "footer-status-stack";
      container.appendChild(stack);
    }

    return stack;
  }

  function ensureFooterStatusLine(stack, className, role, markup) {
    let line = stack.querySelector(`[data-footer-role="${role}"]`);
    if (!line) {
      line = document.createElement("p");
      line.className = className;
      line.dataset.footerRole = role;
      line.innerHTML = markup;
      stack.appendChild(line);
    }

    return line;
  }

  function updateFooterSystemDetails() {
    document.querySelectorAll(".site-footer-inner").forEach((footerInner) => {
      const container = footerInner.querySelector(".footer-brand-block");
      if (!container) {
        return;
      }

      const stack = container.querySelector(".footer-status-stack");
      if (!stack) {
        return;
      }

      Array.from(stack.children).forEach((line) => {
        if (line.dataset.footerRole !== "server") {
          line.remove();
        }
      });
    });
  }

  async function updateFooterServerStatus() {
    document.querySelectorAll(".site-footer-inner").forEach((footerInner) => {
      const container = footerInner.querySelector(".footer-brand-block");
      if (!container) {
        return;
      }

      const stack = ensureFooterStatusStack(container);
      const status = ensureFooterStatusLine(
        stack,
        "footer-status-line footer-server-status is-checking",
        "server",
        `
          <span class="status-dot" aria-hidden="true"></span>
          <span class="status-label">Checking server...</span>
        `,
      );

      status.classList.remove("is-online", "is-offline");
      status.classList.add("is-checking");
    });

    const apiBaseUrl =
      window.InventoryApiConfig?.API_BASE_URL || "http://localhost:8080";

    try {
      const response = await fetch(`${apiBaseUrl}/api/public/categories`, {
        method: "GET",
        cache: "no-store",
      });

      document.querySelectorAll(".footer-server-status").forEach((node) => {
        node.classList.remove("is-checking", "is-online", "is-offline");
        node.classList.add(response.ok ? "is-online" : "is-offline");
        node.querySelector(".status-label").textContent = response.ok
          ? "Server online"
          : "Server offline";
      });
    } catch (error) {
      document.querySelectorAll(".footer-server-status").forEach((node) => {
        node.classList.remove("is-checking", "is-online");
        node.classList.add("is-offline");
        node.querySelector(".status-label").textContent = "Server offline";
      });
    }
  }

  function updateFooterLinks() {
    const footerLinksMarkup = `
      <div class="footer-link-column">
        <button class="footer-link-trigger" type="button">Discover</button>
        <div class="footer-link-list">
          <a href="new-arrivals.html">New Arrivals</a>
          <a href="best-sellers.html">Best Sellers</a>
          <a href="gift-guide.html">Gift Guide</a>
          <a href="self-care-routines.html">Self-Care Routines</a>
        </div>
      </div>
      <div class="footer-link-column">
        <button class="footer-link-trigger" type="button">Support</button>
        <div class="footer-link-list">
          <a href="faq.html">FAQ</a>
          <a href="help-center.html">Help Center</a>
          <a href="contact.html">Contact</a>
          <a href="delivery-tracking.html">Delivery Tracking</a>
        </div>
      </div>
      <div class="footer-link-column">
        <button class="footer-link-trigger" type="button">Policies</button>
        <div class="footer-link-list">
          <a href="shipping.html">Shipping</a>
          <a href="returns.html">Returns</a>
          <a href="payment-methods.html">Payment Methods</a>
          <a href="store-policy.html">Store Policy</a>
        </div>
      </div>
      <div class="footer-link-column">
        <button class="footer-link-trigger" type="button">Trust</button>
        <div class="footer-link-list">
          <a href="cookies.html">Cookies</a>
          <a href="accessibility.html">Accessibility</a>
          <a href="security.html">Security</a>
          <a href="ingredient-standards.html">Ingredient Standards</a>
        </div>
      </div>
      <div class="footer-link-column">
        <button class="footer-link-trigger" type="button">Company</button>
        <div class="footer-link-list">
          <a href="brand-story.html">Brand Story</a>
          <a href="sustainability.html">Sustainability</a>
          <a href="careers.html">Careers</a>
          <a href="press.html">Press</a>
        </div>
      </div>
    `;

    document.querySelectorAll(".footer-links").forEach((container) => {
      container.classList.add("footer-directory-links");
      if (!container.querySelector(".footer-link-column")) {
        container.innerHTML = footerLinksMarkup;
      }
    });
  }

  function setupFooterAccordion() {
    const isMobile = window.innerWidth <= 760;

    document.querySelectorAll(".site-footer-inner").forEach((footerInner) => {
      const brandBlock = footerInner.querySelector(".footer-brand-block");
      const legal = footerInner.querySelector(".footer-legal");
      const legalLinks = legal?.querySelector(".footer-legal-links");
      const stack = brandBlock?.querySelector(".footer-status-stack")
        || legal?.querySelector(".footer-status-stack");

      if (stack && brandBlock && legal) {
        if (isMobile) {
          stack.classList.add("footer-legal-status");
          if (legalLinks) {
            legal.insertBefore(stack, legalLinks.nextSibling);
          } else {
            legal.appendChild(stack);
          }
        } else {
          stack.classList.remove("footer-legal-status");
          brandBlock.appendChild(stack);
        }
      }
    });

    document.querySelectorAll(".footer-link-column").forEach((column, index) => {
      const trigger = column.querySelector(".footer-link-trigger");
      const list = column.querySelector(".footer-link-list");
      if (!trigger || !list) {
        return;
      }

      if (!list.id) {
        list.id = `footer-link-list-${index + 1}`;
      }

      trigger.setAttribute("aria-controls", list.id);

      if (!trigger.dataset.boundAccordion) {
        trigger.addEventListener("click", () => {
          if (window.innerWidth > 760) {
            return;
          }

          const isExpanded = column.classList.toggle("is-expanded");
          trigger.setAttribute("aria-expanded", String(isExpanded));
        });
        trigger.dataset.boundAccordion = "true";
      }

      if (isMobile) {
        column.classList.remove("is-expanded");
        trigger.setAttribute("aria-expanded", "false");
      } else {
        column.classList.add("is-expanded");
        trigger.setAttribute("aria-expanded", "true");
      }
    });
  }

  function extractProductImageFileName(imageUrl) {
    const normalized = String(imageUrl || "").trim();
    if (!normalized) {
      return "";
    }

    const match = normalized.match(/([^/?#]+\.svg)(?:[?#].*)?$/i);
    return match ? match[1] : "";
  }

  function getProductImageAsset(imageUrl) {
    const fileName = extractProductImageFileName(imageUrl);
    const isLocalThemeAsset = Boolean(fileName) && LOCAL_PRODUCT_IMAGE_FILES.has(fileName);
    const isThemeAwareSvg = isLocalThemeAsset || isSvgImagePath(imageUrl);
    const localImageVersion = "20260323m";
    const useDarkThemeAsset =
      isLocalThemeAsset &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const resolvedLocalFileName = useDarkThemeAsset
      ? fileName.replace(/\.svg$/i, "-dark.svg")
      : fileName;

    return {
      src: isLocalThemeAsset
        ? `assets/images/${resolvedLocalFileName}?v=${localImageVersion}`
        : resolveImageSrc(imageUrl),
      isLocalThemeAsset,
      className: isThemeAwareSvg ? "theme-aware-product-image" : "",
    };
  }

  function applyProductImageToElement(imageElement, imageUrl, altText = "") {
    if (!imageElement) {
      return;
    }

    const imageAsset = getProductImageAsset(imageUrl);
    const baseClass =
      imageElement.dataset.productImageBaseClass ||
      Array.from(imageElement.classList)
        .filter((className) => className !== "theme-aware-product-image")
        .join(" ");

    imageElement.dataset.productImageBaseClass = baseClass;
    imageElement.src = imageAsset.src;
    imageElement.alt = altText;
    imageElement.className = [baseClass, imageAsset.className].filter(Boolean).join(" ");
    imageElement.dataset.productImageSource = String(imageUrl || "").trim();
  }

  function refreshThemeAwareProductImages() {
    document.querySelectorAll("img[data-product-image-source]").forEach((imageElement) => {
      const imageUrl = imageElement.dataset.productImageSource || "";
      const imageAsset = getProductImageAsset(imageUrl);
      const baseClass =
        imageElement.dataset.productImageBaseClass ||
        Array.from(imageElement.classList)
          .filter((className) => className !== "theme-aware-product-image")
          .join(" ");

      imageElement.dataset.productImageBaseClass = baseClass;
      imageElement.src = imageAsset.src;
      imageElement.className = [baseClass, imageAsset.className].filter(Boolean).join(" ");
    });
  }

  function autoResizeTextarea(textarea) {
    if (!(textarea instanceof HTMLTextAreaElement)) {
      return;
    }

    textarea.style.height = "auto";
    textarea.style.height = `${Math.max(textarea.scrollHeight, textarea.clientHeight)}px`;
  }

  function initializeAutoResizingTextareas() {
    document.querySelectorAll("textarea").forEach((textarea) => {
      if (textarea.dataset.autoResize === "false") {
        return;
      }

      if (textarea.dataset.autoResizeBound === "true") {
        autoResizeTextarea(textarea);
        return;
      }

      textarea.dataset.autoResizeBound = "true";
      autoResizeTextarea(textarea);
      textarea.addEventListener("input", () => autoResizeTextarea(textarea));
    });
  }

  function clampPageNumber(page, totalItems, pageSize, showAll = false) {
    if (showAll) {
      return 1;
    }

    const normalizedPageSize = Math.max(1, Number(pageSize) || 1);
    const totalPages = Math.max(1, Math.ceil(Math.max(0, totalItems) / normalizedPageSize));
    const nextPage = Number(page) || 1;
    return Math.min(Math.max(1, nextPage), totalPages);
  }

  function getPaginationMeta(totalItems, page, pageSize, showAll = false) {
    const normalizedPageSize = Math.max(1, Number(pageSize) || 1);
    const safeTotalItems = Math.max(0, Number(totalItems) || 0);
    const effectivePageSize = showAll ? Math.max(1, safeTotalItems) : normalizedPageSize;
    const totalPages = showAll ? 1 : Math.max(1, Math.ceil(safeTotalItems / effectivePageSize));
    const currentPage = clampPageNumber(page, safeTotalItems, effectivePageSize, showAll);
    const startIndex = safeTotalItems ? ((currentPage - 1) * effectivePageSize) + 1 : 0;
    const endIndex = safeTotalItems ? Math.min(currentPage * effectivePageSize, safeTotalItems) : 0;

    return {
      page: currentPage,
      pageSize: effectivePageSize,
      totalItems: safeTotalItems,
      totalPages,
      startIndex,
      endIndex,
      showAll,
    };
  }

  function getVisiblePageItems(totalPages) {
    return Array.from({ length: totalPages }, (_, index) => ({
      type: "page",
      value: index + 1,
    }));
  }

  function createPaginationButton(label, options = {}) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `pagination-button ${options.variant || "button-secondary"}${options.active ? " is-active" : ""}`;
    button.textContent = label;
    button.disabled = Boolean(options.disabled);

    if (!options.disabled && typeof options.onClick === "function") {
      button.addEventListener("click", options.onClick);
    }

    return button;
  }

  function renderPagination(containerOrId, config) {
    const container = typeof containerOrId === "string"
      ? document.getElementById(containerOrId)
      : containerOrId;

    if (!container) {
      return {
        page: 1,
        pageSize: config.pageSize,
        totalItems: config.totalItems,
        totalPages: 1,
        startIndex: 0,
        endIndex: 0,
      };
    }

    const meta = getPaginationMeta(
      config.totalItems,
      config.page,
      config.pageSize,
      Boolean(config.showAll)
    );

    if (meta.totalItems <= (Number(config.pageSize) || 1)) {
      container.replaceChildren();
      container.hidden = true;
      return meta;
    }

    container.hidden = false;

    const root = document.createElement("div");
    root.className = "pagination";

    const summary = document.createElement("p");
    summary.className = "pagination-summary";
    const itemLabel = config.itemLabel || "items";
    summary.textContent = meta.showAll
      ? `Showing all ${meta.totalItems} ${itemLabel}`
      : `Showing ${meta.startIndex}-${meta.endIndex} of ${meta.totalItems} ${itemLabel}`;

    const controls = document.createElement("div");
    controls.className = "pagination-controls";

    if (meta.showAll) {
      controls.appendChild(
        createPaginationButton("Pages", {
          onClick: () => {
            if (typeof config.onToggleShowAll === "function") {
              config.onToggleShowAll(false);
            }
          },
        })
      );
    } else {
      controls.appendChild(
        createPaginationButton("Prev", {
          disabled: meta.page === 1,
          onClick: () => config.onPageChange(meta.page - 1),
        })
      );

      getVisiblePageItems(meta.totalPages).forEach((item) => {
        controls.appendChild(
          createPaginationButton(String(item.value), {
            active: item.value === meta.page,
            variant: "button-secondary",
            disabled: item.value === meta.page,
            onClick: () => config.onPageChange(item.value),
          })
        );
      });

      controls.appendChild(
        createPaginationButton("Next", {
          disabled: meta.page === meta.totalPages,
          onClick: () => config.onPageChange(meta.page + 1),
        })
      );

      controls.appendChild(
        createPaginationButton("All", {
          onClick: () => {
            if (typeof config.onToggleShowAll === "function") {
              config.onToggleShowAll(true);
            }
          },
        })
      );
    }

    root.append(summary, controls);
    container.replaceChildren(root);
    return meta;
  }

  document.addEventListener("DOMContentLoaded", () => {
    initializeAutoResizingTextareas();
    ensureSiteSearchUi();
    menuButtons = Array.from(document.querySelectorAll("[data-menu-toggle]"));
    navPanels = Array.from(document.querySelectorAll("[data-nav-panel]"));

    navPanels.forEach((panel, index) => {
      if (!panel.id) {
        panel.id = `site-nav-${index + 1}`;
      }
    });

    menuButtons.forEach((button) => {
      button.classList.add("icon-button");
      if (!button.querySelector(".icon-svg")) {
        button.replaceChildren();
        button.appendChild(createMenuToggleIcon());
      }
      button.setAttribute("aria-expanded", "false");
      button.setAttribute("aria-label", "Open navigation");
      const panel = button.parentElement?.querySelector("[data-nav-panel]");
      if (panel) {
        button.setAttribute("aria-controls", panel.id);
      }
      button.addEventListener("click", toggleMenu);
    });

    document.querySelectorAll("[data-menu-close]").forEach((element) => {
      element.addEventListener("click", closeMenu);
    });

    document
      .querySelectorAll(".top-nav a, .top-nav button")
      .forEach((element) => {
        element.addEventListener("click", closeMenu);
      });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeSiteSearch();
        closeMenu();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 760) {
        closeMenu();
      }

      syncMenuState(document.body.classList.contains("menu-open"));
      setupFooterAccordion();
    });

    syncMenuState(false);
    updateCustomerLinks();
    updateFooterLinks();
    updateFooterMeta();
    updateFooterSystemDetails();
    updateFooterServerStatus();
    setupFooterAccordion();

    if (window.matchMedia) {
      const colorSchemeMedia = window.matchMedia("(prefers-color-scheme: dark)");
      const handleThemeChange = () => {
        refreshThemeAwareProductImages();
      };

      if (typeof colorSchemeMedia.addEventListener === "function") {
        colorSchemeMedia.addEventListener("change", handleThemeChange);
      } else if (typeof colorSchemeMedia.addListener === "function") {
        colorSchemeMedia.addListener(handleThemeChange);
      }
    }

    const handleThemeMutation = () => {
      refreshThemeAwareProductImages();
    };

    [document.documentElement, document.body].filter(Boolean).forEach((element) => {
      const observer = new MutationObserver(handleThemeMutation);
      observer.observe(element, {
        attributes: true,
        attributeFilter: ["class", "data-theme", "style"],
      });
    });
  });

  window.SiteUi = {
    closeMenu,
    updateCustomerLinks,
    updateFooterLinks,
    updateFooterMeta,
    updateFooterSystemDetails,
    updateFooterServerStatus,
    setupFooterAccordion,
    getProductImageAsset,
    applyProductImageToElement,
    refreshThemeAwareProductImages,
    initializeAutoResizingTextareas,
    clampPageNumber,
    getPaginationMeta,
    renderPagination,
    openSiteSearch,
    closeSiteSearch,
  };
})();
