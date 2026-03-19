package csd.t6.backend.account.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "ProfilePictureUpload")
public record ProfilePictureUploadResponse(
    String url,
    String key,
    String publicUrl) {
}
