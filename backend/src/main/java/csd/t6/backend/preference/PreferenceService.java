package csd.t6.backend.preference;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

@Service
public class PreferenceService {
  private final PreferenceRepository preferenceRepository;

  public PreferenceService(PreferenceRepository preferenceRepository) {
    this.preferenceRepository = preferenceRepository;
  }

  public List<String> getTopics(UUID accountId) {
    return preferenceRepository.findTopics(accountId);
  }

}
