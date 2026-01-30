package csd.t6.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import csd.t6.backend.decorators.auth.PublicDecorator;

@SpringBootApplication
@RestController
public class BackendApplication {

	@GetMapping("/")
	@PublicDecorator()
	public String index() {
		return "Hello World!";
	}

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}
}