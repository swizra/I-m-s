package com.example.inventory.service;

import com.example.inventory.dto.AuthTokenResponse;
import com.example.inventory.model.AppUser;
import com.example.inventory.model.UserRole;
import com.example.inventory.repository.AppUserRepository;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final AppUserRepository appUserRepository;
    private final JwtEncoder jwtEncoder;
    private final Duration accessTokenTtl;
    private final String issuer;

    public AuthService(AuthenticationManager authenticationManager,
                       AppUserRepository appUserRepository,
                       JwtEncoder jwtEncoder,
                       @Value("${security.jwt.access-token-ttl}") Duration accessTokenTtl,
                       @Value("${security.jwt.issuer}") String issuer) {
        this.authenticationManager = authenticationManager;
        this.appUserRepository = appUserRepository;
        this.jwtEncoder = jwtEncoder;
        this.accessTokenTtl = accessTokenTtl;
        this.issuer = issuer;
    }

    public AuthTokenResponse authenticate(String username, String password) {
        authenticationManager.authenticate(
                UsernamePasswordAuthenticationToken.unauthenticated(username.trim(), password)
        );

        AppUser appUser = appUserRepository.findByUsernameIgnoreCase(username.trim())
                .orElseThrow();

        return createTokenResponse(appUser);
    }

    public String extractUsername(org.springframework.security.core.Authentication authentication) {
        Object principal = authentication.getPrincipal();
        if (principal instanceof org.springframework.security.oauth2.jwt.Jwt jwt) {
            return jwt.getClaimAsString("username");
        }

        return authentication.getName();
    }

    public AuthTokenResponse createTokenResponse(AppUser appUser) {
        Instant issuedAt = Instant.now();
        Instant expiresAt = issuedAt.plus(accessTokenTtl);
        String role = appUser.getRole().name();
        String scope = role.toLowerCase();

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(issuer)
                .issuedAt(issuedAt)
                .expiresAt(expiresAt)
                .subject(String.valueOf(appUser.getId()))
                .claim("username", appUser.getUsername())
                .claim("roles", List.of(role))
                .claim("scope", scope)
                .build();

        AuthTokenResponse response = new AuthTokenResponse();
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        response.setAccessToken(jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue());
        response.setTokenType("Bearer");
        response.setExpiresIn(accessTokenTtl.toSeconds());
        response.setScope(scope);
        response.setUsername(appUser.getUsername());
        response.setRole(role);
        return response;
    }
}
