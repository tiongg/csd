package csd.t6.backend.api.health;

import java.util.List;

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
        return "Backend is running and responding correctly! Database: " +
               (System.currentTimeMillis() / 1000) + "ms since start";
    }
}
