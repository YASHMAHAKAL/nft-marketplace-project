# Use a single-stage, clean Python image
FROM python:3.10-slim

# Set the working directory
WORKDIR /app

# Copy the requirements file
COPY requirements.txt .

# Install dependencies directly into the system's site-packages
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application source code
COPY . .

# Expose the port
EXPOSE 5000

# Command to run the application
CMD ["flask", "run", "--host=0.0.0.0"]