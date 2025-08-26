@echo off
echo Loading environment variables...
for /f "tokens=*" %%a in (.env) do (
    set %%a
)
echo Starting Heritage Guard Backend...
mvn spring-boot:run 