from django import forms


class VideoAnalysisForm(forms.Form):
    service_account_file = forms.FileField(
        label="Google Cloud service account JSON",
        help_text="Upload the service account key that can access Video Intelligence."
    )
    input_gcs_uri = forms.CharField(
        label="Input video GCS URI",
        help_text="Example: gs://bucket/path/video.mp4"
    )
    output_gcs_uri = forms.CharField(
        required=False,
        label="Output JSON GCS URI",
        help_text="Optional: use to override the default JSON output location."
    )
    timeout_seconds = forms.IntegerField(
        required=False,
        min_value=60,
        max_value=3600,
        initial=600,
        label="Timeout (seconds)",
        help_text="How long to wait for the API operation to finish."
    )

