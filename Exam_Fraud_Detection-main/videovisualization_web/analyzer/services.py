import json
import time
from pathlib import Path
from typing import Optional, Tuple

from google.cloud import storage, videointelligence
from google.oauth2 import service_account

DEFAULT_FEATURES = [
    videointelligence.Feature.OBJECT_TRACKING,
    videointelligence.Feature.LABEL_DETECTION,
    videointelligence.Feature.SHOT_CHANGE_DETECTION,
    videointelligence.Feature.SPEECH_TRANSCRIPTION,
    videointelligence.Feature.LOGO_RECOGNITION,
    videointelligence.Feature.EXPLICIT_CONTENT_DETECTION,
    videointelligence.Feature.TEXT_DETECTION,
    videointelligence.Feature.FACE_DETECTION,
    videointelligence.Feature.PERSON_DETECTION,
]


def _build_video_context() -> videointelligence.VideoContext:
    """Mirror the configuration used in the notebook script."""
    transcript_config = videointelligence.SpeechTranscriptionConfig(
        language_code="en-US",
        enable_automatic_punctuation=True,
    )
    person_config = videointelligence.PersonDetectionConfig(
        include_bounding_boxes=True,
        include_attributes=False,
        include_pose_landmarks=True,
    )
    face_config = videointelligence.FaceDetectionConfig(
        include_bounding_boxes=True,
        include_attributes=True,
    )
    return videointelligence.VideoContext(
        speech_transcription_config=transcript_config,
        person_detection_config=person_config,
        face_detection_config=face_config,
    )


def _default_output_uri(input_gcs_uri: str) -> str:
    base = input_gcs_uri.rstrip("/")
    if "/" in base:
        bucket_prefix = base.rsplit("/", 1)[0]
    else:
        bucket_prefix = base
    timestamp = int(time.time())
    return f"{bucket_prefix}/analysis-output-{timestamp}.json"


def _parse_gcs_uri(uri: str) -> Tuple[str, str]:
    if not uri.startswith("gs://"):
        raise ValueError("GCS URI must start with gs://")
    path = uri[5:]
    if "/" not in path:
        raise ValueError("GCS URI must include an object path")
    bucket, blob = path.split("/", 1)
    return bucket, blob


def _read_json_from_gcs(credentials, output_uri: str, retries: int = 5, delay: float = 1.0) -> dict:
    bucket_name, object_path = _parse_gcs_uri(output_uri)
    storage_client = storage.Client(credentials=credentials)
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(object_path)
    last_error = None
    for _ in range(retries):
        try:
            content = blob.download_as_text()
            return json.loads(content)
        except Exception as exc:  # pylint: disable=broad-except
            last_error = exc
            time.sleep(delay)
    raise RuntimeError(
        f"Unable to download analysis output {output_uri}: {last_error}"
    )


def annotate_video(
    *,
    service_account_path: Path,
    input_gcs_uri: str,
    output_gcs_uri: Optional[str] = None,
    timeout: int = 600,
) -> dict:
    credentials = service_account.Credentials.from_service_account_file(
        str(service_account_path)
    )
    client = videointelligence.VideoIntelligenceServiceClient(credentials=credentials)
    requested_output = output_gcs_uri.strip() if output_gcs_uri else ""
    final_output_uri = requested_output or _default_output_uri(input_gcs_uri.strip())

    operation = client.annotate_video(
        request={
            "features": DEFAULT_FEATURES,
            "input_uri": input_gcs_uri.strip(),
            "output_uri": final_output_uri,
            "video_context": _build_video_context(),
        }
    )

    operation.result(timeout=timeout)
    # The API only writes annotation results to GCS when output_uri is set,
    # so read them back before returning to the caller.
    result_payload = _read_json_from_gcs(credentials, final_output_uri)
    return {
        "operation_name": operation.operation.name,
        "output_uri": final_output_uri,
        "result": result_payload,
    }

