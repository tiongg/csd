package csd.t6.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController
public class BackendApplication {

	@RequestMapping("/")
	public String index() {
		return "Hello World!";
	}

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}
}