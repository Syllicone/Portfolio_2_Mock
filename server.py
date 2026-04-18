#!/usr/bin/env python3
import http.server
import socketserver
import os
from urllib.parse import urlparse, unquote

PORT = 8000

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Parse the URL path
        parsed_path = urlparse(unquote(self.path))
        path = parsed_path.path
        
        # Remove query string for file lookup
        if '?' in path:
            path = path.split('?')[0]
        
        # Handle root
        if path == '/' or path == '':
            self.path = '/index.html'
        # If path doesn't have an extension, try adding .html
        elif not '.' in os.path.basename(path):
            # Check if .html version exists
            html_path = path + '.html'
            if os.path.exists(os.getcwd() + html_path):
                self.path = html_path
        
        # Call the parent class method to serve the file
        super().do_GET()
    
    def end_headers(self):
        # Add headers to prevent caching of HTML files
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        super().end_headers()

if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(('', PORT), CustomHTTPRequestHandler) as httpd:
        print(f'Server running at http://localhost:{PORT}/')
        print('Press Ctrl+C to stop')
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print('\nServer stopped')
