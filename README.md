# Patent Analyzer

## Description

The Patent Analyzer is a tool designed to analyze patent infringement based on technical similarities and specific claim elements. It leverages AI technology to provide an objective and thorough analysis of potential infringement between patents and products.

## Prerequisites

Before you begin, ensure you have met the following requirements:

- [Node.js](https://nodejs.org/) installed (version 18)
- [Docker](https://www.docker.com/) installed

## Running the Application

### Using Docker

To run the application with Docker, follow these steps:

0. **Configure environment variables**
   Replace the value of the `OPENAI_API_KEY` environment variable in the`.env` file in the root directory with your real OpenAI API key.

1. **Build the Docker image**

   ```bash
   docker build -t patent-analyzer .
   ```

2. **Run the Docker container**
   ```bash
   docker run --name patent-analyzer-container -p 3000:3000 patent-analyzer
   ```

## Testing

To run the tests, use the following command:

```bash
npm test
```
