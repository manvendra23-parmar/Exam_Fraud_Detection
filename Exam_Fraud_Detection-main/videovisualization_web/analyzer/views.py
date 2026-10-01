import json
import tempfile
from pathlib import Path

from django.conf import settings
from django.shortcuts import render

from .forms import VideoAnalysisForm
from .services import annotate_video


def dashboard(request):
    result_json = None
    metadata = {}
    form = VideoAnalysisForm(request.POST or None, request.FILES or None)

    if request.method == "POST" and form.is_valid():
        upload = form.cleaned_data["service_account_file"]
        input_gcs_uri = form.cleaned_data["input_gcs_uri"]
        output_gcs_uri = form.cleaned_data.get("output_gcs_uri")
        timeout_seconds = form.cleaned_data.get("timeout_seconds") or 600

        temp_dir = Path(settings.MEDIA_ROOT) / "service_accounts"
        temp_dir.mkdir(parents=True, exist_ok=True)

        with tempfile.NamedTemporaryFile(
            dir=temp_dir, suffix=".json", delete=False
        ) as temp_file:
            for chunk in upload.chunks():
                temp_file.write(chunk)
            temp_path = Path(temp_file.name)

        try:
            analysis = annotate_video(
                service_account_path=temp_path,
                input_gcs_uri=input_gcs_uri,
                output_gcs_uri=output_gcs_uri,
                timeout=int(timeout_seconds),
            )
            result_json = json.dumps(analysis["result"], indent=2)
            metadata = {
                "operation_name": analysis["operation_name"],
                "output_uri": analysis["output_uri"],
            }
        except Exception as exc:  # pylint: disable=broad-except
            form.add_error(
                None, f"Video Intelligence request failed: {exc}"
            )
        finally:
            temp_path.unlink(missing_ok=True)

    return render(
        request,
        "analyzer/dashboard.html",
        {
            "form": form,
            "result_json": result_json,
            "metadata": metadata,
        },
    )
