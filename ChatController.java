package com.studybuddy.chatbot;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;
import java.util.*;

@RestController
@RequestMapping("/api")
public class ChatController {
    private final RestClient client = RestClient.create();

    public record ChatRequest(String message, String category, List<Map<String, String>> history) {}
    public record ChatResponse(String reply, boolean demoMode) {}

    @PostMapping("/chat")
    public ChatResponse chat(@RequestBody ChatRequest request) {
        String message = request.message() == null ? "" : request.message().trim();
        if (message.isEmpty()) return new ChatResponse("Please type a question first.", true);

        String apiKey = System.getenv("OPENAI_API_KEY");
        if (apiKey != null && !apiKey.isBlank()) {
            try {
                String model = Optional.ofNullable(System.getenv("OPENAI_MODEL")).filter(s -> !s.isBlank()).orElse("gpt-4o-mini");
                List<Map<String, Object>> messages = new ArrayList<>();
                messages.add(Map.of("role", "system", "content",
                    "You are StudyBuddy AI, a friendly assistant for basic study, health education, fitness, fashion, history, and coding questions. " +
                    "Explain simply and clearly. For health, give general educational information, do not diagnose, and encourage a trusted adult/qualified clinician for concerning symptoms. " +
                    "For emergencies, tell the user to contact local emergency services. For coding, use readable examples. " +
                    "The selected category is: " + safe(request.category()) + "."));
                if (request.history() != null) {
                    request.history().stream().skip(Math.max(0, request.history().size() - 8)).forEach(item -> {
                        String role = item.getOrDefault("role", "user");
                        String content = item.getOrDefault("content", "");
                        if ((role.equals("user") || role.equals("assistant")) && !content.isBlank()) {
                            messages.add(Map.of("role", role, "content", content));
                        }
                    });
                }
                messages.add(Map.of("role", "user", "content", message));
                Map<String, Object> payload = Map.of("model", model, "messages", messages, "temperature", 0.7);
                Map<?, ?> result = client.post()
                    .uri("https://api.openai.com/v1/chat/completions")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve().body(Map.class);
                if (result != null) {
                    List<?> choices = (List<?>) result.get("choices");
                    if (choices != null && !choices.isEmpty()) {
                        Map<?, ?> choice = (Map<?, ?>) choices.get(0);
                        Map<?, ?> msg = (Map<?, ?>) choice.get("message");
                        Object content = msg == null ? null : msg.get("content");
                        if (content != null) return new ChatResponse(content.toString(), false);
                    }
                }
            } catch (Exception ignored) {
                return new ChatResponse("I couldn't reach the AI service just now. Check the API key, internet connection, and model setting, then try again.", true);
            }
        }
        return new ChatResponse(demoReply(message, safe(request.category())), true);
    }

    private String safe(String value) { return value == null || value.isBlank() ? "General" : value; }

    private String demoReply(String message, String category) {
        String q = message.toLowerCase(Locale.ROOT);
        if (category.equals("Coding") || q.contains("java") || q.contains("python") || q.contains("code") || q.contains("program")) {
            return "👨‍💻 **Coding help (demo mode)**\n\nI can help explain the logic, debug errors, and show examples.\n\nTry asking: “Explain loops in Java with a simple example” or “What is the difference between a class and an object?”\n\nTo enable AI-generated answers, set the `OPENAI_API_KEY` environment variable and restart the app.";
        }
        if (category.equals("Health") || q.contains("health") || q.contains("pain") || q.contains("fever")) {
            return "🩺 **General health information (demo mode)**\n\nI can share basic educational information, but I can't diagnose a condition. If symptoms are severe, worsening, or worrying, tell a trusted adult and contact a qualified healthcare professional.\n\nFor a more useful answer, describe the general question and how long it has been happening. Avoid sharing private identifying information.";
        }
        if (category.equals("Fitness") || q.contains("gym") || q.contains("workout") || q.contains("exercise")) {
            return "💪 **Fitness basics (demo mode)**\n\nA balanced beginner routine usually combines strength training, comfortable cardio, rest, hydration, and regular meals. Start with manageable exercises and focus on safe technique rather than lifting heavy quickly.\n\nTry: “Make a beginner full-body workout” (AI mode provides a tailored answer).";
        }
        if (category.equals("Fashion") || q.contains("outfit") || q.contains("fashion") || q.contains("style")) {
            return "👕 **Style help (demo mode)**\n\nA simple way to build an outfit is to choose one main piece, keep the colour palette coordinated, and match the formality of your shoes and accessories to the occasion.\n\nTry asking about casual college outfits, colour combinations, or outfit ideas for an event.";
        }
        if (category.equals("History")) {
            return "📚 **History help (demo mode)**\n\nFor a strong history answer, organise it as: background → key events → causes → effects → short conclusion. Include dates only when you are confident they are correct.\n\nTry asking: “Explain the causes of the French Revolution in simple language.”";
        }
        if (category.equals("Study")) {
            return "🎓 **Study help (demo mode)**\n\nBreak a topic into small parts: understand the definition, learn one example, practise a question, then revise it from memory.\n\nTry asking: “Explain Ohm’s law with an example” or “Make a 30-minute revision plan.”";
        }
        return "Hey! 👋 I'm StudyBuddy AI. I can help with Study, Health, Fitness, Fashion, History, and Coding.\n\nRight now I'm in **demo mode**, so these are starter responses rather than full AI answers. Add an `OPENAI_API_KEY` environment variable to enable AI-generated replies. What would you like to learn about?";
    }
}
