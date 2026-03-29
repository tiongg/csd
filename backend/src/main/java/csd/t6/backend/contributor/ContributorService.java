package csd.t6.backend.contributor;

import static csd.t6.jooq.public_.tables.PendingContributors.PENDING_CONTRIBUTORS;

import java.util.UUID;

import org.springframework.stereotype.Service;

import csd.t6.backend.contributor.dto.response.ImageUploadResponse;
import csd.t6.backend.exceptions.BadRequestException;
import csd.t6.backend.notification.NotificationService;
import csd.t6.backend.utils.FileService;
import csd.t6.jooq.accounts.enums.Roles;
import csd.t6.jooq.public_.enums.NotificationType;

@Service
public class ContributorService {
  private final PendingContributorRepository pendingContributorRepository;
  private final FileService fileService;
  private final NotificationService notificationService;

  public ContributorService(PendingContributorRepository pendingContributorRepository, FileService fileService,
      NotificationService notificationService) {
    this.pendingContributorRepository = pendingContributorRepository;
    this.fileService = fileService;
    this.notificationService = notificationService;
  }

  public void insertPendingContributor(UUID learnerUUID) {
    if (this.pendingContributorRepository.exists(PENDING_CONTRIBUTORS.LEARNER_ID, learnerUUID)) {
      throw new BadRequestException("User is pending approval!");
    }

    this.pendingContributorRepository.insertPendingContributor(learnerUUID);

    notificationService.sendToRole(Roles.ADMIN, NotificationType.CONTRIBUTOR_APPLIED, "Contributor Application",
        "A new contributor application awaits review", learnerUUID);
  }

  public ImageUploadResponse getFileUploadUrl(UUID courseId, String extension) {
    if (!"png".equals(extension) && !"jpg".equals(extension) && !"jpeg".equals(extension)) {
      throw new BadRequestException("Invalid file type!");
    }

    String key = String.format("editor/%s/%s.%s", courseId, UUID.randomUUID(), extension);
    String url = this.fileService.generatePresignedUploadUrl(key);
    String publicUrl = this.fileService.getPublicUrl(key);
    return new ImageUploadResponse(url, key, publicUrl);
  }
}