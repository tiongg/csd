package csd.t6.backend.auth.dto.response;

import csd.t6.jooq.accounts.tables.records.AccountRecord;
import jakarta.servlet.http.Cookie;

public record TokenDataResponse(String accessToken, AccountRecord account, Cookie refreshCookie) {}
