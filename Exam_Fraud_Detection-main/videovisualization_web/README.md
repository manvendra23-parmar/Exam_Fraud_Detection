# Video Intelligence Dashboard

This Django project provides a small UI that mirrors the behaviour of
`videovisualization/run_video_intelligence.py` without modifying the original
script. It lets you:

- Upload a Google Cloud service account key (JSON)
- Provide the GCS URI of a video to analyze
- Optionally set the output JSON destination
- Trigger the Video Intelligence API and inspect the JSON response (downloaded
  back from Cloud Storage) directly in the browser

## Getting started

```bash
cd videovisualization_web
python -m venv .venv
.venv\Scripts\activate  # on Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Then open http://127.0.0.1:8000/ and submit the form.

## Notes

- The form uses the same feature set and context configuration as the original
  script.
- If you leave the output JSON field blank, an object named
  `analysis-output-<timestamp>.json` is created in the same folder as the video.
- Service accounts must have permissions for both Video Intelligence **and**
  Cloud Storage (read/write on the bucket that stores your video/output).
- Uploaded service account files are stored temporarily under
  `uploaded_assets/service_accounts` and removed once the request completes.

