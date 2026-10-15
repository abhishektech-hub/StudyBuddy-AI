# StudyBuddy AI — Java Web Chatbot

A responsive, category-based web chatbot project made with **Java 17 + Spring Boot + HTML/CSS/JavaScript**. It is suitable as a starting point for a web-based Java programming project.

## Features
- Six separate categories: Study, Health, Fitness, Fashion, History, and Coding
- Chat interface with suggested prompts and a responsive layout
- Recent conversations stored in the browser's local storage
- Dark/light theme toggle
- Spring Boot Java backend at `/api/chat`
- Demo replies work without an API key; AI-generated replies are enabled by setting `OPENAI_API_KEY`
- Health-oriented system guidance asks the assistant to provide general education, not a diagnosis

## Requirements
- Java 17 or later
- Maven 3.8+ (or use the Maven wrapper from your IDE)
- Internet connection and an API key for AI-generated replies

## Run locally
1. Extract the ZIP.
2. Open a terminal in the project folder.
3. Run:

   ```bash
   mvn spring-boot:run
   ```

4. Open `http://localhost:8080`.

## Enable AI answers
Set the API key as an environment variable. **Do not put your API key in `app.js`, HTML, or a public repository.**

macOS/Linux:
```bash
export OPENAI_API_KEY="your_api_key_here"
export OPENAI_MODEL="gpt-4o-mini"
mvn spring-boot:run
```

Windows PowerShell:
```powershell
$env:OPENAI_API_KEY="your_api_key_here"
$env:OPENAI_MODEL="gpt-4o-mini"
mvn spring-boot:run
```

If no key is set, the site still opens and uses demo responses that explain how to enable AI mode. The project uses the OpenAI Chat Completions API from the Java backend. API use may incur charges according to the provider's pricing.

## Project structure
```text
StudyBuddyAI/
├── pom.xml
├── README.md
└── src/
    └── main/
        ├── java/com/studybuddy/chatbot/
        │   ├── StudyBuddyApplication.java
        │   └── ChatController.java
        └── resources/static/
            ├── index.html
            ├── styles.css
            └── app.js
```

## Notes for your project review
The supplied project guidelines say teams should have 3–4 members and self-proposed topics require faculty approval before portal submission. They describe Review 1 as 33 marks and Review 2 as 17 marks, with the listed deadlines of 10 October 2026 and 15 November 2026. The rubric section for web-based projects is present but not filled in the supplied PDF, so confirm detailed criteria with your faculty mentor.

## Limitations
- This is a project starter, not a deployed public website. To share it online, deploy the Spring Boot app to a Java-capable hosting provider and configure `OPENAI_API_KEY` as a secret environment variable.
- Browser history is local to the current browser/device. It is not a user-account database.
- Demo mode is not a real AI model. Add a valid key to get generated answers.
