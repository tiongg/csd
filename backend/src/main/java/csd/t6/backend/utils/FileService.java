package csd.t6.backend.utils;

import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import software.amazon.awssdk.core.exception.SdkException;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.DeleteObjectResponse;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

@Service
public class FileService {
  @Value("${spring.cloud.config.server.awss3.endpoint}")
  private String endpoint;

  @Value("${spring.cloud.config.server.awss3.bucket}")
  private String bucketName;

  private final S3Client s3Client;

  private final S3Presigner s3Presigner;

  public FileService(S3Presigner s3Presigner, S3Client s3Client) {
    this.s3Presigner = s3Presigner;
    this.s3Client = s3Client;
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
    PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder().signatureDuration(expiration)
        .putObjectRequest(putObjectRequest).build();
    PresignedPutObjectRequest presignedRequest = this.s3Presigner.presignPutObject(presignRequest);

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

    GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder().signatureDuration(expiration)
        .getObjectRequest(getObjectRequest).build();

    PresignedGetObjectRequest presignedRequest = this.s3Presigner.presignGetObject(presignRequest);

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

  public void deleteObject(String key) {
    DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder().bucket(bucketName).key(key).build();

    DeleteObjectResponse deleteObjectResponse = this.s3Client.deleteObject(deleteObjectRequest);
  }

  public boolean exists(String key) {
    try {
      this.s3Client.headObject(builder -> builder.bucket(bucketName).key(key).build());
      return true;
    } catch (SdkException e) {
      return false;
    }
  }
}
