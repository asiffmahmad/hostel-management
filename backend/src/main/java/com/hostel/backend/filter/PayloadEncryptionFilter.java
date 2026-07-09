package com.hostel.backend.filter;

import com.hostel.backend.security.PayloadEncryptionUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ReadListener;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletInputStream;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.stream.Collectors;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
@RequiredArgsConstructor
@Slf4j
public class PayloadEncryptionFilter extends OncePerRequestFilter {

    private final PayloadEncryptionUtil payloadEncryptionUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Ignore OPTIONS (CORS preflight), actuator, and health endpoints from encryption
        if ("OPTIONS".equalsIgnoreCase(request.getMethod()) || 
            request.getRequestURI().startsWith("/actuator") || 
            request.getRequestURI().startsWith("/api/public/health")) {
            filterChain.doFilter(request, response);
            return;
        }

        HttpServletRequest requestToUse = request;
        ContentCachingResponseWrapper responseWrapper = new ContentCachingResponseWrapper(response);

        try {
            // Check if Request has JSON content
            if (request.getContentType() != null && request.getContentType().toLowerCase().contains("application/json")) {
                String requestBody = request.getReader().lines().collect(Collectors.joining(System.lineSeparator()));
                if (!requestBody.isEmpty()) {
                    try {
                        String payloadStr = null;
                        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("\"payload\"\\s*:\\s*\"([^\"]+)\"");
                        java.util.regex.Matcher matcher = pattern.matcher(requestBody);
                        if (matcher.find()) {
                            payloadStr = matcher.group(1);
                        }

                        if (payloadStr != null) {
                            String decryptedBody = payloadEncryptionUtil.decryptPayload(payloadStr);
                            requestToUse = new DecryptedRequestWrapper(request, decryptedBody);
                        } else {
                            // Already plain JSON or no payload, just re-wrap the original body so it's not lost
                            requestToUse = new DecryptedRequestWrapper(request, requestBody);
                        }
                    } catch (Exception e) {
                        log.error("Failed to decrypt request payload", e);
                        // Forward as-is if decryption fails
                        requestToUse = new DecryptedRequestWrapper(request, requestBody);
                    }
                }
            }

            filterChain.doFilter(requestToUse, responseWrapper);

        } finally {
            // Process Response
            String contentType = responseWrapper.getContentType();
            byte[] responseData = responseWrapper.getContentAsByteArray();
            
            if (contentType != null && contentType.toLowerCase().contains("application/json") && responseData.length > 0) {
                try {
                    String originalResponse = new String(responseData, StandardCharsets.UTF_8);
                    
                    // Don't double-encrypt if it's already a payload map
                    if (!originalResponse.startsWith("{\"payload\":")) {
                        String encryptedResponse = payloadEncryptionUtil.encryptPayload(originalResponse);
                        byte[] encryptedData = encryptedResponse.getBytes(StandardCharsets.UTF_8);
                        
                        responseWrapper.resetBuffer();
                        responseWrapper.getOutputStream().write(encryptedData);
                        responseWrapper.setContentLength(encryptedData.length);
                    }
                } catch (Exception e) {
                    log.error("Failed to encrypt response payload", e);
                    // Just write the original back if encryption somehow fails
                }
            }
            responseWrapper.copyBodyToResponse();
        }
    }

    private static class DecryptedRequestWrapper extends HttpServletRequestWrapper {
        private final byte[] body;

        public DecryptedRequestWrapper(HttpServletRequest request, String bodyStr) {
            super(request);
            this.body = bodyStr.getBytes(StandardCharsets.UTF_8);
        }

        @Override
        public ServletInputStream getInputStream() {
            final ByteArrayInputStream byteArrayInputStream = new ByteArrayInputStream(body);
            return new ServletInputStream() {
                @Override
                public boolean isFinished() { return byteArrayInputStream.available() == 0; }
                @Override
                public boolean isReady() { return true; }
                @Override
                public void setReadListener(ReadListener readListener) {}
                @Override
                public int read() { return byteArrayInputStream.read(); }
            };
        }

        @Override
        public BufferedReader getReader() {
            return new BufferedReader(new InputStreamReader(this.getInputStream(), StandardCharsets.UTF_8));
        }
        
        @Override
        public int getContentLength() {
            return body.length;
        }

        @Override
        public long getContentLengthLong() {
            return body.length;
        }
    }
}
