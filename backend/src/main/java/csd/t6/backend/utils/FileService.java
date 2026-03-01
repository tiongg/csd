package csd.t6.backend.utils;

import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;

@Service
public class FileService {
  @Value("${spring.cloud.config.server.awss3.endpoint}")
  private String endpoint;

  @Value("${spring.cloud.config.server.awss3.bucket}")
  private String bucketName;

  private final S3Presigner s3Presigner;

  public FileService(S3Presigner s3Presigner) {
    this.s3Presigner = s3Presigner;
  }

  /**
   * Generates a presigned URL for uploading a file to S3.
   *
   * @param key the S3 object key
   * @return the presigned upload URL
   */
  public String generatePresignedUploadUrl(String key) {
    return generatePresignedUploadUrl(key, Duration.ofMinutes(5));
  }

  /**
   * Generates a presigned URL for uploading a file to S3.
   *
   * @param key        - the S3 object key
   * @param expiration - the duration until the URL expires
   * @return the presigned upload URL
   */
  public String generatePresignedUploadUrl(String key, Duration expiration) {
    PutObjectRequest putObjectRequest = PutObjectRequest.builder().bucket(bucketName).key(key).build();

    PresignedPutObjectRequest presignedRequest = s3Presigner
        .presignPutObject(z -> z.signatureDuration(expiration).putObjectRequest(putObjectRequest));

    return presignedRequest.url().toString();
  }

  /**
   * Generates a presigned URL for downloading a file from S3.
   *
   * @param key - the S3 object key
   * @return the presigned download URL
   */
  public String generatePresignedDownloadUrl(String key) {
    return generatePresignedDownloadUrl(key, Duration.ofMinutes(5));
  }

  /**
   * Generates a presigned URL for downloading a file from S3.
   *
   * @param key        - the S3 object key
   * @param expiration - the duration until the URL expires
   * @return the presigned download URL
   */
  public String generatePresignedDownloadUrl(String key, Duration expiration) {
    GetObjectRequest getObjectRequest = GetObjectRequest.builder().bucket(bucketName).key(key).build();

    PresignedGetObjectRequest presignedRequest = s3Presigner
        .presignGetObject(z -> z.signatureDuration(expiration).getObjectRequest(getObjectRequest));

    return presignedRequest.url().toString();
  }

  /**
   * Gets a public URL for an S3 object. Note: This assumes the bucket is
   * configured for public read access.
   *
   * @param key - the S3 object key
   * @return the public URL
   */
  public String getPublicUrl(String key) {
    return String.format("%s/%s/%s", endpoint, bucketName, key);
  }
}
