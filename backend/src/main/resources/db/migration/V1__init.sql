CREATE TABLE IF NOT EXISTS app_info (
    id SERIAL PRIMARY KEY,
    version VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO app_info (version) VALUES ('1.0.0');
