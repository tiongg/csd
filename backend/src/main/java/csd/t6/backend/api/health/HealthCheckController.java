package csd.t6.backend.api.health;

import csd.t6.backend.decorators.auth.PublicDecorator;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Simple health check endpoint to verify backend is responding
 */
@RestController
@RequestMapping("/api/health")
public class HealthCheckController {

    @GetMapping
    @PublicDecorator
    public String healthCheck() {
        return "OK";
    }
}