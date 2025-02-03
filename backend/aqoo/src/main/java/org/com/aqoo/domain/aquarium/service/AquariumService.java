package org.com.aqoo.domain.aquarium.service;

import lombok.RequiredArgsConstructor;
import org.com.aqoo.domain.aquarium.dto.AquariumResponseDto;
import org.com.aqoo.domain.aquarium.entity.Aquarium;
import org.com.aqoo.domain.aquarium.repository.AquariumRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AquariumService {

    private final AquariumRepository aquariumRepository;

    public List<AquariumResponseDto> getAquariumsByUserId(String userId) {
        List<Aquarium> aquariums = aquariumRepository.findByUserId(userId);

        return aquariums.stream().map(aquarium -> {
            return new AquariumResponseDto(
                aquarium.getId(),
                aquarium.getAquariumName(),
                aquarium.getLastFedTime(),
                aquarium.getLastWaterChangeTime(),
                calculateWaterCondition(aquarium),
                aquarium.getLastCleanedTime(),
                calculatePollutionStatus(aquarium)
            );
        }).collect(Collectors.toList());
    }

    private int calculateWaterCondition(Aquarium aquarium) {
        // 물 상태를 계산하는 로직 (예제)
        return (int) (Math.random() * 5) + 1; // 1~5 랜덤 값
    }

    private int calculatePollutionStatus(Aquarium aquarium) {
        // 오염 상태를 계산하는 로직 (예제)
        return (int) (Math.random() * 5) + 1; // 1~5 랜덤 값
    }
}
