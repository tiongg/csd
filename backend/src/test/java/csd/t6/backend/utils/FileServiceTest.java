package csd.t6.backend.utils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.net.MalformedURLException;
import java.net.URI;
import java.net.URL;
import java.time.Duration;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import software.amazon.awssdk.core.exception.SdkException;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.HeadObjectResponse;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

@ExtendWith(MockitoExtension.class)
class FileServiceTest {

  @Mock
  private S3Presigner s3Presigner;

  @Mock
  private S3Client s3Client;

  @Mock
  private PresignedPutObjectRequest presignedPutObjectRequest;

  @Mock
  private PresignedGetObjectRequest presignedGetObjectRequest;

  @InjectMocks
  private FileService fileService;

  private String testKey;
  private URI mockUri;
  private URL mockUrl;

  @BeforeEach
  void setUp() throws MalformedURLException {
    testKey = "test-file.txt";
    mockUri = URI.create("https://example-bucket.s3.amazonaws.com/test-file.txt");
    mockUrl = mockUri.toURL();
  }

  @Test
  @DisplayName("Should generate presigned upload URL with default duration")
  void shouldGeneratePresignedUploadUrlWithDefaultDuration() {
    when(s3Presigner.presignPutObject(any(PutObjectPresignRequest.class)))
        .thenReturn(presignedPutObjectRequest);
    when(presignedPutObjectRequest.url()).thenReturn(mockUrl);

    String result = fileService.generatePresignedUploadUrl(testKey);

    assertThat(result).isNotNull();
    assertThat(result).isEqualTo("https://example-bucket.s3.amazonaws.com/test-file.txt");
  }

  @Test
  @DisplayName("Should generate presigned upload URL with custom duration")
  void shouldGeneratePresignedUploadUrlWithCustomDuration() {
    Duration customDuration = Duration.ofMinutes(10);
    when(s3Presigner.presignPutObject(any(PutObjectPresignRequest.class)))
        .thenReturn(presignedPutObjectRequest);
    when(presignedPutObjectRequest.url()).thenReturn(mockUrl);

    String result = fileService.generatePresignedUploadUrl(testKey, customDuration);

    assertThat(result).isNotNull();
    assertThat(result).isEqualTo("https://example-bucket.s3.amazonaws.com/test-file.txt");
  }

  @Test
  @DisplayName("Should generate presigned download URL with default duration")
  void shouldGeneratePresignedDownloadUrlWithDefaultDuration() {
    when(s3Presigner.presignGetObject(any(GetObjectPresignRequest.class)))
        .thenReturn(presignedGetObjectRequest);
    when(presignedGetObjectRequest.url()).thenReturn(mockUrl);

    String result = fileService.generatePresignedDownloadUrl(testKey);

    assertThat(result).isNotNull();
    assertThat(result).isEqualTo("https://example-bucket.s3.amazonaws.com/test-file.txt");
  }

  @Test
  @DisplayName("Should generate presigned download URL with custom duration")
  void shouldGeneratePresignedDownloadUrlWithCustomDuration() {
    Duration customDuration = Duration.ofMinutes(15);
    when(s3Presigner.presignGetObject(any(GetObjectPresignRequest.class)))
        .thenReturn(presignedGetObjectRequest);
    when(presignedGetObjectRequest.url()).thenReturn(mockUrl);

    String result = fileService.generatePresignedDownloadUrl(testKey, customDuration);

    assertThat(result).isNotNull();
    assertThat(result).isEqualTo("https://example-bucket.s3.amazonaws.com/test-file.txt");
  }

  @Test
  @DisplayName("Should get public URL for object")
  void shouldGetPublicUrlForObject() {
    String result = fileService.getPublicUrl(testKey);

    assertThat(result).isNotNull();
    assertThat(result).contains(testKey);
  }

  @Test
  @DisplayName("Should delete object from S3")
  void shouldDeleteObjectFromS3() {
    fileService.deleteObject(testKey);
  }

  @Test
  @DisplayName("Should return true when object exists")
  @SuppressWarnings("unchecked")
  void shouldReturnTrueWhenObjectExists() {
    HeadObjectResponse response = mock(HeadObjectResponse.class);
    when(s3Client.headObject(any(java.util.function.Consumer.class))).thenReturn(response);

    boolean result = fileService.exists(testKey);

    assertThat(result).isTrue();
  }

  @Test
  @DisplayName("Should return false when object does not exist")
  @SuppressWarnings("unchecked")
  void shouldReturnFalseWhenObjectDoesNotExist() {
    SdkException exception = mock(SdkException.class);
    when(s3Client.headObject(any(java.util.function.Consumer.class))).thenThrow(exception);

    boolean result = fileService.exists(testKey);

    assertThat(result).isFalse();
  }

  @Test
  @DisplayName("Should handle S3 exception when checking existence")
  @SuppressWarnings("unchecked")
  void shouldHandleS3ExceptionWhenCheckingExistence() {
    SdkException exception = mock(SdkException.class);
    when(s3Client.headObject(any(java.util.function.Consumer.class))).thenThrow(exception);

    boolean result = fileService.exists(testKey);

    assertThat(result).isFalse();
  }
}
