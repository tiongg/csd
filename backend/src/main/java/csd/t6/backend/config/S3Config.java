package csd.t6.backend.config;

import java.net.URI;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

@Configuration
public class S3Config {
  @Value("${spring.cloud.config.server.awss3.endpoint}")
  private String endpoint;

  @Value("${spring.cloud.config.server.awss3.access-key}")
  private String accessKey;

  @Value("${spring.cloud.config.server.awss3.secret-key}")
  private String secretKey;

  @Value("${spring.cloud.config.server.awss3.region}")
  private String region;

  @Bean
  S3Client s3Client() {
    AwsBasicCredentials credentials = AwsBasicCredentials.create(accessKey, secretKey);
    Region awsRegion = Region.of(region);

    return S3Client.builder().endpointOverride(URI.create(endpoint))
        .credentialsProvider(StaticCredentialsProvider.create(credentials)).region(awsRegion)
        .serviceConfiguration(S3Configuration.builder().pathStyleAccessEnabled(true).build()).build();
  }

  @Bean
  S3Presigner s3Presigner() {
    AwsBasicCredentials credentials = AwsBasicCredentials.create(accessKey, secretKey);
    Region awsRegion = Region.of(region);

    return S3Presigner.builder().endpointOverride(URI.create(endpoint))
        .credentialsProvider(StaticCredentialsProvider.create(credentials)).region(awsRegion)
        .serviceConfiguration(S3Configuration.builder().pathStyleAccessEnabled(true).build()).build();
  }
}
