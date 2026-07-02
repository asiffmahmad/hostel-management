# Hostel Management System

## Overview
A comprehensive management system for tracking hostels, rooms, beds, students, and rent collections.

## Render Keep-Alive Automation
Since this application is deployed on Render's Free Tier, instances are spun down after 15 minutes of inactivity. To prevent the 50+ second cold start delay, this repository includes an automated GitHub Actions workflow to keep the backend alive.

### How it works
1. We exposed a lightweight, unauthenticated health endpoint at `/api/health`.
2. A GitHub Action (`.github/workflows/render-keepalive.yml`) runs on a `cron` schedule every 5 minutes.
3. It makes an HTTP GET request to the health endpoint. If it receives an HTTP 200 OK, the instance stays awake.
4. If it fails, it retries up to 3 times before failing the workflow.

### Configuration
You must configure the URL of your Render backend in your GitHub Repository Secrets so the Action knows what to ping.

1. Go to your GitHub repository -> **Settings** -> **Secrets and variables** -> **Actions**.
2. Click **New repository secret**.
3. **Name**: `RENDER_HEALTH_URL`
4. **Secret**: `https://hostel-management-9v50.onrender.com/api/health`
5. Click **Add secret**.

### Manual Trigger
If you need to manually wake up the instance (e.g., after pausing the service):
1. Go to the **Actions** tab in this repository.
2. Select **Render Keep Alive** from the left sidebar.
3. Click the **Run workflow** dropdown on the right and click **Run workflow**.
