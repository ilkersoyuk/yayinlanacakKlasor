"""Python 3: python serve.py; open http://localhost:8000"""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlsplit
ROOT = Path(__file__).resolve().parent
BASE = '/yayinlanacakKlasor/'
ROUTES = {'eslestirme','match','gorevler','missions','kartlar','cards','sozluk','dictionary','test','quiz','yedek','backup'}
class Handler(SimpleHTTPRequestHandler):
    extensions_map = {**SimpleHTTPRequestHandler.extensions_map, '.wasm': 'application/wasm', '.js':'text/javascript'}
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)
    def do_GET(self):
        path = urlsplit(self.path).path
        if path in ('/', '/index.html', '/yayinlanacakKlasor'):
            self.send_response(302)
            self.send_header('Location', BASE)
            self.end_headers()
            return
        if path.startswith(BASE):
            self.path = '/' + self.path[len(BASE):]
        path = urlsplit(self.path).path.strip('/')
        if path in ROUTES:
            self.path = '/index.html'
        super().do_GET()
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()
if __name__ == '__main__':
    print('Tarayicida acin: http://localhost:8000/yayinlanacakKlasor/ (Kapatmak: Ctrl+C)')
    ThreadingHTTPServer(('127.0.0.1', 8000), Handler).serve_forever()
