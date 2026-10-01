#!/usr/bin/env python
import os
import sys

if __name__ == '__main__':
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'video_portal.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError:
        print("Error: Django is not installed. Please install it or activate your virtual environment.")
        sys.exit(1)
    execute_from_command_line(sys.argv)
