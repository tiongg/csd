package csd.t6.backend;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@Disabled("Disabled to avoid starting full Spring context during unit test runs without a configured DataSource")
@SpringBootTest
class BackendApplicationTests {

    @Test
    void contextLoads() {
    }
}
