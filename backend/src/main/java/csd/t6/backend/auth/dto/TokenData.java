package csd.t6.backend.auth.dto;

import csd.t6.jooq.accounts.tables.records.AccountRecord;
import jakarta.servlet.http.Cookie;

public record TokenData(String accessToken, AccountRecord account, Cookie refreshCookie) {}
