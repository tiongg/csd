package csd.t6.backend.admin;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import csd.t6.backend.account.dto.AccountResponseDto;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
  private final AdminService adminService;

  public AdminController(AdminService adminService) {
    this.adminService = adminService;
  }

  @GetMapping("/contributor-applications")
  public List<AccountResponseDto> getAllPendingApplications() {
    return this.adminService.getAllPendingContributors().stream().map(AccountResponseDto::new).toList();
  }

}
