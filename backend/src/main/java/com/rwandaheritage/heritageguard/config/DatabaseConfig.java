package com.rwandaheritage.heritageguard.config;

import com.zaxxer.hikari.HikariDataSource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

/**
 * Database Configuration
 * 
 * Configures advanced database settings including:
 * - Connection pooling with HikariCP
 * - Performance monitoring
 * - Connection health checks
 * - Query optimization
 */
@Configuration
@EnableTransactionManagement
@Slf4j
public class DatabaseConfig {

    @Value("${spring.datasource.url}")
    private String databaseUrl;

    @Value("${spring.datasource.username}")
    private String username;

    @Value("${spring.datasource.password}")
    private String password;

    @Value("${spring.datasource.hikari.maximum-pool-size:20}")
    private int maxPoolSize;

    @Value("${spring.datasource.hikari.minimum-idle:5}")
    private int minIdle;

    @Value("${spring.datasource.hikari.connection-timeout:20000}")
    private long connectionTimeout;

    @Value("${spring.datasource.hikari.idle-timeout:300000}")
    private long idleTimeout;

    @Value("${spring.datasource.hikari.max-lifetime:1200000}")
    private long maxLifetime;

    @Bean
    @Primary
    public DataSource dataSource() {
        HikariDataSource dataSource = new HikariDataSource();
        
        // Basic configuration
        dataSource.setJdbcUrl(databaseUrl);
        dataSource.setUsername(username);
        dataSource.setPassword(password);
        
        // Connection pooling configuration
        dataSource.setMaximumPoolSize(maxPoolSize);
        dataSource.setMinimumIdle(minIdle);
        dataSource.setConnectionTimeout(connectionTimeout);
        dataSource.setIdleTimeout(idleTimeout);
        dataSource.setMaxLifetime(maxLifetime);
        
        // Performance tuning
        dataSource.setLeakDetectionThreshold(60000);
        dataSource.setConnectionTestQuery("SELECT 1");
        dataSource.setValidationTimeout(5000);
        
        // Connection pool monitoring
        dataSource.setPoolName("HeritageGuardHikariCP");
        dataSource.setRegisterMbeans(true);
        
        // Log connection pool statistics
        log.info("Database connection pool configured: maxSize={}, minIdle={}, timeout={}ms", 
                maxPoolSize, minIdle, connectionTimeout);
        
        return dataSource;
    }

    /**
     * Health check for database connectivity
     */
    @Bean
    public DatabaseHealthIndicator databaseHealthIndicator(DataSource dataSource) {
        return new DatabaseHealthIndicator(dataSource);
    }

    /**
     * Database Health Indicator
     * Provides health check information for monitoring
     */
    public static class DatabaseHealthIndicator {
        
        private final DataSource dataSource;
        
        public DatabaseHealthIndicator(DataSource dataSource) {
            this.dataSource = dataSource;
        }
        
        public boolean isHealthy() {
            try (Connection connection = dataSource.getConnection()) {
                return connection.isValid(5);
            } catch (SQLException e) {
                log.error("Database health check failed", e);
                return false;
            }
        }
        
        public String getStatus() {
            return isHealthy() ? "UP" : "DOWN";
        }
        
        public String getDetails() {
            if (dataSource instanceof HikariDataSource) {
                HikariDataSource hikariDS = (HikariDataSource) dataSource;
                return String.format("Pool: %s, Active: %d, Idle: %d, Total: %d",
                        hikariDS.getPoolName(),
                        hikariDS.getHikariPoolMXBean().getActiveConnections(),
                        hikariDS.getHikariPoolMXBean().getIdleConnections(),
                        hikariDS.getHikariPoolMXBean().getTotalConnections());
            }
            return "DataSource type: " + dataSource.getClass().getSimpleName();
        }
    }
}

