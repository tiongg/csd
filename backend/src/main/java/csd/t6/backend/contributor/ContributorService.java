package csd.t6.backend.contributor;

import static csd.t6.jooq.public_.tables.PendingContributors.PENDING_CONTRIBUTORS;

import java.util.UUID;

import org.springframework.stereotype.Service;

import csd.t6.backend.contributor.dto.response.ImageUploadResponse;
import csd.t6.backend.exceptions.BadRequestException;
import csd.t6.backend.utils.FileService;

@Service
public class ContributorService {
  private final PendingContributorRepository pendingContributorRepository;
  private final FileService fileService;

  public ContributorService(PendingContributorRepository pendingContributorRepository, FileService fileService) {
    this.pendingContributorRepository = pendingContributorRepository;
    this.fileService = fileService;
  }

  public void insertPendingContributor(UUID learnerUUID) {
    if (this.pendingContributorRepository.exists(PENDING_CONTRIBUTORS.LEARNER_ID, learnerUUID)) {
      throw new BadRequestException("User is pending approval!");
    }

    this.pendingContributorRepository.insertPendingContributor(learnerUUID);
  }

  public ImageUploadResponse getFileUploadUrl(UUID courseId, String extension) {
    if (!extension.equals("png") && !extension.equals("jpg") && !extension.equals("jpeg")) {
      throw new BadRequestException("Invalid file type!");
    }

    String key = String.format("editor/%s/%s.%s", courseId, UUID.randomUUID(), extension);
    String url = this.fileService.generatePresignedUploadUrl(key);
    String publicUrl = this.fileService.getPublicUrl(key);
    return new ImageUploadResponse(url, key, publicUrl);
  }
}
