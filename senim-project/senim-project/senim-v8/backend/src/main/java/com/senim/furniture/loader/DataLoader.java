package com.senim.furniture.loader;

import com.senim.furniture.entity.Category;
import com.senim.furniture.entity.Product;
import com.senim.furniture.repository.CategoryRepository;
import com.senim.furniture.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataLoader implements CommandLineRunner {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public void run(String... args) {
        if (productRepository.count() > 0) {
            log.info("Database already seeded — skipping DataLoader.");
            return;
        }

        log.info("Seeding database with sample data...");
        seedCategories();
        seedProducts();
        log.info("Database seeding complete. {} products, {} categories loaded.",
                productRepository.count(), categoryRepository.count());
    }

    private void seedCategories() {
        List<Category> categories = List.of(
                Category.builder().name("Sofas").description("Luxurious sofas for every living room").build(),
                Category.builder().name("Armchairs").description("Comfortable and stylish armchairs").build(),
                Category.builder().name("Curtains").description("Elegant curtains to transform any room").build(),
                Category.builder().name("Chairs").description("Dining and accent chairs").build(),
                Category.builder().name("Tables").description("Coffee tables, dining tables and more").build(),
                Category.builder().name("Accessories").description("Lamps, mirrors and decorative accents").build(),
                Category.builder().name("Pillows").description("Throw pillows and cushions").build()
        );
        categoryRepository.saveAll(categories);
    }

    private void seedProducts() {
        List<Product> products = List.of(
                Product.builder()
                        .name("Brown Sofa")
                        .category("Sofas")
                        .description("Luxurious brown leather sofa with deep cushions, perfect for a modern living room.")
                        .price(new BigDecimal("699000"))
                        .imageUrl("https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600")
                        .color("Brown")
                        .material("Leather")
                        .stock(8)
                        .featured(true)
                        .build(),

                Product.builder()
                        .name("Green Armchair")
                        .category("Armchairs")
                        .description("Elegant green velvet armchair that adds a pop of color and comfort.")
                        .price(new BigDecimal("249000"))
                        .imageUrl("https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600")
                        .color("Green")
                        .material("Velvet")
                        .stock(12)
                        .featured(true)
                        .build(),

                Product.builder()
                        .name("Red Curtain Set")
                        .category("Curtains")
                        .description("Rich red linen curtains to create a warm and cozy atmosphere.")
                        .price(new BigDecimal("249000"))
                        .imageUrl("https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600")
                        .color("Red")
                        .material("Linen")
                        .stock(20)
                        .featured(false)
                        .build(),

                Product.builder()
                        .name("Organic Chair")
                        .category("Chairs")
                        .description("Minimalist scandinavian chair with organic curves and natural wood.")
                        .price(new BigDecimal("199000"))
                        .imageUrl("https://images.unsplash.com/photo-1503602642458-232111445657?w=600")
                        .color("Natural")
                        .material("Wood")
                        .stock(5)
                        .featured(true)
                        .build(),

                Product.builder()
                        .name("Marble Coffee Table")
                        .category("Tables")
                        .description("Elegant marble-top coffee table with gold legs, a statement piece.")
                        .price(new BigDecimal("389000"))
                        .imageUrl("https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600")
                        .color("White/Gold")
                        .material("Marble")
                        .stock(3)
                        .featured(true)
                        .build(),

                Product.builder()
                        .name("Luxury Floor Lamp")
                        .category("Accessories")
                        .description("Sleek black floor lamp with adjustable arm, perfect for reading nooks.")
                        .price(new BigDecimal("129000"))
                        .imageUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600")
                        .color("Black")
                        .material("Metal")
                        .stock(15)
                        .featured(false)
                        .build(),

                Product.builder()
                        .name("Velvet Throw Pillow")
                        .category("Pillows")
                        .description("Set of 2 luxurious velvet throw pillows in muted earthy tones.")
                        .price(new BigDecimal("45000"))
                        .imageUrl("https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600")
                        .color("Beige")
                        .material("Velvet")
                        .stock(30)
                        .featured(false)
                        .build(),

                Product.builder()
                        .name("Oak Dining Table")
                        .category("Tables")
                        .description("Solid oak dining table seating 6, featuring natural grain finish.")
                        .price(new BigDecimal("850000"))
                        .imageUrl("https://images.unsplash.com/photo-1449247709967-d4461a6a6103?w=600")
                        .color("Oak")
                        .material("Wood")
                        .stock(4)
                        .featured(true)
                        .build(),

                Product.builder()
                        .name("Linen Sofa 3-Seat")
                        .category("Sofas")
                        .description("Contemporary 3-seat sofa in natural linen, timeless and elegant.")
                        .price(new BigDecimal("580000"))
                        .imageUrl("https://images.unsplash.com/photo-1571508601891-ca5e7a713859?w=600")
                        .color("Cream")
                        .material("Linen")
                        .stock(6)
                        .featured(false)
                        .build(),

                Product.builder()
                        .name("Velvet Armchair")
                        .category("Armchairs")
                        .description("Deep-button tufted armchair in royal blue velvet with gold legs.")
                        .price(new BigDecimal("319000"))
                        .imageUrl("https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600")
                        .color("Blue")
                        .material("Velvet")
                        .stock(9)
                        .featured(false)
                        .build(),

                Product.builder()
                        .name("Sheer White Curtains")
                        .category("Curtains")
                        .description("Light, airy white sheer curtains to diffuse natural light beautifully.")
                        .price(new BigDecimal("189000"))
                        .imageUrl("https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600")
                        .color("White")
                        .material("Sheer Fabric")
                        .stock(25)
                        .featured(false)
                        .build(),

                Product.builder()
                        .name("Foam Accent Pillow Set")
                        .category("Pillows")
                        .description("Set of 4 colorful geometric accent pillows. Modern and playful.")
                        .price(new BigDecimal("65000"))
                        .imageUrl("https://images.unsplash.com/photo-1579656592043-a20e25a4aa4b?w=600")
                        .color("Multi")
                        .material("Cotton")
                        .stock(18)
                        .featured(false)
                        .build()
        );

        productRepository.saveAll(products);
    }
}
