package com.hostel.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private final ConcurrentHashMap<String, List<Long>> requestCounts = new ConcurrentHashMap<>();
    private static final int MAX_REQUESTS_PER_MINUTE = 5;
    private static final long TIME_WINDOW_MS = 60_000;

    /** Endpoints that require rate limiting — all high-risk public POST/GET paths. */
    private static final Set<String> RATE_LIMITED_PATHS = Set.of(
        "/api/public/admission/requests",
        "/api/public/payments/confirm",
        "/api/public/students/lookup",
        "/api/public/students/register",
        "/api/auth/login"
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String uri = request.getRequestURI();
        if (RATE_LIMITED_PATHS.contains(uri)) {
            String clientIp = getClientIp(request);
            // Key by IP + path so limits are per-endpoint, not shared across endpoints
            String rateLimitKey = clientIp + "|" + uri;
            long currentTime = System.currentTimeMillis();

            requestCounts.putIfAbsent(rateLimitKey, new ArrayList<>());
            List<Long> timestamps = requestCounts.get(rateLimitKey);

            synchronized (timestamps) {
                timestamps.removeIf(t -> currentTime - t > TIME_WINDOW_MS);

                if (timestamps.size() >= MAX_REQUESTS_PER_MINUTE) {
                    response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\": \"Too many requests. Please try again later.\"}");
                    return;
                }

                timestamps.add(currentTime);
            }
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Extracts the real client IP, respecting reverse-proxy X-Forwarded-For headers.
     * Takes only the first (leftmost) IP in the chain to prevent header spoofing.
     */
    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader != null && !xfHeader.isBlank()) {
            return xfHeader.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
