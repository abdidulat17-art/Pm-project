package com.senim.furniture.service;

import com.senim.furniture.dto.AuthResponse;
import com.senim.furniture.dto.LoginRequest;
import com.senim.furniture.dto.RegisterRequest;
import com.senim.furniture.entity.User;
import com.senim.furniture.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "An account with this email already exists.");
        }

        String storedPassword = hashPassword(req.getPassword());
        String token = UUID.randomUUID().toString();

        User user = User.builder()
                .firstName(req.getFirstName())
                .lastName(req.getLastName())
                .email(req.getEmail())
                .password(storedPassword)
                .phone(req.getPhone())
                .role("USER")
                .token(token)
                .build();

        userRepository.save(user);
        return toResponse(user);
    }

    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Invalid email or password."));

        if (!checkPassword(req.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password.");
        }

        user.setToken(UUID.randomUUID().toString());
        userRepository.save(user);

        return toResponse(user);
    }

    private String hashPassword(String raw) {
        return "SENIM:" + new StringBuilder(raw).reverse().toString();
    }

    private boolean checkPassword(String raw, String stored) {
        return stored.equals(hashPassword(raw));
    }

    private AuthResponse toResponse(User user) {
        return AuthResponse.builder()
                .userId(user.getId())
                .token(user.getToken())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .build();
    }
}
