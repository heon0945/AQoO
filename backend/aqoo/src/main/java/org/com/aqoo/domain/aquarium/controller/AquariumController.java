package org.com.aqoo.domain.aquarium.controller;

import lombok.RequiredArgsConstructor;
import org.com.aqoo.domain.aquarium.dto.AquariumCreateRequestDto;
import org.com.aqoo.domain.aquarium.dto.AquariumResponseDto;
import org.com.aqoo.domain.aquarium.entity.Aquarium;
import org.com.aqoo.domain.aquarium.service.AquariumService;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/aquariums")
@RequiredArgsConstructor
public class AquariumController {

    private final AquariumService aquariumService;

    @GetMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> getUserAquariums(@PathVariable("userId") String userId) {
        List<AquariumResponseDto> aquariums = aquariumService.getAquariumsByUserId(userId);

        Map<String, Object> response = new HashMap<>();
        response.put("aquariums", aquariums);
        response.put("count", aquariums.size());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/create")
    public ResponseEntity<Aquarium> createAquarium(@Validated @RequestBody AquariumCreateRequestDto requestDto) {
        Aquarium createdAquarium = aquariumService.createAquarium(requestDto);
        return ResponseEntity.ok(createdAquarium);
    }
}
