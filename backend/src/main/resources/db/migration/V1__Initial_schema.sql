CREATE TABLE scans (
    id UUID PRIMARY KEY,
    scan_date TIMESTAMP NOT NULL,
    repository_url VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL
);

CREATE TABLE vulnerabilities (
    id BIGSERIAL PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    line_number INT,
    description TEXT NOT NULL,
    severity VARCHAR(50) NOT NULL,
    suggested_fix TEXT,
    scan_id UUID NOT NULL,
    CONSTRAINT fk_scan
        FOREIGN KEY(scan_id)
        REFERENCES scans(id)
);
