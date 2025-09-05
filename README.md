# Vulnerability Scanner Web Application

This project is a web-based platform for scanning Bitbucket-hosted repositories for vulnerabilities. The application leverages OpenAI/ChatGPT to analyze source code and detect potential security risks.

## Features

-   Connects to Bitbucket to clone public repositories.
-   Analyzes source code files (`.java`, `pom.xml`, etc.) using OpenAI's GPT models.
-   Identifies potential vulnerabilities like OWASP Top 10 risks and dependency issues.
-   Stores scan results in a PostgreSQL database.
-   Provides a REST API to trigger scans and retrieve results.
-   A React-based frontend to view scan history and vulnerability details.
-   Entire application is containerized and orchestrated with Docker Compose.

## Tech Stack

-   **Backend:** Java 17, Spring Boot 3
-   **Frontend:** React
-   **Database:** PostgreSQL
-   **Build Tool:** Maven
-   **Containerization:** Docker, Docker Compose
-   **Code Analysis:** OpenAI GPT-3.5-Turbo
-   **API Documentation:** SpringDoc OpenAPI (Swagger)

## Prerequisites

Before you begin, ensure you have the following installed:
-   [Docker](https://www.docker.com/get-started)
-   [Docker Compose](https://docs.docker.com/compose/install/) (usually included with Docker Desktop)

## Configuration

The application requires environment variables for connecting to external services. The recommended way to provide them is by creating a `.env` file in the root of the project.

1.  Create a file named `.env` in the project root.
2.  Add the following variables to the file, replacing the placeholder values with your actual credentials:

    ```env
    # Bitbucket App Password (if needed for private repositories)
    # The current implementation only supports public repos, but this is here for future use.
    BITBUCKET_APP_PASSWORD=your_bitbucket_app_password

    # OpenAI API Key
    OPENAI_API_KEY=your_openai_api_key
    ```

    **Note:** The `OPENAI_API_KEY` is required for the scanner to work.

## Running the Application

1.  **Clone the repository:**
    ```sh
    git clone <repository_url>
    cd <repository_directory>
    ```

2.  **Start the application:**
    Run the following command from the project root:
    ```sh
    docker-compose up --build -d
    ```
    This will build the Docker images for the backend and frontend services and start all containers in detached mode.

## Accessing the Application

Once the containers are running, you can access the different parts of the application:

-   **Frontend UI:**
    -   URL: `http://localhost:3000`
    -   This is the main web interface for the vulnerability scanner.

-   **Backend API:**
    -   Base URL: `http://localhost:8080`
    -   The API is proxied through the frontend's Nginx server at `http://localhost:3000/api`.

-   **API Documentation (Swagger UI):**
    -   URL: `http://localhost:8080/swagger-ui.html`
    -   Provides interactive documentation for the backend REST API.

-   **Database:**
    -   The PostgreSQL database runs on port 5432 but is only exposed to the internal Docker network for security.
