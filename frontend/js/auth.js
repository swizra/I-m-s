(function () {
    const STORAGE_KEYS = {
        admin: "kefeAdminAuth",
        customer: "kefeCustomerAuth"
    };
    const CUSTOMER_LOCAL_STORAGE_KEYS = ["kefeCart"];
    const CUSTOMER_SESSION_STORAGE_KEYS = ["kefeCart", "kefeLastOrderNotice", "kefeAccountNotice"];

    function normalizeScope(scope) {
        return scope === "customer" ? "customer" : "admin";
    }

    function clearCustomerState() {
        CUSTOMER_LOCAL_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
        CUSTOMER_SESSION_STORAGE_KEYS.forEach((key) => sessionStorage.removeItem(key));
    }

    function saveSession(scope, session) {
        const normalizedScope = normalizeScope(scope);
        const previousSession = normalizedScope === "customer" ? getSession("customer") : null;

        if (normalizedScope === "customer") {
            const previousUsername = previousSession?.username ? String(previousSession.username).toLowerCase() : "";
            const nextUsername = session?.username ? String(session.username).toLowerCase() : "";

            if (!previousUsername || !nextUsername || previousUsername !== nextUsername) {
                clearCustomerState();
            }
        }

        localStorage.setItem(STORAGE_KEYS[normalizedScope], JSON.stringify(session));
    }

    function getSession(scope = "admin") {
        const storageKey = STORAGE_KEYS[normalizeScope(scope)];
        const rawValue = localStorage.getItem(storageKey);
        if (!rawValue) {
            return null;
        }

        try {
            return JSON.parse(rawValue);
        } catch (error) {
            localStorage.removeItem(storageKey);
            return null;
        }
    }

    function clearSession(scope = "admin") {
        const normalizedScope = normalizeScope(scope);
        localStorage.removeItem(STORAGE_KEYS[normalizedScope]);

        if (normalizedScope === "customer") {
            clearCustomerState();
        }
    }

    function getAuthorizationHeader(scope = "admin") {
        const session = getSession(scope);
        if (!session || !session.accessToken) {
            return null;
        }

        return `Bearer ${session.accessToken}`;
    }

    function redirectToLogin(scope = "admin") {
        const loginPage = normalizeScope(scope) === "customer" ? "customer-auth.html" : "login.html";
        if (!window.location.pathname.endsWith(loginPage)) {
            window.location.href = loginPage;
        }
    }

    function redirectStaffHome(session = getSession("admin")) {
        const role = String(session?.role || "").toUpperCase();
        const destination = role === "HR" ? "admin-careers.html" : "admin-dashboard.html";
        if (!window.location.pathname.endsWith(destination)) {
            window.location.href = destination;
        }
    }

    function requireAuth(scope = "admin") {
        if (!getAuthorizationHeader(scope)) {
            redirectToLogin(scope);
        }
    }

    function requireAllowedStaffRoles(allowedRoles) {
        const session = getSession("admin");
        if (!session) {
            redirectToLogin("admin");
            return;
        }

        const allowedRoleSet = new Set(
            String(allowedRoles || "")
                .split(",")
                .map((role) => role.trim().toUpperCase())
                .filter(Boolean)
        );

        if (!allowedRoleSet.size) {
            return;
        }

        const currentRole = String(session.role || "").toUpperCase();
        if (!allowedRoleSet.has(currentRole)) {
            redirectStaffHome(session);
        }
    }

    function applyStaffRoleVisibility() {
        const session = getSession("admin");
        if (!session) {
            return;
        }

        const currentRole = String(session.role || "").toUpperCase();
        document.querySelectorAll("[data-staff-link-roles]").forEach((element) => {
            const allowedRoles = new Set(
                String(element.dataset.staffLinkRoles || "")
                    .split(",")
                    .map((role) => role.trim().toUpperCase())
                    .filter(Boolean)
            );

            element.classList.toggle("is-hidden", allowedRoles.size > 0 && !allowedRoles.has(currentRole));
        });
    }

    function handleUnauthorized(scope = "admin") {
        clearSession(scope);
        redirectToLogin(scope);
    }

    function showMessage(element, message) {
        if (!element) {
            return;
        }
        element.textContent = message;
        element.className = "message message-error show";
    }

    async function handleAdminLoginSubmit(event) {
        event.preventDefault();

        const username = document.getElementById("login-username").value.trim();
        const password = document.getElementById("login-password").value.trim();
        const errorBox = document.getElementById("login-error");

        if (!username || !password) {
            showMessage(errorBox, "Please enter both username and password.");
            return;
        }

        try {
            const session = await window.InventoryApi.login({ username, password });
            saveSession("admin", session);
            redirectStaffHome(session);
        } catch (error) {
            clearSession("admin");
            showMessage(errorBox, error.message || "Login failed. Please check your credentials.");
        }
    }

    function handleLogout(event) {
        const scope = normalizeScope(event.currentTarget.dataset.authScope || "admin");
        clearSession(scope);
        window.location.href = scope === "customer" ? "customer-auth.html" : "login.html";
    }

    function attachLogoutButtons() {
        document.querySelectorAll("[data-auth-logout]").forEach((button) => {
            button.addEventListener("click", handleLogout);
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        const adminLoginForm = document.getElementById("login-form");
        if (adminLoginForm) {
            adminLoginForm.addEventListener("submit", handleAdminLoginSubmit);
        }

        if (document.body.dataset.requiresAuth === "true") {
            requireAuth("admin");
        }

        if (document.body.dataset.allowedRoles) {
            requireAllowedStaffRoles(document.body.dataset.allowedRoles);
        }

        if (document.body.dataset.requiresCustomerAuth === "true") {
            requireAuth("customer");
        }

        applyStaffRoleVisibility();
        attachLogoutButtons();
    });

    window.Auth = {
        saveSession,
        getSession,
        clearSession,
        getAuthorizationHeader,
        requireAuth,
        requireAllowedStaffRoles,
        applyStaffRoleVisibility,
        handleUnauthorized,
        clearCustomerState,
        redirectStaffHome,
        saveCredentials: saveSession,
        getCredentials: getSession,
        clearCredentials: clearSession
    };
}());
