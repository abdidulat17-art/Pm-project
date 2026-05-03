package com.senim.furniture.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.senim.furniture.entity.Product;
import com.senim.furniture.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.*;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    private final ProductRepository productRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Value("${groq.api.key}")
    private String groqApiKey;

    public ChatController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @PostMapping
    public Map<String, String> chat(@RequestBody Map<String, Object> request) {
        try {
            String userMessage = (String) request.getOrDefault("message", "");
            List<Map<String, String>> history =
                    (List<Map<String, String>>) request.getOrDefault("history", new ArrayList<>());

            // Build product catalog
            List<Product> products = productRepository.findAll();
            StringBuilder catalog = new StringBuilder();
            catalog.append("\n\nLive product catalog (").append(products.size()).append(" items):\n");
            for (Product p : products) {
                catalog.append("ID:").append(p.getId())
                        .append(" | \"").append(p.getName()).append("\"")
                        .append(" | ").append(p.getCategory())
                        .append(" | $").append(p.getPrice())
                        .append(" | color:").append(p.getColor() != null ? p.getColor() : "N/A")
                        .append(" | material:").append(p.getMaterial() != null ? p.getMaterial() : "N/A")
                        .append(" | stock:").append(p.getStock())
                        .append("\n");
            }

            String systemPrompt = "You are Senim, a friendly and conversational AI assistant for Senim Furniture — " +
                    "a premium furniture store in Almaty, Kazakhstan.\n\n" +
                    "You can talk about ANYTHING — greetings, small talk, jokes, life advice, etc. " +
                    "Be warm, human, and natural.\n\n" +
                    "When the topic is furniture or shopping, use the product catalog to give real " +
                    "recommendations with links like:\n" +
                    "<a href=\"pages/product-detail.html?id=ID\" target=\"_blank\">Product Name</a>\n\n" +                    "Rules:\n" +
                    "- Short friendly replies (2-4 sentences unless listing products)\n" +
                    "- 1-2 emojis per message\n" +
                    "- Bold product names with <strong>tags</strong>\n" +
                    "- Reply in the same language the user uses (English, Russian, or Kazakh)\n" +
                    "- For order questions, ask for order number or direct to hello@senim.kz\n" +
                    catalog;

            // Build messages — Groq uses same format as OpenAI
            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of("role", "system", "content", systemPrompt));

            // Add last 10 history messages
            int start = Math.max(0, history.size() - 10);
            for (int i = start; i < history.size(); i++) {
                messages.add(history.get(i));
            }
            messages.add(Map.of("role", "user", "content", userMessage));

            // Groq request — identical format to OpenAI
            Map<String, Object> requestBody = new LinkedHashMap<>();
            requestBody.put("model", "llama-3.3-70b-versatile"); // best free model on Groq
            requestBody.put("messages", messages);
            requestBody.put("max_tokens", 400);
            requestBody.put("temperature", 0.75);

            String bodyJson = objectMapper.writeValueAsString(requestBody);

            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.groq.com/openai/v1/chat/completions"))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + groqApiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(bodyJson))
                    .build();

            HttpResponse<String> response = httpClient.send(httpRequest,
                    HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                System.err.println("Groq error " + response.statusCode() + ": " + response.body());
                return Map.of("reply",
                        "Sorry, the AI is temporarily unavailable. Please contact us at hello@senim.kz 🙏");
            }

            JsonNode responseJson = objectMapper.readTree(response.body());
            String reply = responseJson
                    .path("choices").get(0)
                    .path("message")
                    .path("content")
                    .asText();

            // Convert markdown to HTML
            reply = reply
                    .replaceAll("\\*\\*(.*?)\\*\\*", "<strong>$1</strong>")
                    .replaceAll("\\*(.*?)\\*", "<em>$1</em>")
                    .replaceAll("\\[(.*?)]\\((.*?)\\)", "<a href=\"$2\">$1</a>")
                    .replaceAll("\n", "<br>");

            return Map.of("reply", reply);

        } catch (Exception e) {
            System.err.println("Chat error: " + e.getMessage());
            return Map.of("reply",
                    "Something went wrong 😔 Please try again or reach us at hello@senim.kz");
        }
    }
}
