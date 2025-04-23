import subprocess
import os

def run_command_in_new_cmd(title, commands):
    # Join commands with && to run them sequentially
    joined_commands = ' && '.join(commands)
    
    # Create the full command to run in a new cmd window with a custom title
    command = f'start "{title}" cmd /k "{joined_commands}"'
    
    # Execute using subprocess
    subprocess.run(command, shell=True)

if __name__ == "__main__":
    # Docker setup
    run_command_in_new_cmd("Docker Setup", [
        "docker-compose build",
        "docker-compose up"
    ])

    # Scraper setup
    run_command_in_new_cmd("Scraper Setup", [
        "cd scraper",
        "npm install",
        "npm start"
    ])

    # Frontend setup
    run_command_in_new_cmd("Frontend Setup", [
        "cd frontend",
        "npm install",
        "npm run dev"
    ])
