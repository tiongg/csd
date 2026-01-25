package csd.t6.backend.decorators.auth;

import org.springframework.http.HttpMethod;

public record RouteInfo(String path, HttpMethod httpMethod) {}
