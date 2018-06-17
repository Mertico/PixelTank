# PixelTank

Танчики – игра между множеством противников на квадратном поле 5500 x 5500 (не включая границы).

Игрок может управлять одним из танков на поле. При этом он противостоит всем остальным игрокам, управляющим танками-противниками.

Основная задача игрока – уничтожить все танки противников и набрать максимальное количество очков.

У каждого игрока есть ограниченное количество здоровья (брони танка). Стреляя в своих противников, игрок сокращает количество их здоровья, как только здоровье полностью кончается, танк игрока считается уничтоженным.

В случае, если танк игрока будет уничтожен, он может начать игру заново, при этом, его количество очков будет прежним.

Игра ведет статистику по количеству уничтоженных игроком танков и по количеству полной потери здоровья.

В самом начале игры, игроки могут выбирать себе любой танк из трех возможных вариантов:

* Легкий танк (самый быстрый танк с самой слабой прочностью, скорострельность);

* Средний танк (универсальный танк, средняя скорость, прочность ниже, чем у мощного танка, но выше, чем у легкого танка);

* Тяжелый танк (самый медленный танк с самой мощной прочностью, большой 

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
