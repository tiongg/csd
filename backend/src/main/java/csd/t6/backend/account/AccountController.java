package csd.t6.backend.account;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import csd.t6.jooq.tables.records.AccountRecord;

@RestController
@RequestMapping("/api/account")
public class AccountController {
  private final AccountService accountService;

  public AccountController(AccountService accountService) {
    this.accountService = accountService;
  }

  @GetMapping
  public List<AccountRecord> getAll() {
    return accountService.getAllAccounts();
  }
}
