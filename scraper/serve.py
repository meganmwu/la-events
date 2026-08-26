#!/usr/bin/env python3
"""Serve the web/ folder locally: python3 scraper/serve.py [port]"""

import os
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

WEB = Path(__file__).resolve().parent.parent / "web"
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 4173


class NoCacheHandler(SimpleHTTPRequestHandler):
    """Always serve fresh files — editing CSS/JS and reloading should just work."""

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        super().end_headers()


os.chdir(WEB)

server = ThreadingHTTPServer(("127.0.0.1", PORT), NoCacheHandler)
print(f"Serving {WEB} at http://localhost:{PORT}")
server.serve_forever()
