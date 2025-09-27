package com.example.auth.repository;

import com.example.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
    
    Optional<User> findByName(String name);
    
    boolean existsByEmail(String email);
    
    boolean existsByName(String name);
    
    List<User> findByIsActiveTrue();
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.isActive = true")
    long countActiveUsers();
    
    @Query("SELECT u FROM User u WHERE u.isActive = true ORDER BY u.createdAt DESC")
    List<User> findAllActiveUsersOrderByCreatedAtDesc();
}
