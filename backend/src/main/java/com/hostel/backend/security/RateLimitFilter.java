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
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private final ConcurrentHashMap<String, List<Long>> requestCounts = new ConcurrentHashMap<>();
    private static final int MAX_REQUESTS_PER_MINUTE = 5;
    private static final long TIME_WINDOW_MS = 60000;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Only apply rate limiting to the public admission submission endpoint
        if (request.getRequestURI().equals("/api/public/admission/requests") && request.getMethod().equalsIgnoreCase("POST")) {
            String clientIp = getClientIp(request);
            long currentTime = System.currentTimeMillis();

            requestCounts.putIfAbsent(clientIp, new ArrayList<>());
            List<Long> timestamps = requestCounts.get(clientIp);

            synchronized (timestamps) {
                // Remove timestamps outside the 1-minute window
                timestamps.removeIf(t -> currentTime - t > TIME_WINDOW_MS);

                if (timestamps.size() >= MAX_REQUESTS_PER_MINUTE) {
                    response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\": \"Too many requests. Please try again later.\"}");
                    return; // Block request
                }

                timestamps.add(currentTime);
            }
        }

        filterChain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty()) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }
}
