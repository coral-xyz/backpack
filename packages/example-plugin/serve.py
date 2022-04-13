import http.server
import ssl

httpd = http.server.HTTPServer(('localhost', 4444), http.server.SimpleHTTPRequestHandler)
httpd.socket = ssl.wrap_socket (httpd.socket, certfile='./cert/key.pem', server_side=True)
httpd.serve_forever()
