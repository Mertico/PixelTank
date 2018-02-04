# PixelTank
Pet-project.

## Docs

[Пояснительня записка][1]

[1]: https://docs.google.com/document/d/1uzHMWpqd1MHxMHRABPfHjbV0-8PezXRKPvwEwFB1-_A

## Directory
```
.
├── bots
│   └── server.js (Launcher bots)
├── client
│   ├── css
│   ├── images
│   ├── js
│   └── index.html
└── server 
    ├── modules (Bullet, physics etc)
    ├── config.js
    ├── core.js
    └── server.js (Launcher server)
```

## Install
Installing dependencies
```
npm install gulp -g
npm install && cd server && npm install && cd .. && cd bots && npm install && gulp watch
```
## Launch
```
gulp watch
```
