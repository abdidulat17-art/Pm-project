package com.senim.furniture.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private BigDecimal price;

    private String imageUrl;

    private String color;

    private String material;

    @Column(nullable = false)
    private Integer stock = 0;

    // Stored as plain string to match frontend — e.g. "Sofas", "Tables"
    @Column(nullable = false)
    private String category;

    private Boolean featured = false;
}
