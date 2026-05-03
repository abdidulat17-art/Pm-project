package com.senim.furniture.repository;

import com.senim.furniture.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // Match frontend: GET /api/products/category/{category}
    List<Product> findByCategoryIgnoreCase(String category);

    // Featured products for homepage
    List<Product> findByFeaturedTrue();

    // Search by name or description
    List<Product> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
            String name, String description);
}
