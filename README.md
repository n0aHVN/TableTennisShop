# Table Tennis Shop

## How to run this project
```
cd auth
npm install
```

## Access:
`http://localhost/...`


# Port-forwarding on HTTPS
On Windows, port 443 can be restricted. So if it is not working, `kubectl port-forward -n ingress-nginx svc/ingress-nginx-controller 8443:443`

# Database Port-forwarding 
`kubectl port-forward svc/mongo-service 27018:27017`
