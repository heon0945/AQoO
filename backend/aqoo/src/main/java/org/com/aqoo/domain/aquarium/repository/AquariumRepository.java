package org.com.aqoo.domain.aquarium.repository;

import org.com.aqoo.domain.aquarium.entity.Aquarium;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AquariumRepository extends JpaRepository<Aquarium, Integer> {
    List<Aquarium> findByUserId(String userId);
}
