import http.server
import ssl

port = 8443  # You can change the port if needed
server_address = ('', port)
handler = http.server.SimpleHTTPRequestHandler

httpd = http.server.HTTPServer(server_address, handler)

# Wrap the socket with SSL
context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
context.load_cert_chain(certfile="server/cert.pem", keyfile="server/key.pem")
httpd.socket = context.wrap_socket(httpd.socket, server_side=True)

print(f"Serving on https://localhost:{port}")
httpd.serve_forever()