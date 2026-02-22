package csd.t6.backend.contributor;

import csd.t6.backend.exceptions.BadRequestException;
import csd.t6.jooq.public_.tables.records.PendingContributorsRecord;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;

import static csd.t6.jooq.public_.tables.PendingContributors.PENDING_CONTRIBUTORS;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ContributorServiceTest {

    @Mock
    private PendingContributorRepository pendingContributorRepository;

    @InjectMocks
    private ContributorService contributorService;

    @Test
    @DisplayName("Should insert pending contributor successfully")
    void shouldInsertPendingContributor() {
        UUID learnerId = UUID.randomUUID();
        when(pendingContributorRepository.exists(PENDING_CONTRIBUTORS.LEARNER_ID, learnerId)).thenReturn(false);
        when(pendingContributorRepository.insertPendingContributor(learnerId))
            .thenReturn(mock(PendingContributorsRecord.class));

        assertThatNoException().isThrownBy(() ->
            contributorService.insertPendingContributor(learnerId));

        verify(pendingContributorRepository).insertPendingContributor(learnerId);
    }

    @Test
    @DisplayName("Should throw when user is already pending")
    void shouldThrowWhenAlreadyPending() {
        UUID learnerId = UUID.randomUUID();
        when(pendingContributorRepository.exists(PENDING_CONTRIBUTORS.LEARNER_ID, learnerId)).thenReturn(true);

        assertThatThrownBy(() -> contributorService.insertPendingContributor(learnerId))
            .isInstanceOf(BadRequestException.class)
            .hasMessageContaining("pending approval");

        verify(pendingContributorRepository, never()).insertPendingContributor(any());
    }
}