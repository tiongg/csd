package csd.t6.backend.api.health;

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
    public String healthCheck() {
        return "OK";
    }
}
