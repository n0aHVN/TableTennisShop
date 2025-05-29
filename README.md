# Port-forwarding on HTTPS
On Windows, port 443 can be restricted. So if it is not working, `kubectl port-forward -n ingress-nginx svc/ingress-nginx-controller 8443:443`