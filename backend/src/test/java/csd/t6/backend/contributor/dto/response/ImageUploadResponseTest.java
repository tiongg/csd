package csd.t6.backend.contributor.dto.response;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class ImageUploadResponseTest {

    @Test
    @DisplayName("Should create valid image upload response")
    void shouldCreateValidImageUploadResponse() {
        ImageUploadResponse response = new ImageUploadResponse("https://upload-url.com", "test-key.png",
                "https://public-url.com/test-key.png");

        assertThat(response.url()).isEqualTo("https://upload-url.com");
        assertThat(response.key()).isEqualTo("test-key.png");
        assertThat(response.publicUrl()).isEqualTo("https://public-url.com/test-key.png");
    }

    @Test
    @DisplayName("Should handle S3-style URLs")
    void shouldHandleS3StyleUrls() {
        ImageUploadResponse response = new ImageUploadResponse(
                "https://bucket.s3.amazonaws.com/test.png", "editor/course-123/image.png",
                "https://bucket.s3.amazonaws.com/editor/course-123/image.png");

        assertThat(response.url()).contains("s3.amazonaws.com");
        assertThat(response.key()).startsWith("editor/");
        assertThat(response.publicUrl()).contains("s3.amazonaws.com");
    }

    @Test
    @DisplayName("Should handle cloudfront-style URLs")
    void shouldHandleCloudfrontStyleUrls() {
        ImageUploadResponse response = new ImageUploadResponse(
                "https://cdn.example.com/upload-url", "images/test.jpg",
                "https://cdn.example.com/images/test.jpg");

        assertThat(response.url()).contains("cdn.example.com");
        assertThat(response.publicUrl()).contains("cdn.example.com");
    }

    @Test
    @DisplayName("Should handle different file extensions")
    void shouldHandleDifferentFileExtensions() {
        ImageUploadResponse pngResponse = new ImageUploadResponse("url1", "test.png", "public1");
        ImageUploadResponse jpgResponse = new ImageUploadResponse("url2", "test.jpg", "public2");
        ImageUploadResponse jpegResponse = new ImageUploadResponse("url3", "test.jpeg", "public3");

        assertThat(pngResponse.key()).endsWith(".png");
        assertThat(jpgResponse.key()).endsWith(".jpg");
        assertThat(jpegResponse.key()).endsWith(".jpeg");
    }

    @Test
    @DisplayName("Should handle UUID-based keys")
    void shouldHandleUuidBasedKeys() {
        String uuidKey = "editor/550e8400-e29b-41d4-a716-446655440000/image.png";
        ImageUploadResponse response = new ImageUploadResponse("url", uuidKey, "public");

        assertThat(response.key()).contains("550e8400-e29b-41d4-a716-446655440000");
        assertThat(response.key()).startsWith("editor/");
    }

    @Test
    @DisplayName("Should handle nested directory structure")
    void shouldHandleNestedDirectoryStructure() {
        String nestedKey = "editor/course-123/lesson-456/thumbnail.png";
        ImageUploadResponse response = new ImageUploadResponse("url", nestedKey, "public");

        assertThat(response.key()).contains("editor/");
        assertThat(response.key()).contains("course-123/");
        assertThat(response.key()).contains("lesson-456/");
    }

    @Test
    @DisplayName("Should handle URL with query parameters")
    void shouldHandleUrlWithQueryParameters() {
        ImageUploadResponse response = new ImageUploadResponse(
                "https://example.com/upload?X-Amz-Security-Token=token&expires=123456", "key.png", "public");

        assertThat(response.url()).contains("?");
        assertThat(response.url()).contains("X-Amz-Security-Token");
        assertThat(response.key()).isEqualTo("key.png");
    }

    @Test
    @DisplayName("Should handle special characters in URLs")
    void shouldHandleSpecialCharactersInUrls() {
        ImageUploadResponse response = new ImageUploadResponse(
                "https://example.com/upload?signature=abc123&expires=789", "test-image_v2.png",
                "https://example.com/test-image_v2.png");

        assertThat(response.url()).contains("signature=");
        assertThat(response.key()).contains("-");
        assertThat(response.publicUrl()).contains("-");
    }

    @Test
    @DisplayName("Should handle long URLs")
    void shouldHandleLongUrls() {
        String longUrl = "https://example-bucket.s3.amazonaws.com/uploads/editor/very-long-course-name-id-12345/lesson-id-67890/image-thumbnail.png";
        ImageUploadResponse response = new ImageUploadResponse(longUrl, "long-key.png", longUrl);

        assertThat(response.url().length()).isGreaterThan(100);
        assertThat(response.publicUrl().length()).isGreaterThan(100);
    }

    @Test
    @DisplayName("Should handle same URL and public URL for local development")
    void shouldHandleSameUrlAndPublicUrlForLocalDevelopment() {
        ImageUploadResponse response = new ImageUploadResponse("http://localhost:9000/upload", "test.png",
                "http://localhost:9000/upload");

        assertThat(response.url()).isEqualTo(response.publicUrl());
        assertThat(response.url()).startsWith("http://localhost:");
    }
}
